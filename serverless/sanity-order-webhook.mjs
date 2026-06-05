const SANITY_PROJECT_ID = 'j7s2sxwm'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2025-05-01'

const getEnv = (name) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

const parsePrice = (price) => {
  if (typeof price === 'number') return price
  if (typeof price !== 'string') return 0

  const numericValue = Number(price.replace(/[^0-9.-]+/g, ''))

  return Number.isFinite(numericValue) ? numericValue : 0
}

const getOrderTotal = (items = []) =>
  items.reduce((total, item) => total + parsePrice(item.price) * (item.quantity || 1), 0)

const getOrderItemsHtml = (items = []) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.productName}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity || 1}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${item.price}</td>
        </tr>
      `,
    )
    .join('')

const sendTrackingEmail = async (order) => {
  const resendApiKey = getEnv('RESEND_API_KEY')
  const fromEmail = getEnv('TRACKING_FROM_EMAIL')
  const orderTotal = getOrderTotal(order.items)
  const trackingLine = order.trackingUrl
    ? `<a href="${order.trackingUrl}">${order.trackingNumber}</a>`
    : order.trackingNumber

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Your MJBOSCO order ${order.orderNumber} has shipped`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Your order has shipped</h2>
          <p>Hi ${order.customerName},</p>
          <p>Your order <strong>${order.orderNumber}</strong> is now on the way.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr>
                <th style="padding:8px 0;border-bottom:1px solid #ddd;text-align:left">Item</th>
                <th style="padding:8px 0;border-bottom:1px solid #ddd;text-align:center">Qty</th>
                <th style="padding:8px 0;border-bottom:1px solid #ddd;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>
              ${getOrderItemsHtml(order.items)}
            </tbody>
          </table>
          <p><strong>Total:</strong> ${formatCurrency(orderTotal)}</p>
          <p><strong>Courier:</strong> ${order.shippingCourier}</p>
          <p><strong>Tracking number:</strong> ${trackingLine}</p>
          <p>Thank you for shopping with MJBOSCO.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to send tracking email')
  }
}

const sendOrderSummaryEmail = async (order) => {
  const resendApiKey = getEnv('RESEND_API_KEY')
  const fromEmail = getEnv('TRACKING_FROM_EMAIL')
  const orderTotal = getOrderTotal(order.items)
  const orderedAt = order.orderedAt || order._createdAt
  const orderedAtText = orderedAt
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(orderedAt))
    : '-'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: order.customerEmail,
      subject: `MJBOSCO order summary ${order.orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Order summary</h2>
          <p>Hi ${order.customerName},</p>
          <p>Thank you for your order <strong>${order.orderNumber}</strong>.</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Order date:</strong> ${orderedAtText}</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr>
                <th style="padding:8px 0;border-bottom:1px solid #ddd;text-align:left">Item</th>
                <th style="padding:8px 0;border-bottom:1px solid #ddd;text-align:center">Qty</th>
                <th style="padding:8px 0;border-bottom:1px solid #ddd;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>
              ${getOrderItemsHtml(order.items)}
            </tbody>
          </table>
          <p><strong>Total:</strong> ${formatCurrency(orderTotal)}</p>
          <p>We will contact you for payment and shipping confirmation.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to send order summary email')
  }
}

const patchOrderEmailStatus = async (orderId, patch) => {
  const sanityToken = getEnv('SANITY_WRITE_TOKEN')
  const response = await fetch(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sanityToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mutations: [
          {
            patch: {
              id: orderId,
              set: patch,
            },
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    throw new Error(await response.text())
  }
}

const markProductsAsReserved = async (items) => {
  if (!items || items.length === 0) return

  const sanityToken = getEnv('SANITY_WRITE_TOKEN')
  const mutations = items
    .filter((item) => item.productId)
    .map((item) => ({
      patch: {
        id: item.productId,
        set: {
          isReserved: true,
        },
      },
    }))

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
    res.status(405).json({error: 'Method not allowed'})
    return
  }

  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET

  if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
    res.status(401).json({error: 'Unauthorized'})
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

  const shouldSendOrderSummaryEmail =
    order?._id &&
    order.status === 'new' &&
    order.source === 'website' &&
    order.customerEmail &&
    order.orderSummaryEmailStatus !== 'sent'

  // Always process if shipped to update products, even if email already sent
  if (!shouldSendTrackingEmail && !shouldSendOrderSummaryEmail && !isShipped) {
    res.status(200).json({ok: true, skipped: true})
    return
  }

  try {
    if (isShipped && order?.items) {
      await markProductsAsReserved(order.items)
    }

    if (shouldSendOrderSummaryEmail) {
      await sendOrderSummaryEmail(order)
      await patchOrderEmailStatus(order._id, {
        orderSummaryEmailStatus: 'sent',
        orderSummaryEmailSentAt: new Date().toISOString(),
        orderSummaryEmailError: '',
      })
    }

    if (shouldSendTrackingEmail) {
      await sendTrackingEmail(order)
      await patchOrderEmailStatus(order._id, {
        trackingEmailStatus: 'sent',
        trackingEmailSentAt: new Date().toISOString(),
        trackingEmailError: '',
      })
    }

    res.status(200).json({ok: true})
  } catch (error) {
    if (shouldSendOrderSummaryEmail) {
      await patchOrderEmailStatus(order._id, {
        orderSummaryEmailStatus: 'failed',
        orderSummaryEmailError: error.message,
      })
    }

    if (shouldSendTrackingEmail) {
      await patchOrderEmailStatus(order._id, {
        trackingEmailStatus: 'failed',
        trackingEmailError: error.message,
      })
    }

    res.status(500).json({error: error.message})
  }
}
