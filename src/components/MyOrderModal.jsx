import { useState } from 'react'
import TrackTab from './MyOrderModal/TrackTab'
import WishlistTab from './MyOrderModal/WishlistTab'
import SummaryTab from './MyOrderModal/SummaryTab'

const tabs = ['Track', 'Wishlist', 'Summary']

export default function MyOrderModal({
  isOpen,
  onAddToCart,
  onClearWishlist,
  onClose,
  orderSummaries,
  user,
  wishlistProducts,
}) {
  const [activeTab, setActiveTab] = useState('Track')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingStatus, setTrackingStatus] = useState(null)

  const userOrderSummaries = user?.email
    ? orderSummaries
        .filter((summary) => summary.userEmail === user.email)
        .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
    : []

  if (!isOpen) return null

  const handleTrack = (event) => {
    event.preventDefault()
    if (!trackingNumber.trim()) return

    setTrackingStatus({ type: 'loading', message: 'Looking up package data...' })

    setTimeout(() => {
      setTrackingStatus({
        type: 'success',
        message: `Package ${trackingNumber} is being processed. The latest status will appear after the tracking number is shipped.`,
      })
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close my order"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#090909] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Account</p>
            <h2 className="mt-2 text-3xl font-black">MyOrder</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
          >
            x
          </button>
        </div>

        <div className="border-b border-white/10 px-6 pt-5">
          <div className="flex gap-2 overflow-x-auto pb-5">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-white text-black'
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'Track' && (
            <TrackTab
              trackingNumber={trackingNumber}
              onTrackingNumberChange={setTrackingNumber}
              trackingStatus={trackingStatus}
              onTrack={handleTrack}
            />
          )}

          {activeTab === 'Wishlist' && (
            <WishlistTab
              user={user}
              wishlistProducts={wishlistProducts}
              onAddToCart={onAddToCart}
              onClearWishlist={onClearWishlist}
            />
          )}

          {activeTab === 'Summary' && <SummaryTab orderSummaries={userOrderSummaries} />}
        </div>
      </div>
    </div>
  )
}