import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-20">
        {/* 1. Hero — Auto-rotating Project Carousel */}
        <section className="relative min-h-screen flex items-end border-b border-[var(--border)] cursor-pointer">
          <div className="absolute inset-0 bg-[var(--border)]">
            {/* Full-screen project image — auto-rotates every 5s */}
          </div>
          <div className="relative z-10 w-full p-6 md:p-10">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">Smile Luxury Salon</p>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">01 / 04</p>
          </div>
        </section>

        {/* 2. About / Firm */}
        <section id="about" className="py-24 px-8 border-b border-[var(--border)]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8">About the Firm</p>
            <h2 className="text-3xl md:text-5xl font-light leading-tight">
              We design spaces that inspire, transform, and endure.
            </h2>
            <p className="mt-8 text-[var(--text-muted)] leading-relaxed max-w-xl mx-auto">
              Katyal Architects is a design studio led by Shubham Katyal, creating architecture and interiors that balance bold vision with refined execution.
            </p>
          </div>
        </section>

        {/* 3. Projects — Grid of Rectangular Boxes */}
        <section id="projects" className="py-24 px-8 border-b border-[var(--border)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12 text-center">Projects</p>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { category: "Hospitality", slug: "hospitality" },
              { category: "Architecture", slug: "architecture" },
              { category: "Interior", slug: "interior" },
              { category: "Landscape", slug: "landscape" },
              { category: "Commercial", slug: "commercial" },
              { category: "Township", slug: "township" },
            ].map((item) => (
              <a
                key={item.slug}
                href={`/projects/${item.slug}`}
                className="group relative aspect-[4/3] border border-[var(--border)] flex items-center justify-center overflow-hidden transition-all"
              >
                {/* Background image will go here */}
                <div className="absolute inset-0 bg-[var(--border)] group-hover:bg-[var(--text)] transition-colors" />
                <p className="relative z-10 text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text)] group-hover:text-[var(--bg)] transition-colors">
                  {item.category}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* 4. Instagram Feed */}
        <section id="instagram" className="py-24 px-8 border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">@katyal_architects</p>
              <a href="https://instagram.com/katyal_architects" target="_blank" className="text-xs uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">Follow →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[var(--border)]" />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Services */}
        <section id="services" className="py-24 px-8 border-b border-[var(--border)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12 text-center">Services</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {["Hospitality Design", "Architecture", "Interior Design", "Landscape", "Commercial Space", "Township"].map((service) => (
              <div key={service} className="border border-[var(--border)] p-8 text-center hover:bg-[var(--text)]/5 transition-colors">
                <h3 className="text-lg uppercase tracking-[0.15em] font-light">{service}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Reviews */}
        <section id="reviews" className="py-24 px-8 border-b border-[var(--border)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mb-12">What Our Clients Say</p>
          <div className="max-w-6xl mx-auto relative">
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 border border-[var(--border)] flex items-center justify-center hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors z-10">
              ←
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
              {[
                { name: "Client Name", project: "Residential Villa", quote: "Working with Katyal Architects transformed our vision into reality. Every detail was considered." },
                { name: "Another Client", project: "Smile Salon", quote: "The design exceeded our expectations. A truly world-class experience." },
                { name: "Client Three", project: "Heritage Restoration", quote: "They understood our brief instantly and delivered beyond what we imagined." },
              ].map((review) => (
                <div key={review.name} className="border border-[var(--border)] p-8 flex flex-col justify-between">
                  <p className="text-lg font-light italic leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
                  <div className="mt-6">
                    <p className="text-sm uppercase tracking-[0.1em]">{review.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{review.project}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 border border-[var(--border)] flex items-center justify-center hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors z-10">
              →
            </button>
          </div>
        </section>

        {/* 7. Team */}
        <section id="team" className="py-24 px-8 border-b border-[var(--border)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mb-12">The Team</p>
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { name: "Shubham Katyal", role: "Founder & Principal Architect" },
              { name: "Shelly", role: "(Designation)" },
              { name: "Oreo", role: "Chief Happiness Officer" },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-28 h-28 rounded-full bg-[var(--border)] mx-auto mb-4" />
                <p className="text-sm uppercase tracking-[0.1em]">{member.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Contact */}
        <section id="contact" className="py-24 px-8 border-b border-[var(--border)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8 text-center">Get in Touch</p>
          <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">Have a project in mind?</h2>
          <form className="w-full max-w-lg mx-auto space-y-6">
            <input type="text" placeholder="Name" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors" />
            <input type="email" placeholder="Email" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors" />
            <input type="tel" placeholder="Phone" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors" />
            <select className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors text-[var(--text-muted)]">
              <option value="">Select Service</option>
              <option>Hospitality Design</option>
              <option>Architecture</option>
              <option>Interior Design</option>
              <option>Landscape</option>
              <option>Commercial Space</option>
              <option>Township</option>
              <option>Others</option>
            </select>
            <input type="text" placeholder="Location" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors" />
            <button type="submit" className="mt-8 text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
              Get Quote Now
            </button>
          </form>
        </section>

        {/* 9. Footer */}
        <footer className="px-8 py-16 border-t border-[var(--border)]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="text-2xl font-bold tracking-wider" style={{ fontFamily: "var(--font-display), serif" }}>K</p>
              <p className="mt-2 text-sm text-[var(--text-muted)] italic">Driven by Vision, Defined by Impact.</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--text-muted)]">
              <p className="uppercase tracking-[0.15em] text-[var(--text)] text-xs mb-4">Quick Links</p>
              <a href="#projects" className="block hover:text-[var(--text)]">Projects</a>
              <a href="#services" className="block hover:text-[var(--text)]">Services</a>
              <a href="#about" className="block hover:text-[var(--text)]">About</a>
              <a href="#contact" className="block hover:text-[var(--text)]">Contact</a>
            </div>
            <div className="space-y-2 text-sm text-[var(--text-muted)]">
              <p className="uppercase tracking-[0.15em] text-[var(--text)] text-xs mb-4">Contact</p>
              <p>ar.shubhamkatyal@gmail.com</p>
              <p>+91 6377432778</p>
              <p>@katyal_architects</p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            <p>&copy; 2026 Katyal Architects. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
