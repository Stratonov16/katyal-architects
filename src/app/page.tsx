"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useRef, useCallback, useState } from "react";

export default function Home() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const reviewIndex = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroSlides, setHeroSlides] = useState<{image_url: string; project_title: string; project_link: string}[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [about, setAbout] = useState<{headline: string; description: string; photo_url: string} | null>(null);
  const [reviews, setReviews] = useState<{client_name: string; project_name: string; quote: string; photo_url: string}[]>([]);
  const [team, setTeam] = useState<{name: string; role: string; photo_url: string}[]>([]);
  const [contact, setContact] = useState<{email: string; phone: string; address: string; maps_link: string} | null>(null);

  useEffect(() => {
    fetch("/api/public/hero").then((r) => r.json()).then((d) => { if (d.slides) setHeroSlides(d.slides); }).catch(() => {});
    fetch("/api/public/about").then((r) => r.json()).then((d) => { if (d.about) setAbout(d.about); }).catch(() => {});
    fetch("/api/public/reviews").then((r) => r.json()).then((d) => { if (d.reviews) setReviews(d.reviews); }).catch(() => {});
    fetch("/api/public/team").then((r) => r.json()).then((d) => { if (d.team) setTeam(d.team); }).catch(() => {});
    fetch("/api/public/contact").then((r) => r.json()).then((d) => { if (d.contact) setContact(d.contact); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const slideReviews = useCallback((direction: number) => {
    const slider = document.querySelector(".review-slider") as HTMLElement;
    if (!slider) return;
    const isMobile = window.innerWidth < 768;
    const step = isMobile ? 1 : 3;
    const total = 5;
    const maxIndex = isMobile ? total - 1 : Math.ceil(total / 3) - 1;

    reviewIndex.current += direction;
    if (reviewIndex.current > maxIndex) reviewIndex.current = 0;
    if (reviewIndex.current < 0) reviewIndex.current = maxIndex;

    const offset = isMobile
      ? reviewIndex.current * -100
      : reviewIndex.current * -100;
    slider.style.transform = `translateX(${offset}%)`;
  }, []);

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

    // Also observe grow elements
    const growElements = sectionsRef.current?.querySelectorAll(".reveal-grow");
    growElements?.forEach((el) => observer.observe(el));

    // Scroll progress
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    // Review auto-slide
    const interval = setInterval(() => slideReviews(1), 4000);

    // Arrow click handlers
    const prev = document.querySelector(".review-prev");
    const next = document.querySelector(".review-next");
    const handlePrev = () => slideReviews(-1);
    const handleNext = () => slideReviews(1);
    prev?.addEventListener("click", handlePrev);
    next?.addEventListener("click", handleNext);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
      prev?.removeEventListener("click", handlePrev);
      next?.removeEventListener("click", handleNext);
    };
  }, [slideReviews]);

  return (
    <>
      <Navbar />

      {/* Scroll progress bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="" ref={sectionsRef}>
        {/* 1. Hero — Auto-rotating Project Carousel */}
        <section className="relative min-h-screen flex items-end overflow-hidden">
          {/* Background media from D1/R2 */}
          {heroSlides.length > 0 ? (
            heroSlides.map((slide, i) => {
              const url = slide.image_url;
              const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
              const isYoutube = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("img.youtube.com");
              const youtubeId = isYoutube ? url.match(/vi\/([^/]+)/)?.[1] || url.match(/embed\/([^?]+)/)?.[1] || url.match(/v=([^&]+)/)?.[1] : null;

              return (
                <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : isYoutube && youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&modestbranding=1`}
                      className="w-full h-full"
                      style={{ transform: "scale(1.2)" }}
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={slide.project_title || "Project"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="absolute inset-0 bg-[var(--border)]" />
          )}

          {/* Left arrow */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all duration-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Project name at bottom */}
          <div className="relative z-10 w-full p-6 md:p-10 bg-gradient-to-t from-black/60 to-transparent">
            {heroSlides.length > 0 && heroSlides[currentSlide] ? (
              <Link href={heroSlides[currentSlide].project_link || "#"}>
                <p className="text-xs uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors">
                  {heroSlides[currentSlide].project_title || ""}
                </p>
              </Link>
            ) : (
              <p className="text-xs uppercase tracking-[0.15em] text-white/70">Loading...</p>
            )}
          </div>
        </section>

        {/* 2. About / Firm */}
        <section id="about" className="reveal py-32 px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8">About the Firm</p>
            {about?.photo_url && (
              <img src={about.photo_url} alt="About" className="w-32 h-32 rounded-full mx-auto mb-8 object-cover" />
            )}
            <h2 className="text-3xl md:text-5xl font-light leading-tight">
              {about?.headline || "We design spaces that inspire, transform, and endure."}
            </h2>
            <p className="mt-8 text-[var(--text-muted)] leading-relaxed max-w-xl mx-auto">
              {about?.description || "Katyal Architects is a design studio led by Shubham Katyal, creating architecture and interiors that balance bold vision with refined execution."}
            </p>
          </div>
        </section>

        {/* 3. Projects — Grid of Rectangular Boxes */}
        <section id="projects" className="reveal-grow py-24 px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12 text-center">Services</p>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { category: "Residential", slug: "residential" },
              { category: "Hospitality", slug: "hospitality" },
              { category: "Interiors", slug: "interiors" },
              { category: "Landscape", slug: "landscape" },
              { category: "Commercial", slug: "commercial" },
              { category: "Township", slug: "township" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/projects/${item.slug}`}
                className="group relative aspect-[4/3] rounded-md overflow-hidden"
              >
                {/* Background image placeholder */}
                <div className="absolute inset-0 bg-[var(--border)] group-hover:scale-105 transition-transform duration-500" />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                {/* Category name at bottom */}
                <p className="absolute bottom-4 left-4 z-10 text-[11px] md:text-xs uppercase tracking-[0.2em] text-white font-light">
                  {item.category}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Instagram Feed */}
        <section id="instagram" className="reveal-grow py-24 px-8">
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

        {/* 5. Reviews — One card at a time, auto-transitions, arrows */}
        <section id="reviews" className="reveal py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mb-12">Happy Clients</p>
          <div className="max-w-5xl mx-auto px-8 relative">
            {/* Left arrow */}
            <button className="review-prev absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-60 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            {/* Cards container — shows one at a time on mobile, 3 on desktop */}
            <div className="overflow-hidden mx-8 md:mx-12">
              <div className="review-slider flex transition-transform duration-500 ease-in-out">
                {(reviews.length > 0 ? reviews : [
                  { client_name: "Client Name", project_name: "Residential Villa", quote: "Working with Katyal Architects transformed our vision into reality. Every detail was considered.", photo_url: "" },
                  { client_name: "Another Client", project_name: "Smile Salon", quote: "The design exceeded our expectations. A truly world-class experience.", photo_url: "" },
                  { client_name: "Client Three", project_name: "Heritage Restoration", quote: "They understood our brief instantly and delivered beyond what we imagined.", photo_url: "" },
                ]).map((review) => (
                  <div key={review.client_name} className="w-full md:w-1/3 flex-shrink-0 px-2">
                    <div className="rounded-lg border border-[var(--review-border)] p-8 flex flex-col justify-between h-full shadow-sm">
                      <p className="text-base font-light italic leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em]">{review.client_name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{review.project_name}</p>
                        </div>
                        {review.photo_url ? (
                          <img src={review.photo_url} alt={review.client_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--border)] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right arrow */}
            <button className="review-next absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-60 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </section>

        {/* 6. Team */}
        <section id="team" className="reveal py-16 px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mb-12">Our Team</p>
          <div className="grid grid-cols-3 gap-4 max-w-sm md:max-w-2xl mx-auto px-4">
            {(team.length > 0 ? team : [
              { name: "Shubham Katyal", role: "Founder & Principal Architect", photo_url: "" },
              { name: "Shelly Katyal", role: "Designer", photo_url: "" },
              { name: "Oreo", role: "Chief Happiness Officer", photo_url: "" },
            ]).map((member) => (
              <div key={member.name} className="text-center group cursor-pointer">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="w-16 h-16 md:w-28 md:h-28 mx-auto mb-3 rounded-full object-cover shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                ) : (
                  <div className="w-16 h-16 md:w-28 md:h-28 bg-[var(--border)] mx-auto mb-3 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                )}
                <p className="text-[9px] md:text-sm uppercase tracking-[0.05em]">{member.name}</p>
                <p className="text-[8px] md:text-xs text-[var(--text-muted)] mt-1">{member.role}</p>
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
            <div className="flex items-center border-b border-[var(--border)] focus-within:border-[var(--text)] transition-colors duration-300 [&:has(input:invalid:not(:placeholder-shown))]:border-red-500">
              <span className="text-sm text-[var(--text-muted)] pr-2">+91</span>
              <input type="tel" pattern="[0-9]{10}" maxLength={10} placeholder="Phone Number" className="w-full bg-transparent py-3 text-sm outline-none invalid:[&:not(:placeholder-shown)]:text-red-500" onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} />
            </div>
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
            <div className="flex justify-center mt-8">
              <button type="submit" className="text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                Get Quote Now
              </button>
            </div>
          </form>
        </section>

        {/* 8. Footer */}
        <footer className="px-8 py-16 bg-[#0a0a0a] text-[#f5f5f5]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <img src="https://pub-79d22fbf37e444a896d6acc795f2444b.r2.dev/static/logo/logo.jpg" alt="Katyal Architects" className="w-10 h-10 object-contain" />
              <p className="mt-2 text-sm text-[#a3a3a3] italic">Driven by Vision, Defined by Impact.</p>
            </div>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p className="uppercase tracking-[0.15em] text-[#f5f5f5] text-xs mb-4">Quick Links</p>
              <a href="#about" className="block hover:text-white transition-colors duration-300">About</a>
              <a href="#projects" className="block hover:text-white transition-colors duration-300">Services</a>
              <a href="#reviews" className="block hover:text-white transition-colors duration-300">Reviews</a>
              <a href="#contact" className="block hover:text-white transition-colors duration-300">Contact</a>
              <a href="/admin" className="block hover:text-white transition-colors duration-300">Admin</a>
            </div>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p className="uppercase tracking-[0.15em] text-[#f5f5f5] text-xs mb-4">Contact</p>
              <a href={contact?.maps_link || "https://maps.app.goo.gl/iuc8RB88AatwJu827"} target="_blank" className="text-[#a3a3a3] hover:text-white transition-colors duration-300 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {contact?.address || "2/108 Housing Board Colony, Hanumangarh, Rajasthan"} ↗
              </a>
              <p className="text-[#a3a3a3]">{contact?.email || "ar.shubhamkatyal@gmail.com"}</p>
              <p className="text-[#a3a3a3]">{contact?.phone || "+91 6377432778"}</p>
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
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#262626] text-xs text-[#a3a3a3] flex flex-col md:flex-row justify-between items-center gap-2">
            <p>&copy; 2026 Katyal Architects. All rights reserved.</p>
            <p>Made with 🤍 by <a href="https://github.com/Stratonov16" target="_blank" className="hover:text-white transition-colors">Nikhil</a></p>
          </div>
        </footer>
      </main>
    </>
  );
}
