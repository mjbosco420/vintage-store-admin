import { useMemo, useState } from 'react'

const canAddProduct = (product, quantity = 1) => {
  if (!product || product.stock === 0) return false
  if (typeof product.stock !== 'number') return true
  return quantity < product.stock
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const addToCart = (product) => {
    if (!canAddProduct(product, 0)) return

    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === product.id)

      if (existingItem) {
        return current.map((item) =>
          item.id === product.id && canAddProduct(product, item.quantity)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity: 1,
        },
      ]
    })

    setIsCartOpen(true)
  }

  const removeFromCart = (productId) => {
    setCartItems((current) => current.filter((item) => item.id !== productId))
  }

  const decreaseQuantity = (productId) => {
    setCartItems((current) =>
      current.flatMap((item) => {
        if (item.id !== productId) return [item]
        if (item.quantity <= 1) return []
        return [{ ...item, quantity: item.quantity - 1 }]
      }),
    )
  }

  const increaseQuantity = (productId) => {
    setCartItems((current) =>
      current.map((item) => {
        if (item.id !== productId) return item
        if (typeof item.stock === 'number' && item.quantity >= item.stock) return item
        return { ...item, quantity: item.quantity + 1 }
      }),
    )
  }

  return {
    cartItems,
    cartCount,
    isCartOpen,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
  }
}
