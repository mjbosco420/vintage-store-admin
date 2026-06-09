import bcrypt from 'bcryptjs'
import { createClient } from '@sanity/client'
import { rateLimit } from './_rateLimit.js'

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
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const { limited } = rateLimit(ip, 'login', 5, 60_000)
  if (limited) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const client = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2025-05-01',
      useCdn: false,
      token: sanityToken,
    })

    const customer = await client.fetch(
      '*[_type == "customer" && email == $email][0]',
      { email: email.trim().toLowerCase() }
    )

    if (!customer) {
      return res.status(401).json({ message: 'Email or password is incorrect.' })
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email or password is incorrect.' })
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
    return res.status(500).json({ message: error.message })
  }
}
