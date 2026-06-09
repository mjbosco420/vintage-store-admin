import { useState } from 'react'

export default function WebCheckoutModal({
  buyerDetails,
  isOpen,
  items,
  onOrderSubmitted,
  user,
  onClose,
  onLogout,
  onLoginClick, // New prop to open AuthModal
  onSubmitOrder,
}) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [orderId, setOrderId] = useState('')

  const isLoggedIn = !!user

  if (!isOpen) return null

  const total = items.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9.-]+/g, ''))
    return sum + (Number.isFinite(price) ? price : 0) * (item.quantity || 1)
  }, 0)

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total)

  const handleSubmit = async (event) => {
    if (!isLoggedIn) {
      setSubmitError('Please log in or create an account before completing your purchase.');
      return;
    }

    event.preventDefault()
    const generatedOrderId = `VS-${Date.now().toString().slice(-6)}`
    const purchasedAt = new Date().toISOString()
    const summary = {
      id: generatedOrderId,
      items: items.map((item) => ({
        id: item.id,
        image: item.image,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      purchasedAt,
      total: formattedTotal,
      userEmail: user?.email || '',
      userName: user?.name || '',
      paymentMethod: 'Website',
      shippingAddress: buyerDetails.address || '-',
      notes: buyerDetails.notes || '-',
      status: 'processing',
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Basic sanitization and length limits for security
      const safeAddress = (buyerDetails.address || '-').replace(/[<>]/g, '').substring(0, 500)
      const safeNotes = (buyerDetails.notes || '-').replace(/[<>]/g, '').substring(0, 500)

      const serverOrder = await onSubmitOrder?.({
        id: generatedOrderId,
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity || 1,
        })),
        shippingAddress: safeAddress,
        notes: safeNotes,
        paymentMethod: 'Website',
        orderedAt: purchasedAt,
        user,
      })
      onOrderSubmitted?.(serverOrder) // Meneruskan objek pesanan dari server
      setOrderId(generatedOrderId)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit order:', error)
      setSubmitError(error.message || 'Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[135] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close web checkout"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <form onSubmit={handleSubmit} className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#090909] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Web Checkout</p>
            <h2 className="mt-2 text-3xl font-black">{isSubmitted ? 'Order Received' : 'Confirm Order'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isSubmitted ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/60">Order ID</p>
              <p className="mt-2 text-2xl font-black">{orderId}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Your order has been recorded on this browser. We will contact you to confirm availability and payment details.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Signed In As</p>
                    <p className="mt-2 text-sm font-bold">{user?.name}</p>
                    <p className="mt-1 text-sm text-white/50">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {!isLoggedIn && (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-white/60">
                    Please log in or create an account before completing your purchase.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose(); // Close WebCheckoutModal
                      onLoginClick(); // Open AuthModal
                    }}
                    className="mt-4 w-full rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.02]"
                  >
                    LOGIN / SIGN UP
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                    {/* ... other item details */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="mt-1 text-sm text-white/60">{item.price} x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Shipping Address</p>
                  <p className="mt-2 text-sm text-white/80">{buyerDetails.address || 'No address yet'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Notes</p>
                  <p className="mt-2 text-sm text-white/80">{buyerDetails.notes || 'No notes'}</p>
                </div>
              </div>

              {submitError && (
                <p className="rounded-2xl border border-[#ff2153]/25 bg-[#ff2153]/10 px-4 py-3 text-sm text-[#ff8ca2]">
                  {submitError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-6">
          {isSubmitted ? (
            <button type="button" onClick={onClose} className="w-full rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02]">
              CLOSE
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isLoggedIn} // Disable if not logged in
              className="w-full rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'SUBMITTING...' : 'PLACE ORDER'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
