import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const tokenLine = envContent.split('\n').find(line => line.startsWith('VITE_SANITY_WRITE_TOKEN='))
const token = tokenLine ? tokenLine.split('=')[1].trim() : null

if (!token) {
  console.error('Token not found in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
  token,
})

async function testSanity() {
  try {
    const res = await client.create({
      _type: 'order',
      orderNumber: 'TEST-' + Date.now(),
      status: 'new',
      source: 'website',
      customerName: 'Test Name',
      customerEmail: 'test@example.com',
      shippingAddress: 'Test Address',
      notes: 'Test notes',
      orderTotal: '$ 10.00',
      trackingEmailStatus: 'pending',
      items: [
        {
          _key: 'b949980d-85fa-4394-bb9b-bce9dcceddc1',
          productId: 'b949980d-85fa-4394-bb9b-bce9dcceddc1',
          productName: 'Test Item',
          price: '$ 10.00',
          quantity: 1,
        }
      ]
    })
    console.log('Successfully created test order:', res._id)
    
    // Cleanup
    await client.delete(res._id)
    console.log('Cleaned up test order')
  } catch (error) {
    console.error('Sanity Error:', error.message)
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2))
    }
  }
}

testSanity()