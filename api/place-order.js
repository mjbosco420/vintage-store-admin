import { createClient } from '@sanity/client'
import nodemailer from 'nodemailer'

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

// NOTE: don't throw at module import time — return JSON errors from handler instead.
// We'll create the Sanity client and SMTP transporter inside the handler after validating envs.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id, items, shippingAddress, notes, orderedAt, user } = req.body

    // Runtime validation for required server env vars (avoid crashing at import)
    if (!sanityToken) {
      return res.status(500).json({ message: 'SANITY_SECRET_API_TOKEN or VITE_SANITY_WRITE_TOKEN must be configured for server-side order processing.' })
    }
    if (!emailUser || !emailPass) {
      return res.status(500).json({ message: 'EMAIL_USER and EMAIL_APP_PASSWORD (or EMAIL_PASSWORD) must be configured on the server.' })
    }

    // Create Sanity server client now that token exists
    const serverClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2025-05-01',
      useCdn: false,
      token: sanityToken,
    })

    // Configure SMTP transporter lazily
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })

    // --- 1. VALIDASI BACKEND (Bypass Protection) ---
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }
    if (shippingAddress?.length > 500 || notes?.length > 500) {
      return res.status(400).json({ message: 'Input exceeds maximum length limit' })
    }

    // --- 2. PENGECEKAN HARGA ASLI (Price Tampering Protection) ---
    let calculatedTotal = 0
    const orderItems = []
    const emailItems = [] // Untuk dirangkum di dalam email

    for (const item of items) {
      // Ambil harga asli langsung dari Sanity Database berdasarkan ID
      const realProduct = await serverClient.getDocument(item.id)
      
      if (!realProduct) {
        return res.status(404).json({ message: `Product ${item.id} not found` })
      }

      // Hitung total menggunakan harga asli dari database
      const price = Number(realProduct.price) || 0
      calculatedTotal += price * item.quantity

      // Susun referensi produk untuk disimpan di order Sanity
      orderItems.push({
        _key: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product: { _type: 'reference', _ref: item.id },
        quantity: item.quantity,
        priceAtPurchase: price // Catat harga saat transaksi terjadi
      })

      // Simpan data produk yang asli untuk laporan email
      emailItems.push({
        name: realProduct.name || realProduct.title || `Item ${item.id}`,
        quantity: item.quantity,
        price: price
      })
    }

    // --- 3. BUAT PESANAN DI SANITY (Secure Token Usage) ---
    const newOrder = await serverClient.create({
      _type: 'order',
      orderId: id,
      customerName: user?.name || 'Guest',
      customerEmail: user?.email || '',
      shippingAddress: (shippingAddress || '-').replace(/[<>]/g, ''), // XSS sanitize
      notes: (notes || '-').replace(/[<>]/g, ''), // XSS sanitize
      totalAmount: calculatedTotal,
      items: orderItems,
      status: 'pending',
      orderDate: orderedAt,
    })

    // --- 4. KIRIM EMAIL KONFIRMASI PEMBELIAN ---
    if (user?.email) {
      try {
        const orderDate = new Date(orderedAt || Date.now())
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        }).format(orderDate)

        const usdFormatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        })
        const USD_EXCHANGE_RATE = 16000

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
            <p>Your order <strong>${id}</strong> has been successfully placed. Here are the details of your purchase:</p>
            <h3>Order Summary:</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Total Paid:</strong> ${formatUsd(calculatedTotal)}</p>
            <p><strong>Date of Purchase:</strong> ${formattedDate}</p>
            <br/>
            <p>Have a good day!</p>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send order email:', emailError)
        return res.status(500).json({ message: 'Pesanan berhasil dibuat, tetapi email konfirmasi gagal dikirim. ' + (emailError.message || 'Periksa konfigurasi EMAIL_USER / EMAIL_APP_PASSWORD.') })
      }
    }

    // Kirim respons sukses kembali ke Frontend
    return res.status(200).json({ success: true, order: newOrder })

  } catch (error) {
    console.error('Order processing failed:', error)

    // Cek spesifik untuk error "project user not found"
    if (error.statusCode === 401 && error.message.includes('project user not found')) {
      return res.status(500).json({
        message: `Authentication Error: Token Sanity yang sedang dipakai Vercel saat ini (berawalan ${sanityToken.substring(0, 6)}...) tidak memiliki akses ke project j7s2sxwm. Anda salah memasukkan token dari project lain.`,
      })
    }

    // Cek spesifik untuk error "insufficient permissions"
    if (error.statusCode === 403 || (error.message && error.message.includes('Insufficient permissions'))) {
      return res.status(500).json({
        message: `Izin Ditolak: token server dari ${sanityTokenSource} tidak punya izin create di dataset ${sanityDataset}. Pastikan Anda menggunakan Sanity server token dengan permission write/create untuk project ${sanityProjectId}, bukan token viewer publik.`,
      })
    }

    return res.status(500).json({ 
      message: error.message || 'Gagal memproses pesanan di server.' 
    })
  }
}