import { useState, useRef, useEffect } from 'react'

export default function Navbar({ cartCount, currentUser, onCartClick, onLogoClick, onShopClick, onLoginClick, onLogoutClick, onMyOrderClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        <h1 onClick={onLogoClick} className="cursor-pointer text-lg sm:text-2xl font-black tracking-[0.2em] sm:tracking-[0.3em] animate-header-glow">MJBOSCO</h1>

        <div className="hidden lg:flex items-center gap-10 uppercase tracking-[0.2em] text-xs text-white/70">
          <a href="#shop" onClick={onShopClick} className="transition hover:text-white">Shop</a>
          <a href="#collections" className="transition hover:text-white">Collections</a>
          <a href="#about" className="transition hover:text-white">About</a>
          <a href="#contact" className="transition hover:text-white">Contact</a>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {currentUser ? (
            <>
              <div className="relative flex items-center" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="text-[10px] sm:text-sm text-white/60 mr-1 sm:mr-2 truncate max-w-[55px] sm:max-w-none hover:text-white transition"
                >
                  Hi, {currentUser.name.split(' ')[0]}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-[120%] mt-1 w-56 rounded-2xl border border-white/10 bg-[#090909] p-4 shadow-2xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Account Info</p>
                    <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                    <p className="mt-0.5 text-xs text-white/60 truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onMyOrderClick}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm text-white/80 transition hover:border-white/20 hover:bg-white/10"
              >
                MyOrder
              </button>
              <button
                type="button"
                onClick={onLogoutClick}
                className="rounded-full border border-white/10 bg-red-500/20 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm text-white/80 transition hover:border-white/20 hover:bg-white/10"
            >
              Sign In
            </button>
          )}
          <button
            type="button"
            onClick={onCartClick}
            className="rounded-full bg-white px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-semibold text-black transition hover:opacity-90"
          >
            Cart ({cartCount})
          </button>
        </div>
      </div>
    </nav>
  )
}
