export default function PromoBanner({ onShopNowClick }) {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto overflow-hidden rounded-[40px] border border-white/10 bg-black/20 max-w-7xl">
        <img
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop"
          alt="banner"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="relative z-10 bg-black/50 px-8 py-24 text-center backdrop-blur-sm md:px-20">
          <p className="mb-5 text-xs uppercase tracking-[0.4em] text-white/40">Limited Collection</p>
          <h2 className="mx-auto max-w-5xl text-3xl font-black leading-tight sm:text-5xl md:text-7xl">
            BUILT FOR DAILY STREET MOVEMENT.
          </h2>
          <button 
            onClick={onShopNowClick}
            className="mt-10 inline-flex rounded-full bg-white px-10 py-5 text-sm font-bold text-black transition hover:scale-105"
          >
            SHOP NOW
          </button>
        </div>
      </div>
    </section>
  )
}
