import { PayPalScriptProvider } from '@paypal/react-paypal-js'
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
import { PROJECTION_DURATION } from './constants/shop'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { useProducts } from './hooks/useProducts'
import { useUIState } from './hooks/useUIState'
import { filterProductsByCategory } from './utils/category'
import WebCheckoutModal from './components/WebCheckoutModal'
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
  const [visibleProductCount, setVisibleProductCount] = useState(INITIAL_PRODUCT_LIMIT) // Tetap pertahankan ini untuk bagian produk
  const [orderSummaries, setOrderSummaries] = useState([]) // Inisialisasi sebagai array kosong, akan diambil dari server
  const {
    authError,
    clearAuthError,
    currentUser,
    login,
    logout,
    resetPassword,
    signUp,
  } = useAuth()
  const { products, isLoading, loadProducts, handleLike, handleViewProduct, clearWishlist } = useProducts(currentUser)
  const {
    authBanner,
    isAuthOpen,
    isMyOrderOpen,
    isWebCheckoutOpen,
    webCheckoutDetails,
    openAuth,
    closeAuth,
    openMyOrder,
    closeMyOrder,
    closeWebCheckout,
    handleAuthSuccess,
    handleWebCheckout,
  } = useUIState({ currentUser, clearAuthError })
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


  const handleCartOpen = () => {
    closeMyOrder()
    openCart()
  }

  // Fungsi untuk mengambil pesanan dari server
  const fetchOrders = async () => {
    if (!currentUser?.id) {
      setOrderSummaries([]); // Hapus pesanan jika tidak ada pengguna
      return;
    }
    try {
      const response = await fetch(`/api/get-orders?email=${currentUser.email}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders.');
      }
      setOrderSummaries(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Opsional: tampilkan pesan error yang lebih ramah pengguna
    }
  };

  // Ambil pesanan saat pengguna login atau MyOrderModal dibuka
  useEffect(() => {
    if (currentUser?.id && isMyOrderOpen) {
      fetchOrders();
    } else if (!currentUser?.id) {
      setOrderSummaries([]); // Hapus pesanan jika pengguna logout
    }
  }, [currentUser?.id, isMyOrderOpen]);

  const handleOrderSubmitted = (serverOrder) => {
    // Setelah pesanan dikirim, ambil kembali semua pesanan untuk memastikan daftar terbaru
    // dan menyertakan pesanan baru dari server.
    fetchOrders();
    openMyOrder()
  }

  const handleWishlistAddToCart = (product) => {
    addToCart(product)
    closeMyOrder()
  }

  const handleWebCheckoutSubmit = async (orderPayload) => {
    if (!currentUser) {
      // This should ideally be caught earlier in the UI, but as a fallback
      throw new Error('Authentication required to place an order.');
    }

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
      return data.order // Mengembalikan objek pesanan yang dibuat dari server
    } catch (error) {
      console.error('Error Checkout:', error)
      throw error // Lemparkan error agar WebCheckoutModal bisa menampilkan pesan gagal
    }
  }

  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
      <div className="min-h-screen w-full bg-[#050505] text-white font-sans overflow-x-hidden">
      <Navbar
        cartCount={cartCount}
        currentUser={currentUser}
        onCartClick={handleCartOpen}
        onLogoClick={handleLogoClick}
        onShopClick={handleShopClick}
        onLoginClick={openAuth}
        onLogoutClick={logout}
        onMyOrderClick={openMyOrder}
      />
      {showProjection && <ProjectionBadge />}
      <Hero categoryFilter={categoryFilter} onNewDropClick={() => handleCategoryClick('New Drop')} onShopNowClick={handleShopClick} />
      {authBanner && (
        <div className="fixed left-1/2 top-[5.5rem] z-[150] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[28px] border border-white/10 bg-white/95 p-5 shadow-2xl text-slate-950 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Hello....</p>
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
        currentUser={currentUser}
        onSubmitOrder={handleWebCheckoutSubmit}
        onOrderSubmitted={handleOrderSubmitted}
        onLoginClick={openAuth} // Pass openAuth to CartDrawer
      />
      <AuthModal
        error={authError}
        isOpen={isAuthOpen}
        onClose={closeAuth}
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
        onClose={closeWebCheckout}
        onLogout={() => {
          // This logout is from WebCheckoutModal, so it should also close the modal
          logout()
          setOrderSummaries([]); // Hapus pesanan saat logout
          closeWebCheckout()
          openAuth()
        }}
        onSubmitOrder={handleWebCheckoutSubmit}
        onLoginClick={openAuth} // Pass openAuth to WebCheckoutModal for its internal login button
      />
      <MyOrderModal
        isOpen={isMyOrderOpen}
        orderSummaries={orderSummaries}
        user={currentUser}
        wishlistProducts={wishlistProducts}
        onAddToCart={handleWishlistAddToCart}
        onClearWishlist={clearWishlist}
        onClose={closeMyOrder}
      />
    </div>
    </PayPalScriptProvider>
  )
}
