import { useState, useEffect } from 'react'
import { getUserOrders } from '../services/orders'

const tabs = ['Track', 'Wishlist', 'Summary']

const formatOrderDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function MyOrderModal({
  isOpen,
  onAddToCart,
  onClose,
  orderSummaries,
  user,
  wishlistProducts,
}) {
  const [activeTab, setActiveTab] = useState('Track')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingStatus, setTrackingStatus] = useState(null)
  const [liveOrders, setLiveOrders] = useState([])

  useEffect(() => {
    if (isOpen && activeTab === 'Summary' && user?.email) {
      getUserOrders(user.email)
        .then(setLiveOrders)
        .catch(console.error)
    }
  }, [isOpen, activeTab, user?.email])

  const userOrderSummaries = user?.email
    ? orderSummaries
        .filter((summary) => summary.userEmail === user.email)
        .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
        .map((summary) => {
          const liveData = liveOrders.find((order) => order.orderNumber === summary.id)
          return {
            ...summary,
            status: liveData?.status || 'new',
            trackingNumber: liveData?.trackingNumber || null,
            shippingCourier: liveData?.shippingCourier || null,
          }
        })
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
            <form onSubmit={handleTrack} className="mx-auto max-w-xl space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/60">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="Example: JX123456789"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!trackingNumber.trim()}
                className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Track Package
              </button>

              {trackingStatus && (
                <div
                  className={`rounded-2xl border p-4 text-sm ${
                    trackingStatus.type === 'loading'
                      ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'
                      : 'border-green-500/20 bg-green-500/10 text-green-200'
                  }`}
                >
                  {trackingStatus.message}
                </div>
              )}
            </form>
          )}

          {activeTab === 'Wishlist' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {wishlistProducts.length === 0 ? (
                <div className="col-span-full rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                  Your wishlist is empty.
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <img src={product.image} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{product.name}</p>
                      <p className="mt-1 text-sm text-white/60">{product.price}</p>
                    </div>
                    <button
                      type="button"
                      disabled={product.stock === 0}
                      onClick={() => onAddToCart(product)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                    >
                      Cart
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Summary' && (
            <div className="space-y-4">
              {userOrderSummaries.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                  No order summary yet.
                </div>
              ) : (
                userOrderSummaries.map((summary) => (
                  <div key={summary.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Order ID</p>
                        <p className="mt-1 text-lg font-black">{summary.id}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Purchased</p>
                        <p className="mt-1 text-sm text-white/70">{formatOrderDate(summary.purchasedAt)}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {summary.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="mt-1 text-white/50">{item.price} x{item.quantity}</p>
                          </div>
                          <p className="shrink-0 text-white/70">{item.price}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-white/40">Email</p>
                          <p className="mt-1 break-all text-white/80">{summary.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Total</p>
                          <p className="mt-1 font-bold text-white">{summary.total}</p>
                        </div>
                      </div>

                      <div className="mt-2 border-t border-white/10 pt-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Status</p>
                            <p className="mt-1 font-bold capitalize text-white/90">
                              {summary.status}
                            </p>
                          </div>
                          {summary.trackingNumber && (
                            <>
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Courier</p>
                                <p className="mt-1 font-bold text-white/90">{summary.shippingCourier || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Tracking No</p>
                                <p className="mt-1 font-bold text-white/90">{summary.trackingNumber}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
