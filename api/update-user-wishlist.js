import { createClient } from '@sanity/client'
import { rateLimit } from './_rateLimit.js'
import { checkCsrf } from './_csrf.js'

const sanityToken = (process.env.SANITY_SECRET_API_TOKEN || process.env.VITE_SANITY_WRITE_TOKEN || '').trim()
const sanityProjectId = (process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'j7s2sxwm').trim()
const sanityDataset = (process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production').trim()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!checkCsrf(req, res)) return

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const { limited } = rateLimit(ip, 'update-wishlist', 10, 60_000) // 10 requests per minute
  if (limited) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' })
  }

  try {
    const { userId, productId, action } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }
    if (!productId && action !== 'clear') { // productId is optional for 'clear' action
      return res.status(400).json({ message: 'Product ID is required for this action.' })
    }
    if (!['add', 'remove', 'clear'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "add", "remove", or "clear".' })
    }
    if (!sanityToken) {
      return res.status(500).json({ message: 'SANITY_SECRET_API_TOKEN or VITE_SANITY_WRITE_TOKEN must be configured.' })
    }

    const serverClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2025-05-01',
      useCdn: false,
      token: sanityToken,
    })

    let patchOperation;
    if (action === 'add') {
      patchOperation = serverClient
        .patch(userId)
        .setIfMissing({ likedProducts: [] })
        .insert('after', 'likedProducts[-1]', [productId]);
    } else if (action === 'remove') {
      patchOperation = serverClient
        .patch(userId)
        .unset([`likedProducts[_eq=="${productId}"]`]);
    } else if (action === 'clear') {
      patchOperation = serverClient
        .patch(userId)
        .set({ likedProducts: [] });
    }

    const result = await patchOperation.commit();

    return res.status(200).json({ success: true, likedProducts: result.likedProducts })

  } catch (error) {
    console.error('Failed to update user wishlist:', error)
    return res.status(500).json({ message: error.message || 'Failed to update wishlist on server.' })
  }
}