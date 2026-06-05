export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-28 border-t border-white/10">
      <div className="grid gap-16 lg:grid-cols-2 items-center">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.4em] text-white/40">About Us</p>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            INSPIRED BY
            <br />
            STREET CULTURE
            <br />
            WORLDWIDE.
          </h2>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
            Combines surf culture, skateboarding, band/singer, graphic arts and outerwear
          </p>
        </div>

        <img
          src="Me.jpg"
          alt="about"
          className="h-[450px] w-full rounded-[40px] object-cover md:h-[650px]"
        />
      </div>
    </section>
  )
}
