import { useEffect, useMemo, useRef, useState } from 'react'
import 'react-medium-image-zoom/dist/styles.css'
import './App.css'
import AboutSection from './components/AboutSection'
import AuthModal from './components/AuthModal'
import CartDrawer from './components/CartDrawer'
import CategoryFilter from './components/CategoryFilter'
import Footer from './components/Footer'
import Hero from './components/Hero'
import MyOrderModal from './components/MyOrderModal'
import Navbar from './components/Navbar'
import ProductSection from './components/ProductSection'
import ProjectionBadge from './components/ProjectionBadge'
import PromoBanner from './components/PromoBanner'
import WebCheckoutModal from './components/WebCheckoutModal'
import { PROJECTION_DURATION } from './constants/shop'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { useProducts } from './hooks/useProducts'
import { filterProductsByCategory } from './utils/category'
import { getOrderSummaries, saveOrderSummaries } from './utils/storage'

const INITIAL_PRODUCT_LIMIT = 8

export default function StreetwearStore() {
  const timeoutRef = useRef(null)
  const bannerTimeoutRef = useRef(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [zoomedImage, setZoomedImage] = useState(null)
  const [showProjection, setShowProjection] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [visibleProductCount, setVisibleProductCount] = useState(INITIAL_PRODUCT_LIMIT)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMyOrderOpen, setIsMyOrderOpen] = useState(false)
  const [isWebCheckoutOpen, setIsWebCheckoutOpen] = useState(false)
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false)
  const [authBanner, setAuthBanner] = useState(null)
  const [orderSummaries, setOrderSummaries] = useState(() => getOrderSummaries())
  const [webCheckoutDetails, setWebCheckoutDetails] = useState({
    name: '',
    address: '',
    notes: '',
  })
  const {
    authError,
    clearAuthError,
    currentUser,
    login,
    logout,
    resetPassword,
    signUp,
  } = useAuth()
  const { products, isLoading, loadProducts, handleLike, handleViewProduct } = useProducts(currentUser)
  const {
    cartItems,
    cartCount,
    isCartOpen,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity,
    openCart,
    closeCart,
  } = useCart()

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId],
  )

  const filteredProducts = useMemo(
    () => {
      let filtered = filterProductsByCategory(products, categoryFilter)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(p => p.name?.toLowerCase().includes(query) || p.desc?.toLowerCase().includes(query))
      }
      return filtered
    },
    [products, categoryFilter, searchQuery],
  )

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts]
    if (sortBy === 'popular') {
      sorted.sort((a, b) => {
        const likesA = a.likes || 0
        const likesB = b.likes || 0
        if (likesB !== likesA) return likesB - likesA

        const viewsA = a.views || 0
        const viewsB = b.views || 0
        return viewsB - viewsA
      })
    }
    return sorted
  }, [filteredProducts, sortBy])

  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleProductCount),
    [sortedProducts, visibleProductCount],
  )

  const wishlistProducts = useMemo(
    () => products.filter((product) => product.isLiked),
    [products],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current)
      }
    }
  }, [])

  const clearActiveTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleLogoClick = () => {
    clearActiveTimeout()
    setSelectedProductId(null)
    setZoomedImage(null)
    setSortBy('latest')
    setCategoryFilter('All')
    setSearchQuery('')
    setVisibleProductCount(INITIAL_PRODUCT_LIMIT)
    setShowProjection(true)
    timeoutRef.current = setTimeout(() => {
      setShowProjection(false)
    }, PROJECTION_DURATION)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShopClick = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setSortBy('latest')
    setSearchQuery('')
    handleCategoryClick('All')
  }

  const handleCategoryClick = async (item) => {
    clearActiveTimeout()
    setSelectedProductId(null)
    setZoomedImage(null)
    setVisibleProductCount(INITIAL_PRODUCT_LIMIT)

    // Langsung arahkan scroll ke bagian produk instan tanpa menunggu loading selesai
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    await loadProducts()
    setCategoryFilter(item)
    setIsAnimating(true)
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, 50)
  }

  const handleSortChange = (newSort) => {
    if (sortBy === newSort) return // Abaikan jika user klik tombol sort yang sama
    
    clearActiveTimeout()
    setIsAnimating(true)
    timeoutRef.current = setTimeout(() => {
      setSortBy(newSort)
      setVisibleProductCount(INITIAL_PRODUCT_LIMIT) // Reset limit produk ke 8 saat ganti urutan
      setIsAnimating(false)
    }, 50)
  }

  const handleWebCheckout = (buyerDetails) => {
    setWebCheckoutDetails(buyerDetails)

    if (!currentUser) {
      clearAuthError()
      setPendingCheckoutAfterAuth(true)
      setIsAuthOpen(true)
      return
    }

    setIsWebCheckoutOpen(true)
  }

  const handleAuthClose = () => {
    setIsAuthOpen(false)
  }

  const handleAuthSuccess = (user, mode) => {
    setIsAuthOpen(false)
    const title =
      mode === 'signup'
        ? `Welcome aboard, ${user.name}!`
        : mode === 'reset'
        ? `Password reset complete, welcome back, ${user.name}!`
        : `Welcome back, ${user.name}!`

    const subtitle =
      mode === 'signup'
        ? 'Your streetwear journey starts here. Let the fresh drops inspire your next fit.'
        : 'Great to see you again. The latest drops are waiting in your cart.'

    setAuthBanner({ title, subtitle })
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current)
    }
    bannerTimeoutRef.current = setTimeout(() => {
      setAuthBanner(null)
      bannerTimeoutRef.current = null
    }, 5500)

    if (pendingCheckoutAfterAuth) {
      setPendingCheckoutAfterAuth(false)
      setIsWebCheckoutOpen(true)
    }
  }

  const handleCartOpen = () => {
    setIsMyOrderOpen(false)
    openCart()
  }

  const handleOrderSubmitted = (summary) => {
    setOrderSummaries((current) => {
      const updated = [summary, ...current.filter((item) => item.id !== summary.id)]
      saveOrderSummaries(updated)
      return updated
    })
    setIsMyOrderOpen(true)
  }

  const handleWishlistAddToCart = (product) => {
    addToCart(product)
    setIsMyOrderOpen(false)
  }

  const handleWebCheckoutSubmit = async (orderPayload) => {
    try {
      // Tembak data ke jalur API Serverless (Vercel) yang aman
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Gagal memproses pesanan')
      }
    } catch (error) {
      console.error('Error Checkout:', error)
      throw error // Lemparkan error agar WebCheckoutModal bisa menampilkan pesan gagal
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans overflow-x-hidden">
      <Navbar
        cartCount={cartCount}
        currentUser={currentUser}
        onCartClick={handleCartOpen}
        onLogoClick={handleLogoClick}
        onShopClick={handleShopClick}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={logout}
        onMyOrderClick={() => setIsMyOrderOpen(true)}
      />
      {showProjection && <ProjectionBadge />}
      <Hero categoryFilter={categoryFilter} onNewDropClick={() => handleCategoryClick('New Drop')} onShopNowClick={handleShopClick} />
      {authBanner && (
        <div className="fixed left-1/2 top-[5.5rem] z-[150] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[28px] border border-white/10 bg-white/95 p-5 shadow-2xl text-slate-950 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Welcome message</p>
          <h3 className="mt-2 text-xl font-black">{authBanner.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{authBanner.subtitle}</p>
        </div>
      )}
      <CategoryFilter 
        activeCategory={categoryFilter} 
        onCategoryClick={handleCategoryClick} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ProductSection
        products={visibleProducts}
        totalProducts={filteredProducts.length}
        isAnimating={isAnimating}
        isLoading={isLoading}
        selectedProduct={selectedProduct}
        zoomedImage={zoomedImage}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onLike={handleLike}
        onAddToCart={addToCart}
        onSelectProduct={(productId) => {
          setSelectedProductId(productId)
          setZoomedImage(null)
          handleViewProduct(productId)
        }}
        onCloseProduct={() => {
          setSelectedProductId(null)
          setZoomedImage(null)
        }}
        onThumbnailClick={setZoomedImage}
        onLoadMore={() => setVisibleProductCount((count) => count + INITIAL_PRODUCT_LIMIT)}
      />
      <PromoBanner onShopNowClick={handleShopClick} />
      <AboutSection />
      <Footer onShopClick={handleShopClick} />
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={closeCart}
        onWebCheckout={handleWebCheckout}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromCart}
      />
      <AuthModal
        error={authError}
        isOpen={isAuthOpen}
        onClose={handleAuthClose}
        onLogin={login}
        onResetPassword={resetPassword}
        onSignUp={signUp}
        onSuccess={handleAuthSuccess}
      />
      <WebCheckoutModal
        buyerDetails={webCheckoutDetails}
        isOpen={isWebCheckoutOpen}
        items={cartItems}
        onOrderSubmitted={handleOrderSubmitted}
        user={currentUser}
        onClose={() => setIsWebCheckoutOpen(false)}
        onLogout={() => {
          logout()
          setIsWebCheckoutOpen(false)
          setIsAuthOpen(true)
        }}
        onSubmitOrder={handleWebCheckoutSubmit}
      />
      <MyOrderModal
        isOpen={isMyOrderOpen}
        orderSummaries={orderSummaries}
        user={currentUser}
        wishlistProducts={wishlistProducts}
        onAddToCart={handleWishlistAddToCart}
        onClose={() => setIsMyOrderOpen(false)}
      />
    </div>
  )
}
