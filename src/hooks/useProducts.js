import { useCallback, useEffect, useState } from 'react'
import { fetchProducts, updateProductLike, updateProductViews } from '../services/products'
import { saveLikedProducts, saveProductLikes } from '../utils/storage'
import { client } from '../sanity'

export const useProducts = (currentUser) => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const userId = currentUser?.id

  useEffect(() => {
    setProducts([])
  }, [userId])

  const loadProducts = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await fetchProducts(userId)
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    let isMounted = true

    // Listen for real-time updates from Sanity
    const subscription = client.listen('*[_type == "product"]').subscribe((update) => {
      if (update && update.result && isMounted) {
        setProducts((currentProducts) => {
          return currentProducts.map((product) => {
            if (product.id === update.result._id) {
              return {
                ...product,
                likes: update.result.likes || 0,
                views: update.result.views || 0,
                stock: update.result.stock,
                isReserved: update.result.isReserved || false,
              }
            }
            return product
          })
        })
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [userId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleLike = (productId) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const isNowLiked = !product.isLiked

    // Optimistically update local state
    setProducts((current) => {
      const updated = current.map((item) => {
        if (item.id !== productId) return item

        return {
          ...item,
          isLiked: isNowLiked,
          // The exact like count will be eventually synced from the server listener
          likes: isNowLiked ? (item.likes || 0) + 1 : Math.max(0, (item.likes || 0) - 1),
        }
      })

      saveProductLikes(updated)
      saveLikedProducts(updated, userId)
      return updated
    })

    // Update global likes in Sanity database
    updateProductLike(productId, isNowLiked)
  }

  const handleViewProduct = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return

      setProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, views: (item.views || 0) + 1 } : item
        )
      )

      updateProductViews(productId)
    },
    [products],
  )

  const clearWishlist = () => {
    setProducts((current) => {
      const updated = current.map((item) => ({ ...item, isLiked: false }))
      saveProductLikes(updated)
      saveLikedProducts(updated, userId)
      return updated
    })
  }

  return {
    products,
    isLoading,
    loadProducts,
    handleLike,
    handleViewProduct,
    clearWishlist,
  }
}
