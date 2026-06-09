import { createClient } from '@sanity/client'
import nodemailer from 'nodemailer'
import { rateLimit } from './_rateLimit.js'

const sanityToken = (process.env.SANITY_SECRET_API_TOKEN || process.env.VITE_SANITY_WRITE_TOKEN || '').trim()
const sanityTokenSource = process.env.SANITY_SECRET_API_TOKEN
  ? 'SANITY_SECRET_API_TOKEN'
  : process.env.VITE_SANITY_WRITE_TOKEN
  ? 'VITE_SANITY_WRITE_TOKEN'
  : 'NONE'
const sanityProjectId = (process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'j7s2sxwm').trim()
const sanityDataset = (process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production').trim()
const emailUser = (process.env.EMAIL_USER || '').trim()
const emailPass = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const { limited } = rateLimit(ip, 'place-order', 5, 60_000)
  if (limited) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' })
  }

  try {
    const { id, items, shippingAddress, notes, orderedAt, user, paymentMethod } = req.body

    if (!user || !user.id) {
      return res.status(401).json({ message: 'Authentication required to place an order.' })
    }

    if (!sanityToken) {
      return res.status(500).json({ message: 'SANITY_SECRET_API_TOKEN or VITE_SANITY_WRITE_TOKEN must be configured for server-side order processing.' })
    }
    if (!emailUser || !emailPass) {
      return res.status(500).json({ message: 'EMAIL_USER and EMAIL_APP_PASSWORD (or EMAIL_PASSWORD) must be configured on the server.' })
    }

    const serverClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2025-05-01',
      useCdn: false,
      token: sanityToken,
    })

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
    })

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }
    if (shippingAddress?.length > 500 || notes?.length > 500) {
      return res.status(400).json({ message: 'Input exceeds maximum length limit' })
    }

    let calculatedTotal = 0
    const orderItems = []
    const emailItems = []

    console.log("ORDER BODY:", JSON.stringify(req.body, null, 2))

    let USD_EXCHANGE_RATE = 18129
    try {
      const rateResponse = await fetch('https://open.er-api.com/v6/latest/USD')
      const rateData = await rateResponse.json()
      if (rateData?.rates?.IDR) USD_EXCHANGE_RATE = rateData.rates.IDR
    } catch (rateError) {
      console.error('Failed to fetch dynamic exchange rate, using fallback:', rateError)
    }
    console.log(`Using USD exchange rate: ${USD_EXCHANGE_RATE}`)

    for (const item of items) {
      const realProduct = await serverClient.getDocument(item.id)
      if (!realProduct) {
        return res.status(404).json({ message: `Product ${item.id} not found` })
      }
      const price = Number(realProduct.price) || 0
      calculatedTotal += price * item.quantity
      orderItems.push({
        _key: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.id,
        productName: realProduct.name || realProduct.title || 'Unknown Product',
        price: String(price / USD_EXCHANGE_RATE),
        quantity: item.quantity,
      })
      emailItems.push({
        name: realProduct.name || realProduct.title || `Item ${item.id}`,
        quantity: item.quantity,
        price: price,
      })
    }

    const newOrder = await serverClient.create({
      _type: 'order',
      orderNumber: id,
      customerId: user.id,
      customerName: user?.name || 'Guest',
      customerEmail: user?.email || '',
      shippingAddress: (shippingAddress || '-').replace(/[<>]/g, ''),
      notes: (notes || '-').replace(/[<>]/g, ''),
      orderTotal: String(calculatedTotal / USD_EXCHANGE_RATE),
      orderedAt: orderedAt,
      status: 'new',
      paymentMethod: paymentMethod || 'Website',
      items: orderItems,
    })

    if (user?.email) {
      try {
        const orderDate = new Date(orderedAt || Date.now())
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
        }).format(orderDate)
        const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
        const formatUsd = (value) => usdFormatter.format(value / USD_EXCHANGE_RATE)
        const itemsHtml = emailItems
          .map((item) => `<li><strong>${item.name}</strong> (x${item.quantity}) - ${formatUsd(item.price * item.quantity)}</li>`)
          .join('')
        await transporter.verify()
        await transporter.sendMail({
          from: `"Vintage Store" <${emailUser}>`,
          to: user.email.trim(),
          subject: `Order Confirmation - ${id}`,
          html: `
            <h2>Thank you for shopping with us, ${user.name || 'Guest'}!</h2>
            <p>Your order <strong>${id}</strong> has been successfully placed. Here are your purchase details:</p>
            <p><strong>Payment Method:</strong> ${paymentMethod || 'Website'}</p>
            <p><strong>Shipping Address:</strong> ${shippingAddress || '-'}</p>
            ${notes ? `<p><strong>Customer Notes:</strong> ${notes}</p>` : ''}
            <h3>Order Summary:</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Total Paid:</strong> ${formatUsd(calculatedTotal)}</p>
            <p><strong>Purchase Date:</strong> ${formattedDate}</p>
            <br/>
            <p>Have a great day!</p>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send order email (non-fatal):', emailError)
      }
    }

    return res.status(200).json({ success: true, order: newOrder })

  } catch (error) {
    console.error('Order processing failed:', error)
    if (error.statusCode === 401 && error.message.includes('project user not found')) {
      return res.status(500).json({
        message: `Authentication Error: The Sanity token currently used (starting with ${sanityToken.substring(0, 6)}...) does not have access to project j7s2sxwm.`,
      })
    }
    if (error.statusCode === 403 || (error.message && error.message.includes('Insufficient permissions'))) {
      return res.status(500).json({
        message: `Permission Denied: The server token from ${sanityTokenSource} does not have create permission on dataset ${sanityDataset}.`,
      })
    }
    return res.status(500).json({ message: error.message || 'Failed to process order on server.' })
  }
}
