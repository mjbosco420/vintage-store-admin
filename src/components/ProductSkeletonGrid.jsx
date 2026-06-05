export default function ProductSkeletonGrid() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_-50px_rgba(255,255,255,0.12)] animate-pulse">
          <div className="h-[300px] w-full rounded-[28px] bg-white/10 mb-6" />
          <div className="h-5 w-3/4 rounded-full bg-white/10 mb-3" />
          <div className="h-4 w-1/2 rounded-full bg-white/10 mb-4" />
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-2xl bg-white/10" />
            <div className="h-10 w-20 rounded-2xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
