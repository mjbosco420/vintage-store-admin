import { useCallback, useEffect, useState } from 'react'
import { fetchProducts, updateProductLike, updateProductViews } from '../services/products'
import { clearLikedProducts, saveLikedProducts, saveProductLikes } from '../utils/storage'
import { client } from '../sanity'

// Helper untuk update wishlist ke server (user login) atau localStorage (anonim)
const syncWishlistToStorage = async (userId, productId, action, updatedProducts) => {
  if (userId) {
    // User login → simpan ke Sanity via API
    await fetch('/api/update-user-wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, action }),
    })
  } else {
    // User anonim → simpan ke localStorage
    saveProductLikes(updatedProducts)
    saveLikedProducts(updatedProducts, userId)
  }
}

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
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    let isMounted = true

    const subscription = client.listen('*[_type == "product"]').subscribe((update) => {
      if (update?.result && isMounted) {
        setProducts((current) =>
          current.map((product) =>
            product.id === update.result._id
              ? {
                  ...product,
                  likes: update.result.likes || 0,
                  views: update.result.views || 0,
                  stock: update.result.stock,
                  isReserved: update.result.isReserved || false,
                }
              : product
          )
        )
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [userId])

  // ✅ Dibungkus useCallback agar tidak stale, userId sebagai dependency
  const handleLike = useCallback(
    (productId) => {
      console.log('handleLike called:', { productId, userId })
      const product = products.find((p) => p.id === productId)
      if (!product) return

      const isNowLiked = !product.isLiked
      const action = isNowLiked ? 'add' : 'remove'

      // Optimistic update dulu agar UI responsif
      setProducts((current) => {
        const updated = current.map((item) => {
          if (item.id !== productId) return item
          return {
            ...item,
            isLiked: isNowLiked,
            likes: isNowLiked
              ? (item.likes || 0) + 1
              : Math.max(0, (item.likes || 0) - 1),
          }
        })

        // ✅ localStorage hanya untuk user anonim, sisanya di-handle oleh syncWishlistToStorage
        if (!userId) {
          saveProductLikes(updated)
          saveLikedProducts(updated, userId)
        }

        return updated
      })

      // Update likes count global di product document (semua user)
      updateProductLike(productId, isNowLiked)

      // ✅ Update likedProducts array di customer document (hanya user login)
      if (userId) {
        fetch('/api/update-user-wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId, action }),
        }).catch((error) =>
          console.error('Failed to sync wishlist to server:', error)
        )
      }
    },
    [products, userId] // products diperlukan untuk find(), userId untuk kondisi
  )

  const handleViewProduct = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return

      setProducts((current) =>
        current.map((item) =>
          item.id === productId
            ? { ...item, views: (item.views || 0) + 1 }
            : item
        )
      )

      updateProductViews(productId)
    },
    [products]
  )

  const clearWishlist = useCallback(() => {
    setProducts((current) => {
      const updated = current.map((item) => ({ ...item, isLiked: false }))

      if (userId) {
        fetch('/api/update-user-wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action: 'clear' }),
        }).catch((error) =>
          console.error('Failed to clear wishlist on server:', error)
        )
      } else {
        // ✅ Hanya clear localStorage untuk user anonim
        clearLikedProducts(userId)
      }

      return updated
    })
  }, [userId])

  return {
    products,
    isLoading,
    loadProducts,
    handleLike,
    handleViewProduct,
    clearWishlist,
  }
}