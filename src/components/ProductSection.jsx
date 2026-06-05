import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import ProductSkeletonGrid from './ProductSkeletonGrid'

export default function ProductSection({
  products,
  totalProducts,
  isAnimating,
  isLoading,
  selectedProduct,
  zoomedImage,
  sortBy,
  onSortChange,
  onLike,
  onAddToCart,
  onSelectProduct,
  onCloseProduct,
  onThumbnailClick,
  onLoadMore,
}) {
  const hasMoreProducts = products.length < totalProducts

  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/40">Available</p>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">FEATURED<br />PRODUCTS</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onSortChange('latest')}
            className={`rounded-full border px-5 py-3 text-sm transition ${
              sortBy === 'latest'
                ? 'border-white bg-white text-black'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white hover:text-black'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => onSortChange('popular')}
            className={`rounded-full border px-5 py-3 text-sm transition ${
              sortBy === 'popular'
                ? 'border-white bg-white text-black'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white hover:text-black'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      <div className={`grid gap-8 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        {isLoading ? (
          <ProductSkeletonGrid />
        ) : products.length === 0 ? (
          <div className="col-span-full rounded-[30px] border border-white/10 bg-white/5 p-16 text-center text-sm text-white/70">
            No products available yet
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onLike={onLike}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="flex flex-col items-center gap-4 pt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Showing {products.length} of {totalProducts}
                </p>
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="rounded-full border border-white/15 bg-white px-8 py-4 text-sm font-bold text-black transition hover:scale-105 hover:opacity-90"
                >
                  LOAD MORE
                </button>
              </div>
            )}
          </>
        )}

        <ProductModal
          product={selectedProduct}
          zoomedImage={zoomedImage}
          onAddToCart={onAddToCart}
          onClose={onCloseProduct}
          onLike={onLike}
          onThumbnailClick={onThumbnailClick}
        />
      </div>
    </section>
  )
}
