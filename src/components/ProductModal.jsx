import Zoom from 'react-medium-image-zoom'

export default function ProductModal({
  product,
  zoomedImage,
  onAddToCart,
  onClose,
  onLike,
  onThumbnailClick,
}) {
  if (!product) return null

  const isReserved = product.isReserved
  const isSold = product.stock === 0 || isReserved

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/90 p-0 sm:p-2 backdrop-blur-xl pt-32 md:pt-24">
      <div className="relative w-full h-full max-w-6xl max-h-screen overflow-hidden rounded-[20px] border border-white/10 bg-[#090909] shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg"
        >
          x
        </button>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr] h-full">
          <div className="bg-[#111] p-1 md:p-2 overflow-auto">
            <div className="group relative w-full overflow-hidden rounded-[30px] border border-white/10 bg-black">
              <Zoom zoomMargin={36} classDialog="custom-zoom-dialog">
                <img
                  src={zoomedImage || product.images?.[0] || product.image}
                  alt={product.name}
                  className="h-[500px] w-full object-contain transition duration-300 group-hover:scale-[1.02] sm:h-[650px]"
                />
              </Zoom>
              {isReserved ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/40">
                  <span className="rounded-[20px] border border-[#ffb800]/50 bg-[#ffb800]/20 px-8 py-4 text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] text-[#ffb800] backdrop-blur-sm shadow-[0_0_40px_rgba(255,184,0,0.3)]">
                    RESERVED
                  </span>
                </div>
              ) : isSold ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <span className="rounded-[20px] bg-black/60 px-8 py-4 text-3xl font-black uppercase tracking-[0.2em] text-white shadow-lg">
                    SOLD
                  </span>
                </div>
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
                Pinch to zoom
              </span>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onThumbnailClick(image)
                    }}
                    className={`min-w-[120px] sm:min-w-[140px] overflow-hidden rounded-[24px] border p-1 transition ${
                      zoomedImage === image ? 'border-white/50' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-full object-cover rounded-[20px]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 flex flex-col justify-start gap-3 overflow-auto">
            <p className="uppercase tracking-[0.3em] text-xs text-white/40">{product.category}</p>
            <h2 className="text-4xl font-black leading-tight">{product.name}</h2>
            <p className="text-2xl font-semibold text-white/80">{product.price}</p>
            <p className="max-w-xl text-sm leading-relaxed text-white/60">
              {product.desc}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isSold}
                onClick={() => onAddToCart(product)}
                className={`rounded-2xl px-6 py-4 text-sm font-bold transition ${
                  isSold
                    ? 'cursor-not-allowed bg-white/10 text-white/30'
                    : 'bg-white text-black hover:opacity-90'
                }`}
              >
                {isReserved ? 'Reserved' : isSold ? 'Sold Out' : 'Add to cart'}
              </button>
              <button
                type="button"
                onClick={() => onLike(product.id)}
                className={`rounded-2xl border px-6 py-4 text-sm transition ${
                  product.isLiked
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white hover:text-black'
                }`}
              >
                {product.isLiked ? 'Wishlisted' : 'Add to wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
