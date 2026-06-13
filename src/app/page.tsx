"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef } from "react";

export default function Home() {
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = sectionsRef.current?.querySelectorAll(".reveal");
    sections?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      <main className="" ref={sectionsRef}>
        {/* 1. Hero — Auto-rotating Project Carousel */}
        <section className="relative min-h-screen flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-[var(--border)]">
            {/* Full-screen project images — auto-rotates every 5s */}
          </div>

          {/* Left arrow */}
          <button className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Project name at bottom */}
          <div className="relative z-10 w-full p-6 md:p-10 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-xs uppercase tracking-[0.15em] text-white/70">Smile Luxury Salon</p>
          </div>
        </section>

        {/* 2. About / Firm */}
        <section id="about" className="reveal py-32 px-8">
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
        <section id="projects" className="reveal py-24 px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12 text-center">Services</p>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-5">
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
                className="group relative aspect-[4/3] rounded-lg flex items-center justify-center overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-[var(--border)] group-hover:bg-[var(--text)] transition-colors duration-300" />
                <p className="relative z-10 text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text)] group-hover:text-[var(--bg)] transition-colors duration-300">
                  {item.category}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* 4. Instagram Feed */}
        <section id="instagram" className="reveal py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">@katyal_architects</p>
              <a href="https://instagram.com/katyal_architects" target="_blank" className="text-xs uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">Follow →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[var(--border)] rounded-md hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Reviews */}
        <section id="reviews" className="reveal py-24 overflow-hidden">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mb-12">Happy Clients</p>
          <div className="max-w-5xl mx-auto px-8">
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
              {[
                { name: "Client Name", project: "Residential Villa", quote: "Working with Katyal Architects transformed our vision into reality. Every detail was considered." },
                { name: "Another Client", project: "Smile Salon", quote: "The design exceeded our expectations. A truly world-class experience." },
                { name: "Client Three", project: "Heritage Restoration", quote: "They understood our brief instantly and delivered beyond what we imagined." },
                { name: "Client Four", project: "Urban Township", quote: "A seamless experience from concept to completion. Highly recommended." },
                { name: "Client Five", project: "Boutique Hotel", quote: "Their attention to detail and understanding of space is unmatched." },
              ].map((review) => (
                <div key={review.name} className="w-[85vw] md:w-[calc(33.333%-14px)] flex-shrink-0 snap-center rounded-lg border border-[var(--border)] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <p className="text-sm font-light italic leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.1em]">{review.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{review.project}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Team */}
        <section id="team" className="reveal py-24 px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mb-12">Our Team</p>
          <div className="flex justify-center gap-8 md:gap-12 overflow-x-auto">
            {[
              { name: "Shubham Katyal", role: "Founder & Principal Architect" },
              { name: "Shelly Katyal", role: "Designer & Vastu" },
              { name: "Oreo", role: "Chief Happiness Officer" },
            ].map((member) => (
              <div key={member.name} className="text-center group cursor-pointer flex-shrink-0">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[var(--border)] mx-auto mb-4 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105" />
                <p className="text-xs md:text-sm uppercase tracking-[0.1em]">{member.name}</p>
                <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Contact */}
        <section id="contact" className="reveal py-24 px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8 text-center">Get in Touch</p>
          <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">Have a project in mind?</h2>
          <form className="w-full max-w-lg mx-auto space-y-6">
            <input type="text" placeholder="Name" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
            <input type="email" placeholder="Email" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
            <input type="tel" placeholder="Phone" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
            <select className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300 text-[var(--text-muted)]">
              <option value="">Select Service</option>
              <option>Hospitality Design</option>
              <option>Architecture</option>
              <option>Interior Design</option>
              <option>Landscape</option>
              <option>Commercial Space</option>
              <option>Township</option>
              <option>Others</option>
            </select>
            <input type="text" placeholder="Location" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
            <button type="submit" className="mt-8 text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              Get Quote Now
            </button>
          </form>
        </section>

        {/* 8. Footer */}
        <footer className="px-8 py-16 bg-[#0a0a0a] text-[#f5f5f5]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="text-2xl font-bold tracking-wider" style={{ fontFamily: "var(--font-display), serif" }}>K</p>
              <p className="mt-2 text-sm text-[#a3a3a3] italic">Driven by Vision, Defined by Impact.</p>
            </div>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p className="uppercase tracking-[0.15em] text-[#f5f5f5] text-xs mb-4">Quick Links</p>
              <a href="#projects" className="block hover:text-white transition-colors duration-300">Projects</a>
              <a href="#about" className="block hover:text-white transition-colors duration-300">About</a>
              <a href="#contact" className="block hover:text-white transition-colors duration-300">Contact</a>
            </div>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p className="uppercase tracking-[0.15em] text-[#f5f5f5] text-xs mb-4">Contact</p>
              <p className="text-[#a3a3a3]">ar.shubhamkatyal@gmail.com</p>
              <p className="text-[#a3a3a3]">+91 6377432778</p>
              <div className="flex items-center gap-3 mt-3">
                <a href="https://instagram.com/katyal_architects" target="_blank" className="hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="https://facebook.com" target="_blank" className="hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" className="hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#262626] text-xs text-[#a3a3a3]">
            <p>&copy; 2026 Katyal Architects. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
