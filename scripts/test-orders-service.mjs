import { createClient } from '@sanity/client'

const orderClient = createClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
  token: process.env.VITE_SANITY_WRITE_TOKEN,
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

const submitWebsiteOrder = async ({ id, items, notes, shippingAddress, user }) => {
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
    trackingEmailStatus: 'pending',
    items: items.map((item) => ({
      _key: item.id,
      productId: item.id,
      productName: item.name,
      price: String(item.price), // ensure string
      quantity: Number(item.quantity), // ensure number
    })),
  })
}

submitWebsiteOrder({
  id: 'TEST-1234',
  items: [{ id: 'test-item-1', name: 'Test Item', price: 20.00, quantity: 1 }], // price is number here for testing, wait, frontend sends formatted string?
  notes: 'Test notes',
  shippingAddress: '123 Test St',
  user: { name: 'Test User', email: 'test@example.com' }
}).then((res) => {
  console.log('Successfully created order:', res._id);
}).catch((err) => {
  console.error('Error creating order:', err.message);
  console.error(err.details);
  console.error(err.response?.body);
});
