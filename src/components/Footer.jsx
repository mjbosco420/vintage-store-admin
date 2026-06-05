export default function Footer({ onShopClick }) {
  return (
    <footer id="contact" className="border-t border-white/10 py-10 px-6">
      <div className="mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between max-w-7xl text-center md:text-left">
        <div>
          <h3 className="text-2xl font-black tracking-[0.3em]">MJBOSCO</h3>
          <p className="mt-2 text-sm text-white/40">Vintage streetwear with a refined edge.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm uppercase tracking-[0.2em] text-white/60">
          <a href="https://instagram.com/mjbosco.vtg" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://wa.me/6289516385374" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="#shop" onClick={onShopClick}>Shop</a>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-white/50">
        © {new Date().getFullYear()} mjbosco. All rights reserved.
      </div>
    </footer>
  )
}
