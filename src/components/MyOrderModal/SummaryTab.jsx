const formatOrderDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function SummaryTab({ orderSummaries }) {
  if (orderSummaries.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        No order summary yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orderSummaries.map((summary) => (
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

            <div className="mt-4 border-t border-white/10 pt-4 space-y-3">

              <div>
                <p className="text-white/40">Payment Method</p>
                <p className="mt-1 text-white/90">
                  {summary.paymentMethod || '-'}
                </p>
              </div>

              <div>
                <p className="text-white/40">Shipping Address</p>
                <p className="mt-1 text-white/90 whitespace-pre-wrap">
                  {summary.shippingAddress || '-'}
                </p>
              </div>

              <div>
                <p className="text-white/40">Customer Notes</p>
                <p className="mt-1 text-white/90">
                  {summary.notes || '-'}
                </p>
              </div>
            </div>

            <div className="mt-2 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Status</p>
                  <p className="mt-1 font-bold capitalize text-white/90">{summary.status}</p>
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
      ))}
    </div>
  )
}
