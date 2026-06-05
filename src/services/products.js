import { client, urlFor } from '../sanity'
import { createClient } from '@sanity/client'
import { NEW_DROP_DAYS } from '../constants/shop'
import { formatPrice } from '../utils/formatters'
import { getLikedProducts, getSavedLikes } from '../utils/storage'

const sanityWriteToken = import.meta.env.VITE_SANITY_WRITE_TOKEN

const writeClient = sanityWriteToken
  ? createClient({
      projectId: 'j7s2sxwm',
      dataset: 'production',
      apiVersion: '2025-05-01',
      useCdn: false,
      token: sanityWriteToken,
      ignoreBrowserTokenWarning: true,
    })
  : null

const PRODUCT_QUERY = `*[_type == "product"]{
  _id,
  title,
  price,
  images,
  category,
  description,
  stock,
  isReserved,
  sizes,
  likes,
  views,
  _createdAt
}`

const resolveImageUrls = (product) =>
  (product.images || [])
    .map((image) => {
      try {
        return urlFor(image).url()
      } catch (error) {
        console.warn('Unable to resolve Sanity image URL for product', product._id, error)
        return null
      }
    })
    .filter(Boolean)

const mapProduct = (product, savedLikes, likedProducts) => {
  const images = resolveImageUrls(product)
  const createdAt = product._createdAt ? new Date(product._createdAt).getTime() : null
  const isNewDrop = createdAt
    ? Date.now() - createdAt <= NEW_DROP_DAYS * 24 * 60 * 60 * 1000
    : false

  return {
    id: product._id,
    name: product.title,
    price: formatPrice(product.price),
    image: images[0] || '/bg.jpg',
    category: product.category,
    desc: product.description,
    images,
    stock: product.stock,
    isReserved: product.isReserved || false,
    sizes: product.sizes || [],
    isNewDrop,
    isLiked: Boolean(likedProducts[product._id]),
    likes: product.likes || 0,
    views: product.views || 0,
    createdAt,
  }
}

const sortNewestFirst = (a, b) => (b.createdAt || 0) - (a.createdAt || 0)

const sortProducts = (products) => {
  const available = products.filter((product) => product.stock > 0 && !product.isReserved).sort(sortNewestFirst)
  const sold = products.filter((product) => product.stock === 0 || product.isReserved).sort(sortNewestFirst)

  return [...available, ...sold]
}

export const fetchProducts = async () => {
  const savedLikes = getSavedLikes()
  const likedProducts = getLikedProducts()
  const products = await client.fetch(PRODUCT_QUERY)

  return sortProducts(products.map((product) => mapProduct(product, savedLikes, likedProducts)))
}

export const updateProductLike = async (productId, increment) => {
  if (!writeClient) {
    console.warn('Sanity write token is missing. Like will only be saved locally.')
    return
  }

  try {
    await writeClient
      .patch(productId)
      .setIfMissing({ likes: 0 })
      .inc({ likes: increment ? 1 : -1 })
      .commit()
  } catch (error) {
    console.error('Failed to update likes in Sanity:', error)
  }
}

export const updateProductViews = async (productId) => {
  if (!writeClient) {
    console.warn('Sanity write token is missing. Views will only be saved locally.')
    return
  }

  try {
    await writeClient
      .patch(productId)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit()
  } catch (error) {
    console.error('Failed to update views in Sanity:', error)
  }
}
