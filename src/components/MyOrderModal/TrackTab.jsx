export default function TrackTab({ trackingNumber, onTrackingNumberChange, trackingStatus, onTrack }) {
  return (
    <form onSubmit={onTrack} className="mx-auto max-w-xl space-y-4">
      <div>
        <label className="mb-2 block text-sm text-white/60">Tracking Number</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(event) => onTrackingNumberChange(event.target.value)}
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
  )
}
