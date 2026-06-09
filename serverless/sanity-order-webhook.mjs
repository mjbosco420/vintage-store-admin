import nodemailer from 'nodemailer'

const SANITY_PROJECT_ID = 'j7s2sxwm'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2025-05-01'

const emailUser = (process.env.EMAIL_USER || '').trim()
const emailPass = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '')

const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
  })

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const parsePrice = (price) => {
  if (typeof price === 'number') return price
  if (typeof price !== 'string') return 0
  const numericValue = Number(price.replace(/[^0-9.-]+/g, ''))
  return Number.isFinite(numericValue) ? numericValue : 0
}

const getOrderTotal = (items = []) =>
  items.reduce((total, item) => total + parsePrice(item.price) * (item.quantity || 1), 0)

const getItemsHtml = (items = []) =>
  items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;">${item.productName}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#888;">${item.quantity || 1}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#111;">${item.price}</td>
    </tr>
  `).join('')

const baseTemplate = ({ title, subtitle, customerName, orderNumber, bodyHtml, footerNote }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;padding:32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Vintage Stuff</p>
          <p style="margin:0;font-size:22px;color:#ffffff;letter-spacing:0.05em;">${title}</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 6px;font-size:13px;color:#888;">Hi, ${customerName}</p>
          <p style="margin:0;font-size:15px;color:#111;">${subtitle}</p>
        </td></tr>

        <!-- Order ID -->
        <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Order ID</p>
          <p style="margin:0;font-size:16px;font-weight:500;color:#111;">${orderNumber}</p>
        </td></tr>

        <!-- Body Content -->
        ${bodyHtml}

        <!-- Footer -->
        <tr><td style="padding:28px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;color:#555;">${footerNote}</p>
          <p style="margin:0;font-size:11px;color:#ccc;letter-spacing:0.1em;text-transform:uppercase;">Vintage Stuff · vintagestuff.vercel.app</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`

const sendTrackingEmail = async (order) => {
  const transporter = createTransporter()
  const orderTotal = getOrderTotal(order.items)
  const trackingLine = order.trackingUrl
    ? `<a href="${order.trackingUrl}" style="color:#111;font-weight:500;">${order.trackingNumber}</a>`
    : `<strong>${order.trackingNumber}</strong>`

  const bodyHtml = `
    <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
      <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Shipping info</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="50%" style="padding-bottom:12px;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Courier</p>
            <p style="margin:0;font-size:14px;color:#111;">${order.shippingCourier || '-'}</p>
          </td>
          <td width="50%" style="padding-bottom:12px;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Tracking number</p>
            <p style="margin:0;font-size:14px;">${trackingLine}</p>
          </td>
        </tr>
        ${order.shippingAddress ? `
        <tr>
          <td colspan="2">
            <p style="margin:0 0 4px;font-size:12px;color:#aaa;">Shipping address</p>
            <p style="margin:0;font-size:14px;color:#111;">${order.shippingAddress}</p>
          </td>
        </tr>` : ''}
      </table>
    </td></tr>

    <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
      <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">Items ordered</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <th style="padding:0 0 8px;font-size:11px;color:#aaa;text-align:left;font-weight:400;">Item</th>
          <th style="padding:0 0 8px;font-size:11px;color:#aaa;text-align:center;font-weight:400;">Qty</th>
          <th style="padding:0 0 8px;font-size:11px;color:#aaa;text-align:right;font-weight:400;">Price</th>
        </tr>
        ${getItemsHtml(order.items)}
        <tr>
          <td colspan="2" style="padding-top:14px;font-size:13px;color:#888;">Total</td>
          <td style="padding-top:14px;text-align:right;font-size:18px;font-weight:500;color:#111;">${formatCurrency(orderTotal)}</td>
        </tr>
      </table>
    </td></tr>

    ${order.trackingUrl ? `
    <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;text-align:center;">
      <a href="${order.trackingUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;font-size:13px;padding:12px 28px;border-radius:30px;text-decoration:none;letter-spacing:0.05em;">Track your package</a>
    </td></tr>` : ''}
  `

  const html = baseTemplate({
    title: 'Your order is on the way',
    subtitle: 'Great news! Your order has been shipped and is on its way to you.',
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    bodyHtml,
    footerNote: 'Thank you for shopping with us!',
  })

  await transporter.sendMail({
    from: `"Vintage Stuff" <${emailUser}>`,
    to: order.customerEmail,
    subject: `Your order ${order.orderNumber} has shipped 🚚`,
    html,
  })
}

const patchOrderEmailStatus = async (orderId, patch) => {
  const sanityToken = process.env.SANITY_SECRET_API_TOKEN || process.env.VITE_SANITY_WRITE_TOKEN || ''
  const response = await fetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sanityToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mutations: [{ patch: { id: orderId, set: patch } }],
      }),
    },
  )
  if (!response.ok) {
    throw new Error(await response.text())
  }
}

const markProductsAsReserved = async (items) => {
  if (!items || items.length === 0) return
  const sanityToken = process.env.SANITY_SECRET_API_TOKEN || process.env.VITE_SANITY_WRITE_TOKEN || ''
  const mutations = items
    .filter((item) => item.productId)
    .map((item) => ({ patch: { id: item.productId, set: { isReserved: true } } }))
  if (mutations.length === 0) return
  const response = await fetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sanityToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mutations }),
    },
  )
  if (!response.ok) {
    console.error('Failed to mark products as reserved:', await response.text())
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
  if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const order = req.body
  const isShipped = order?.status === 'shipped'

  const shouldSendTrackingEmail =
    order?._id &&
    isShipped &&
    order.customerEmail &&
    order.trackingNumber &&
    order.trackingEmailStatus !== 'sent'

  if (!shouldSendTrackingEmail && !isShipped) {
    res.status(200).json({ ok: true, skipped: true })
    return
  }

  try {
    if (isShipped && order?.items) {
      await markProductsAsReserved(order.items)
    }

    if (shouldSendTrackingEmail) {
      await sendTrackingEmail(order)
      await patchOrderEmailStatus(order._id, {
        trackingEmailStatus: 'sent',
        trackingEmailSentAt: new Date().toISOString(),
        trackingEmailError: '',
      })
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    if (shouldSendTrackingEmail) {
      await patchOrderEmailStatus(order._id, {
        trackingEmailStatus: 'failed',
        trackingEmailError: error.message,
      }).catch(console.error)
    }
    res.status(500).json({ error: error.message })
  }
}