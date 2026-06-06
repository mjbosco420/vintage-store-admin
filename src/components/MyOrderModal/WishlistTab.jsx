export default function WishlistTab({ user, wishlistProducts, onAddToCart, onClearWishlist }) {
  if (!user) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        Please log in to view your wishlist.
      </div>
    )
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        Your wishlist is empty.
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70">{wishlistProducts.length} item{wishlistProducts.length === 1 ? '' : 's'} in your wishlist</p>
        <button
          type="button"
          onClick={onClearWishlist}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
        >
          Clear wishlist
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {wishlistProducts.map((product) => (
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
        ))}
      </div>
    </>
  )
}
