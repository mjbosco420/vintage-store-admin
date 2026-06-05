export default function ProductCard({ product, onAddToCart, onSelect, onLike }) {
  const isReserved = product.isReserved
  const isSold = product.stock === 0 || isReserved
  const likeCount = product.likes || 0

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-[0_20px_80px_-50px_rgba(255,255,255,0.25)] transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20"
    >
      <div className="relative overflow-hidden">
        {product.isNewDrop && !isReserved && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ff2153] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-white shadow-[0_0_18px_rgba(255,33,83,0.35)] ring-1 ring-white/20 animate-pulse">
            New Drop
          </span>
        )}

        {likeCount > 0 && (
          <span className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/65 px-3 py-2 text-xs font-semibold text-white shadow-[0_0_22px_rgba(255,255,255,0.14)] backdrop-blur-md animate-like-badge">
            ♥ {likeCount}
          </span>
        )}

        {isReserved ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40">
            <span className="rounded-[20px] border border-[#ffb800]/50 bg-[#ffb800]/20 px-6 py-3 text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-[#ffb800] backdrop-blur-sm shadow-[0_0_30px_rgba(255,184,0,0.3)]">
              RESERVED
            </span>
          </div>
        ) : isSold ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <span className="rounded-[20px] bg-black/60 px-6 py-3 text-2xl font-black uppercase tracking-[0.2em] text-white shadow-lg">
              SOLD
            </span>
          </div>
        ) : null}

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-[350px] w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {/* Quick add overlay on hover */}
        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="rounded-full bg-white p-4 text-black shadow-2xl hover:scale-105"
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">{product.category}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold leading-tight">{product.name}</h3>
            <p className="mt-3 line-clamp-3 text-sm text-white/60">{product.desc}</p>
          </div>
          <span className="whitespace-nowrap text-sm font-semibold text-white/80">{product.price}</span>
        </div>

        <div className="mt-auto flex gap-3 pt-8">
          <button
            type="button"
            disabled={isSold}
            onClick={(event) => {
              event.stopPropagation()
              onAddToCart(product)
            }}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isSold
                ? 'cursor-not-allowed bg-white/10 text-white/30'
                : 'bg-white text-black hover:opacity-90'
            }`}
          >
            {isReserved ? 'Reserved' : isSold ? 'Sold Out' : 'Add to cart'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onLike(product.id)
            }}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              product.isLiked
                ? 'border-white/20 bg-white text-black'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white hover:text-black'
            }`}
          >
            {product.isLiked ? '♥' : '♡'} {likeCount}
          </button>
        </div>
      </div>
    </div>
  )
}
