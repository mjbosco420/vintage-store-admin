import { createClient } from '@sanity/client'

const sanityWriteToken = process.env.VITE_SANITY_WRITE_TOKEN

const orderClient = createClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
  token: sanityWriteToken,
})

async function run() {
  try {
    const res = await orderClient.create({
      _type: 'order',
      orderNumber: 'TEST-1234',
      status: 'new',
      source: 'website',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      shippingAddress: '123 Test St',
      notes: 'Test notes',
      orderTotal: '$20.00',
      trackingEmailStatus: 'pending',
      items: [
        {
          _key: 'test-item-1',
          productId: 'test-item-1',
          productName: 'Test Item',
          price: '$20.00',
          quantity: 1,
        }
      ],
    })
    console.log('Successfully created order:', res._id)
    await orderClient.delete(res._id)
  } catch (error) {
    console.error('Error creating order:', error.message)
    console.error(error.details)
    console.error(error.response?.body)
  }
}

run()
