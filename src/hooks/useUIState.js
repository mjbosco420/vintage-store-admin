import { useEffect, useRef, useState } from 'react'

export const useUIState = ({ currentUser, clearAuthError }) => {
  const bannerTimeoutRef = useRef(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMyOrderOpen, setIsMyOrderOpen] = useState(false)
  const [isWebCheckoutOpen, setIsWebCheckoutOpen] = useState(false)
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false)
  const [authBanner, setAuthBanner] = useState(null)
  const [webCheckoutDetails, setWebCheckoutDetails] = useState({
    name: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current)
      }
    }
  }, [])

  const openAuth = () => {
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    setIsAuthOpen(false)
  }

  const openMyOrder = () => {
    setIsMyOrderOpen(true)
  }

  const closeMyOrder = () => {
    setIsMyOrderOpen(false)
  }

  const closeWebCheckout = () => {
    setIsWebCheckoutOpen(false)
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
        ? 'Your vintage stuff journey starts here. Let the fresh drops inspire your next fit.'
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

  return {
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
    setWebCheckoutDetails,
  }
}
