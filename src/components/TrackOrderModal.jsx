import { useState } from 'react'

export default function TrackOrderModal({ isOpen, onClose }) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [status, setStatus] = useState(null)

  if (!isOpen) return null

  const handleTrack = (e) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    // Simulate an API call to check tracking status
    setStatus({
      message: 'Looking up tracking data...',
      type: 'loading',
    })

    setTimeout(() => {
      setStatus({
        message: `Package ${trackingNumber} is on the way. Last known location: Jakarta Transit Facility.`,
        type: 'success',
      })
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0a] shadow-2xl">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Track Package</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (example: JX123456789)"
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
          </form>

          {status && (
            <div
              className={`mt-6 rounded-2xl border p-4 text-sm ${
                status.type === 'loading'
                  ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'
                  : 'border-green-500/20 bg-green-500/10 text-green-200'
              }`}
            >
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
