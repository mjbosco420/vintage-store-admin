import { createClient } from '@sanity/client'

const sanityWriteToken = import.meta.env.VITE_SANITY_WRITE_TOKEN

const orderClient = createClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
  token: sanityWriteToken,
  ignoreBrowserTokenWarning: true,
})

const parsePrice = (price) => {
  if (typeof price === 'number') return price
  if (typeof price !== 'string') return 0

  const numericValue = Number(price.replace(/[^0-9.-]+/g, ''))

  return Number.isFinite(numericValue) ? numericValue : 0
}

const formatTotal = (items) => {
  const total = items.reduce(
    (sum, item) => sum + parsePrice(item.price) * (item.quantity || 1),
    0,
  )

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total)
}

export const submitWebsiteOrder = async ({ id, items, notes, orderedAt, shippingAddress, user }) => {
  if (!sanityWriteToken) {
    throw new Error('Server token is missing. Please stop your terminal (Ctrl+C) and restart it with: npm run dev -- --force')
  }

  return orderClient.create({
    _type: 'order',
    orderNumber: id,
    status: 'new',
    source: 'website',
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    shippingAddress,
    notes,
    orderTotal: formatTotal(items),
    orderedAt,
    orderSummaryEmailStatus: 'pending',
    trackingEmailStatus: 'pending',
    items: items.map((item) => ({
      _key: (item.id || '').replace(/[^a-zA-Z0-9-]/g, '') || Math.random().toString(36).slice(2),
      productId: item.id,
      productName: item.name,
      price: String(item.price),
      quantity: Number(item.quantity),
    })),
  })
}

export const getUserOrders = async (email) => {
  console.log('Token exists:', !!sanityWriteToken)
  console.log('Email:', email)
  if (!email || !sanityWriteToken) return []
  return orderClient.fetch(
    `*[_type == "order" && customerEmail == $email] | order(_createdAt desc) {
      orderNumber,
      status,
      trackingNumber,
      shippingCourier
    }`,
    { email }
  )
}
