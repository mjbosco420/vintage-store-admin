import { createClient } from '@sanity/client'

const sanityToken = (
  process.env.SANITY_SECRET_API_TOKEN ||
  process.env.VITE_SANITY_WRITE_TOKEN ||
  ''
).trim()

const sanityProjectId = (
  process.env.VITE_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  'j7s2sxwm'
).trim()

const sanityDataset = (
  process.env.VITE_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production'
).trim()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed',
    })
  }

  try {
    const { email, password } = req.body

    const client = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2025-05-01',
      useCdn: false,
      token: sanityToken,
    })

    const customer = await client.fetch(
      '*[_type == "customer" && email == $email && password == $password][0]',
      {
        email: email.trim().toLowerCase(),
        password,
      }
    )

    if (!customer) {
      return res.status(401).json({
        message: 'Email or password is incorrect.',
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    })
  } catch (error) {
    console.error('Login failed:', error)

    return res.status(500).json({
      message: error.message,
    })
  }
}