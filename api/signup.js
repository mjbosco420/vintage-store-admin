import { createClient } from '@sanity/client'

const sanityToken = (process.env.SANITY_SECRET_API_TOKEN || '').trim()

const client = createClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
  token: sanityToken,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    const existing = await client.fetch(
      '*[_type == "customer" && email == $email][0]',
      { email: email.toLowerCase() }
    )

    if (existing) {
      return res.status(400).json({
        message: 'Email already registered',
      })
    }

    const customer = await client.create({
      _type: 'customer',
      name,
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    })

    return res.status(200).json({
      success: true,
      customerId: customer._id,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: error.message,
    })
  }
}