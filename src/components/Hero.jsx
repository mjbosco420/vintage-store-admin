export default function Hero({ categoryFilter, onNewDropClick, onShopNowClick }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-28 text-center">
      <img src="/bg.jpg" alt="hero" className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/95 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.5em] text-white/40">Vintage Collection</p>
        <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8.5rem]">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#ff7b95] to-[#ff2153] inline-block">
            VINTAGE
          </span>
          <br />
          REDEFINED.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60 md:text-lg">
          Authentic streetwear drops — curated, restored, and ready to wear.
        </p>

        <div className="mx-auto mt-8 flex max-w-lg flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={onShopNowClick}
            className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#ff7b95] to-[#ff2153] px-8 py-4 text-sm font-bold text-white shadow-xl transition-transform duration-300 hover:scale-105 md:px-10"
          >
            SHOP NOW
          </button>
          <button
            onClick={onNewDropClick}
            className={`w-full rounded-full px-8 py-4 text-sm font-bold md:w-auto md:px-10 transition border ${
              categoryFilter === 'New Drop'
                ? 'border-transparent bg-white text-black'
                : 'border-white/10 bg-white/5 text-white hover:bg-white hover:text-black'
            }`}
          >
            NEW DROP
          </button>
        </div>
      </div>
    </section>
  )
}
