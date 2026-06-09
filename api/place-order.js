import { createClient } from '@sanity/client'
import nodemailer from 'nodemailer'
import { rateLimit } from './_rateLimit.js'
import { checkCsrf } from './_csrf.js'

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
const adminEmail = (process.env.ADMIN_EMAIL || emailUser).trim()

const getImageUrl = (imageAsset) => {
  if (!imageAsset?.asset?._ref) return null
  const ref = imageAsset.asset._ref
  const [, id, dimensions, format] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) || []
  if (!id) return null
  return `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/${id}-${dimensions}.${format}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!checkCsrf(req, res)) return

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
      return res.status(500).json({ message: 'SANITY_SECRET_API_TOKEN or VITE_SANITY_WRITE_TOKEN must be configured.' })
    }
    if (!emailUser || !emailPass) {
      return res.status(500).json({ message: 'EMAIL_USER and EMAIL_APP_PASSWORD must be configured.' })
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

    let calculatedTotalIdr = 0
    const orderItems = []
    const emailItems = []

    let USD_EXCHANGE_RATE = 18129
    try {
      const rateResponse = await fetch('https://open.er-api.com/v6/latest/USD')
      const rateData = await rateResponse.json()
      if (rateData?.rates?.IDR) USD_EXCHANGE_RATE = rateData.rates.IDR
    } catch (rateError) {
      console.error('Failed to fetch exchange rate, using fallback:', rateError)
    }

    for (const item of items) {
      const realProduct = await serverClient.getDocument(item.id)
      if (!realProduct) {
        return res.status(404).json({ message: `Product ${item.id} not found` })
      }
      const priceIdr = Number(realProduct.price) || 0
      calculatedTotalIdr += priceIdr * item.quantity

      const firstImage = realProduct.images?.[0] || null
      const imageUrl = getImageUrl(firstImage)

      // Menghitung harga USD per item dan dibulatkan paksa ke 2 desimal standar mata uang
      const priceUsdString = (priceIdr / USD_EXCHANGE_RATE).toFixed(2)

      orderItems.push({
        _key: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.id,
        productName: realProduct.name || realProduct.title || 'Unknown Product',
        price: priceUsdString, 
        quantity: item.quantity,
      })
      
      emailItems.push({
        name: realProduct.name || realProduct.title || `Item ${item.id}`,
        quantity: item.quantity,
        priceUsd: Number(priceUsdString), // Simpan dalam format USD yang sudah rapi untuk email
        imageUrl,
      })
    }

    // Hitung total akhir dalam USD berdasarkan pembulatan item
    const orderTotalUsdString = (calculatedTotalIdr / USD_EXCHANGE_RATE).toFixed(2)

    const newOrder = await serverClient.create({
      _type: 'order',
      orderNumber: id,
      customerId: user.id,
      customerName: user?.name || 'Guest',
      customerEmail: user?.email || '',
      shippingAddress: (shippingAddress || '-').replace(/[<>]/g, ''),
      notes: (notes || '-').replace(/[<>]/g, ''),
      orderTotal: orderTotalUsdString,
      orderedAt: orderedAt,
      status: 'new',
      paymentMethod: paymentMethod || 'Website',
      items: orderItems,
    })

    const orderDate = new Date(orderedAt || Date.now())
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    }).format(orderDate)
    const formattedDateShort = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(orderDate)
    
    // Formatter USD murni tanpa perlu membagi nilai IDR lagi di dalamnya
    const usdFormatter = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    
    const totalFormatted = usdFormatter.format(Number(orderTotalUsdString))

    const itemsHtmlCustomer = emailItems.map((item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="64" style="vertical-align: top; padding-right: 14px;">
                ${item.imageUrl
                  ? `<img src="${item.imageUrl}" width="64" height="64" style="border-radius: 8px; object-fit: cover; display: block;" alt="${item.name}" />`
                  : `<div style="width:64px;height:64px;background:#f5f5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;"></div>`
                }
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 500; color: #111;">${item.name}</p>
                <p style="margin: 0; font-size: 13px; color: #888;">Qty: ${item.quantity}</p>
              </td>
              <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                <p style="margin: 0; font-size: 14px; font-weight: 500; color: #111;">${usdFormatter.format(item.priceUsd * item.quantity)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('')

    const itemsHtmlAdmin = emailItems.map((item) => `<li>${item.name} (x${item.quantity}) — ${usdFormatter.format(item.priceUsd * item.quantity)}</li>`).join('')

    const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

        <tr><td style="background:#0a0a0a;padding:32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Vintage Stuff</p>
          <p style="margin:0;font-size:22px;color:#ffffff;letter-spacing:0.05em;">Order Confirmed</p>
        </td></tr>

        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 6px;font-size:13px;color:#888;">Hi, ${user.name || 'there'}</p>
          <p style="margin:0;font-size:15px;color:#111;">Your order has been received and is being processed.</p>
        </td></tr>

        <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Order ID</p>
                <p style="margin:0;font-size:16px;font-weight:500;color:#111;">${id}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Date</p>
                <p style="margin:0;font-size:14px;color:#111;">${formattedDateShort}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Items ordered</p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${itemsHtmlCustomer}
            <tr><td style="padding-top:16px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size:13px;color:#888;">Total paid</td>
                  <td style="text-align:right;font-size:18px;font-weight:500;color:#111;">${totalFormatted}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Delivery details</p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="50%" style="padding-bottom:12px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Payment method</p>
                <p style="margin:0;font-size:14px;color:#111;">${paymentMethod || 'Website'}</p>
              </td>
              <td width="50%" style="padding-bottom:12px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Status</p>
                <span style="display:inline-block;background:#e6f4ea;color:#1a7f3c;font-size:12px;padding:2px 10px;border-radius:20px;">Processing</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Shipping address</p>
                <p style="margin:0;font-size:14px;color:#111;">${shippingAddress || '-'}</p>
              </td>
            </tr>
            ${notes ? `<tr><td colspan="2" style="padding-top:12px;">
              <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Notes</p>
              <p style="margin:0;font-size:14px;color:#111;">${notes}</p>
            </td></tr>` : ''}
          </table>
        </td></tr>

        <tr><td style="padding:28px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;color:#555;">Thank you for shopping with us!</p>
          <p style="margin:0 0 20px;font-size:13px;color:#aaa;">We'll notify you once your order ships.</p>
          <p style="margin:0;font-size:11px;color:#ccc;letter-spacing:0.1em;text-transform:uppercase;">Vintage Stuff · vintagestuff.vercel.app</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `

    await transporter.verify()

    // Email ke customer
    if (user?.email) {
      try {
        await transporter.sendMail({
          from: `"Vintage Stuff" <${emailUser}>`,
          to: user.email.trim(),
          subject: `Order Confirmed – ${id}`,
          html: customerEmailHtml,
        })
      } catch (emailError) {
        console.error('Failed to send customer email (non-fatal):', emailError)
      }
    }

    // Email notifikasi ke admin
    try {
      await transporter.sendMail({
        from: `"Vintage Stuff" <${emailUser}>`,
        to: adminEmail,
        subject: `🛒 New Order – ${id}`,
        html: `
          <h2>New Order Received!</h2>
          <p>Order <strong>${id}</strong> placed on ${formattedDate}.</p>
          <h3>Customer Info:</h3>
          <p><strong>Name:</strong> ${user.name || 'Guest'}<br>
          <strong>Email:</strong> ${user.email || '-'}<br>
          <strong>Payment:</strong> ${paymentMethod || 'Website'}</p>
          <h3>Shipping Address:</h3>
          <p>${shippingAddress || '-'}</p>
          ${notes ? `<h3>Notes:</h3><p>${notes}</p>` : ''}
          <h3>Items:</h3>
          <ul>${itemsHtmlAdmin}</ul>
          <p><strong>Total:</strong> ${totalFormatted}</p>
          <br>
          <a href="https://vintage-store.sanity.studio/structure/allOrders" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">View in Sanity Studio</a>
        `,
      })
    } catch (adminEmailError) {
      console.error('Failed to send admin email (non-fatal):', adminEmailError)
    }

    return res.status(200).json({ success: true, order: newOrder })

  } catch (error) {
    console.error('Order processing failed:', error)
    if (error.statusCode === 401 && error.message.includes('project user not found')) {
      return res.status(500).json({
        message: `Authentication Error: token starting with ${sanityToken.substring(0, 6)}... has no access to project j7s2sxwm.`,
      })
    }
    if (error.statusCode === 403 || (error.message && error.message.includes('Insufficient permissions'))) {
      return res.status(500).json({
        message: `Permission Denied: token from ${sanityTokenSource} lacks create permission on dataset ${sanityDataset}.`,
      })
    }
    return res.status(500).json({ message: error.message || 'Failed to process order on server.' })
  }
}