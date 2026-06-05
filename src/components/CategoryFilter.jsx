import { CATEGORIES } from '../constants/shop'

export default function CategoryFilter({ activeCategory, onCategoryClick, searchQuery, onSearchChange }) {
  return (
    <section id="collections" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto mb-10 max-w-md">
        <input
          type="text"
          placeholder="Search for vintage pieces..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 shadow-[0_10px_40px_-20px_rgba(255,255,255,0.1)]"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            onClick={() => onCategoryClick(item)}
            className={`rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition duration-300 ${
              activeCategory === item
                ? 'bg-white text-black shadow-[0_12px_40px_-28px_rgba(255,255,255,0.6)]'
                : 'bg-white/5 text-white/70 hover:bg-white/15'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  )
}
