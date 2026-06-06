import { PayPalButtons } from '@paypal/react-paypal-js'
import { useMemo, useState } from 'react'
import { createWhatsAppCheckoutUrl } from '../utils/checkout'

export default function CartDrawer({
  isOpen,
  items,
  onClose,
  onWebCheckout,
  onIncrease,
  onDecrease,
  onRemove,
  currentUser,
  onSubmitOrder,
  onOrderSubmitted,
}) {
  const [buyerDetails, setBuyerDetails] = useState({
    name: '',
    address: '',
    notes: '',
  })
  const [showPaypal, setShowPaypal] = useState(false)

  const hasItems = items.length > 0
  const checkoutUrl = useMemo(
    () => (hasItems ? createWhatsAppCheckoutUrl(items, buyerDetails) : '#'),
    [buyerDetails, hasItems, items],
  )

  const handleBuyerDetailChange = (field, value) => {
    setBuyerDetails((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const total = items.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9.-]+/g, ''))
    return sum + (Number.isFinite(price) ? price : 0) * (item.quantity || 1)
  }, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#080808] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Checkout</p>
            <h2 className="mt-1 text-2xl font-black">Your Cart</h2>
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
          {!hasItems ? (
            <div className="flex h-full items-center justify-center rounded-[24px] border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[88px_1fr] gap-4 rounded-[24px] border border-white/10 bg-white/5 p-3">
                  <img src={item.image} alt={item.name} className="h-24 w-full rounded-[18px] object-cover" />

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold leading-tight">{item.name}</h3>
                        <p className="mt-1 text-sm text-white/60">{item.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onIncrease(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <label htmlFor="buyer-name" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                    Buyer Name
                  </label>
                  <input
                    id="buyer-name"
                    type="text"
                    value={buyerDetails.name}
                    onChange={(event) => handleBuyerDetailChange('name', event.target.value)}
                    placeholder="Your full name"
                maxLength={100}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                <div>
                  <label htmlFor="shipping-address" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                    Shipping Address
                  </label>
                  <textarea
                    id="shipping-address"
                    value={buyerDetails.address}
                    onChange={(event) => handleBuyerDetailChange('address', event.target.value)}
                    placeholder="Street, district, city, province, postal code"
                    rows={4}
                maxLength={500}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                <div>
                  <label htmlFor="order-notes" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                    Notes
                  </label>
                  <input
                    id="order-notes"
                    type="text"
                    value={buyerDetails.notes}
                    onChange={(event) => handleBuyerDetailChange('notes', event.target.value)}
                    placeholder="Size request, delivery note, etc."
                maxLength={500}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-6">
          <button
            type="button"
            onClick={() => onWebCheckout(buyerDetails)}
            disabled={!hasItems}
            className={`mb-3 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-bold transition ${
              hasItems
                ? 'border border-white/15 bg-white/5 text-white hover:bg-white hover:text-black'
                : 'cursor-not-allowed bg-white/10 text-white/30'
            }`}
          >
            CHECKOUT ON WEBSITE
          </button>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className={`mb-3 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-bold transition ${
              hasItems
                ? 'bg-white text-black hover:scale-[1.02] hover:opacity-90'
                : 'pointer-events-none bg-white/10 text-white/30'
            }`}
          >
            ORDER VIA WHATSAPP
          </a>
          {showPaypal ? (
            <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-white/5 p-4 relative z-0">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'pill', color: 'blue', height: 48 }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: { value: total.toFixed(2) }
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  try {
                    const details = await actions.order.capture();
                    const generatedOrderId = `PP-${Date.now().toString().slice(-6)}`;
                    const purchasedAt = new Date().toISOString();

                    const orderPayload = {
                      id: generatedOrderId,
                      items: items.map(item => ({ id: item.id, quantity: item.quantity || 1 })),
                      shippingAddress: buyerDetails.address || 'PayPal Checkout',
                      notes: buyerDetails.notes || 'Paid via PayPal',
                      orderedAt: purchasedAt,
                      user: currentUser || { name: details.payer.name.given_name, email: details.payer.email_address }
                    };

                    await onSubmitOrder?.(orderPayload);

                    onOrderSubmitted?.({
                      id: generatedOrderId,
                      items: items.map(item => ({ ...item })),
                      purchasedAt,
                      total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total),
                      userEmail: orderPayload.user.email,
                      userName: orderPayload.user.name,
                    });

                    alert(`Payment successful! Thank you, ${details.payer.name.given_name}. Order ID: ${generatedOrderId}`);
                    setShowPaypal(false);
                    onClose();
                  } catch (error) {
                    console.error('Failed to submit order to backend:', error);
                    alert('Payment succeeded but order creation failed: ' + error.message);
                  }
                }}
                onError={(err) => {
                  console.error('PayPal Checkout Error:', err);
                  alert('Payment failed. Please try again.');
                }}
              />
              <button type="button" onClick={() => setShowPaypal(false)} className="text-xs text-white/50 underline transition hover:text-white">
                Cancel PayPal Checkout
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!hasItems}
              onClick={() => setShowPaypal(true)}
              className={`flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-bold transition ${
                hasItems
                  ? 'bg-[#003087] text-white hover:scale-[1.02] hover:opacity-90'
                  : 'cursor-not-allowed bg-white/10 text-white/30'
              }`}
            >
              PAY WITH PAYPAL
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
