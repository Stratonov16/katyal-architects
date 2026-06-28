"use client";

import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useEffect, useRef, useCallback, useState } from "react";

export default function Home() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const reviewIndex = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTeamMember, setActiveTeamMember] = useState<string | null>(null);
  const [heroSlides, setHeroSlides] = useState<{image_url: string; project_title: string; project_link: string; location?: string; duration?: number}[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [about, setAbout] = useState<{headline: string; description: string; photo_url: string} | null>(null);
  const [reviews, setReviews] = useState<{client_name: string; project_name: string; quote: string; photo_url: string}[]>([]);
  const [team, setTeam] = useState<{name: string; role: string; photo_url: string}[]>([]);
  const [contact, setContact] = useState<{email: string; phone: string; address: string; maps_link: string} | null>(null);
  const [services, setServices] = useState<{slug: string; name: string; image_url: string}[]>([]);

  useEffect(() => {
    fetch("/api/public/hero").then((r) => r.json()).then((d) => { if (d.slides) setHeroSlides(d.slides); }).catch(() => {});
    fetch("/api/public/about").then((r) => r.json()).then((d) => { if (d.about) setAbout(d.about); }).catch(() => {});
    fetch("/api/public/reviews").then((r) => r.json()).then((d) => { if (d.reviews) setReviews(d.reviews); }).catch(() => {});
    fetch("/api/public/team").then((r) => r.json()).then((d) => { if (d.team) setTeam(d.team); }).catch(() => {});
    fetch("/api/public/contact").then((r) => r.json()).then((d) => { if (d.contact) setContact(d.contact); }).catch(() => {});
    fetch("/api/public/services").then((r) => r.json()).then((d) => { if (d.services) setServices(d.services); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    // Each slide advances after its own configured duration (seconds).
    const current = heroSlides[currentSlide];
    const seconds = current?.duration && current.duration > 0 ? current.duration : 4;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, seconds * 1000);
    return () => clearTimeout(timer);
  }, [heroSlides, currentSlide]);

  const slideReviews = useCallback((direction: number) => {
    const slider = document.querySelector(".review-slider") as HTMLElement;
    if (!slider) return;
    const isMobile = window.innerWidth < 768;
    const cards = slider.children.length;
    if (cards === 0) return;
    const maxIndex = isMobile ? cards - 1 : Math.max(0, cards - 3);

    reviewIndex.current += direction;
    if (reviewIndex.current > maxIndex) reviewIndex.current = 0;
    if (reviewIndex.current < 0) reviewIndex.current = maxIndex;

    const cardWidth = isMobile ? 100 : 100 / 3;
    slider.style.transform = `translateX(-${reviewIndex.current * cardWidth}%)`;
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
      <Loader />
      <Navbar />

      {/* Scroll progress bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="" ref={sectionsRef}>
        {/* 1. Hero — Auto-rotating Project Carousel */}
        <section className="relative min-h-[calc(100vh-3.5rem)] mt-14 flex items-end overflow-hidden">
          {/* Background media from D1/R2 */}
          {heroSlides.length > 0 ? (
            heroSlides.map((slide, i) => {
              const url = slide.image_url;
              const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
              const isYoutube = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("img.youtube.com");
              const youtubeId = isYoutube ? url.match(/vi\/([^/]+)/)?.[1] || url.match(/embed\/([^?]+)/)?.[1] || url.match(/v=([^&]+)/)?.[1] : null;

              return (
                <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
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

          {/* Left edge shade — full-height gradient behind the arrow (visual only) */}
          <div className="absolute left-0 top-0 bottom-0 z-10 w-8 md:w-12 bg-gradient-to-r from-[var(--hero-shade)] to-transparent pointer-events-none" />
          {/* Left arrow — bare chevron, theme-aware color */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="group absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-[var(--arrow-icon)]"
            aria-label="Previous slide"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all duration-300">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right edge shade — full-height gradient behind the arrow (visual only) */}
          <div className="absolute right-0 top-0 bottom-0 z-10 w-8 md:w-12 bg-gradient-to-l from-[var(--hero-shade)] to-transparent pointer-events-none" />
          {/* Right arrow — bare chevron, theme-aware color */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="group absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-[var(--arrow-icon)]"
            aria-label="Next slide"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Project name + dots at bottom */}
          <div className="relative z-10 w-full px-8 md:px-16 pb-12 md:pb-16 pt-32 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            {heroSlides.length > 0 && heroSlides[currentSlide] ? (
              <Link href={heroSlides[currentSlide].project_link || "#"} className="group inline-block">
                <h2 className="text-3xl md:text-6xl font-light text-white tracking-wide group-hover:opacity-80 transition-opacity" style={{ fontFamily: "var(--font-display), serif" }}>
                  {heroSlides[currentSlide].project_title || ""}
                </h2>
                {heroSlides[currentSlide].location && (
                  <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/70 mt-2">
                    {heroSlides[currentSlide].location}
                  </p>
                )}
              </Link>
            ) : (
              <p className="text-sm uppercase tracking-[0.15em] text-white/60">Loading...</p>
            )}

            {/* Dot indicators */}
            {heroSlides.length > 1 && (
              <div className="flex gap-2 mt-6">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/60"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Scroll-down indicator — original bare chevron */}
          <a
            href="#about"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors animate-bounce-slow"
            aria-label="Scroll down"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </section>

        {/* 2. About / Firm */}
        <section id="about" className="reveal pt-20 pb-12 px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8">About the Firm</p>
            {about?.photo_url && (
              <img
                src={about.photo_url}
                alt="About"
                className="max-w-xs md:max-w-sm w-full h-auto rounded-md mx-auto mb-8"
              />
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
        <section id="projects" className="reveal-grow pt-12 pb-24 px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-12 text-center">Services</p>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {(services.length > 0 ? services : [
              { name: "Residential", slug: "residential", image_url: "" },
              { name: "Hospitality", slug: "hospitality", image_url: "" },
              { name: "Interiors", slug: "interiors", image_url: "" },
              { name: "Landscape", slug: "landscape", image_url: "" },
              { name: "Commercial", slug: "commercial", image_url: "" },
              { name: "Township", slug: "township", image_url: "" },
            ]).map((item) => (
              <Link
                key={item.slug}
                href={`/projects/${item.slug}`}
                className="group relative aspect-[4/3] rounded-md overflow-hidden"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-[var(--border)] group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                <p className="absolute bottom-4 left-4 z-10 text-[11px] md:text-xs uppercase tracking-[0.2em] text-white font-light">
                  {item.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Instagram Feed */}
        <section id="instagram" className="reveal-grow py-20 px-8">
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
              <div key={member.name} className="text-center cursor-pointer" onClick={() => setActiveTeamMember(activeTeamMember === member.name ? null : member.name)}>
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className={`w-16 h-16 md:w-28 md:h-28 mx-auto mb-3 rounded-full object-cover shadow-sm transition-all duration-300 ${activeTeamMember === member.name ? "grayscale-0 scale-105 shadow-md -translate-y-1" : "grayscale md:hover:grayscale-0 md:hover:scale-105 md:hover:shadow-md md:hover:-translate-y-1"}`} />
                ) : (
                  <div className={`w-16 h-16 md:w-28 md:h-28 bg-[var(--border)] mx-auto mb-3 rounded-full shadow-sm transition-all duration-300 ${activeTeamMember === member.name ? "scale-105 shadow-md -translate-y-1" : "md:hover:scale-105 md:hover:shadow-md md:hover:-translate-y-1"}`} />
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
          <form className="w-full max-w-lg mx-auto space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const body = {
              name: formData.get("name"),
              email: formData.get("email"),
              phone: formData.get("phone"),
              service: formData.get("service"),
              location: formData.get("location"),
            };
            try {
              const res = await fetch("/api/public/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (res.ok) {
                alert(data.message || "Thank you! We'll get back to you soon.");
                form.reset();
              } else {
                alert(data.error || "Something went wrong. Try again.");
              }
            } catch {
              alert("Something went wrong. Try again.");
            }
          }}>
            <input name="name" type="text" placeholder="Name" required className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
            <input name="email" type="email" placeholder="Email" required className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
            <div className="flex items-center border-b border-[var(--border)] focus-within:border-[var(--text)] transition-colors duration-300 [&:has(input:invalid:not(:placeholder-shown))]:border-red-500">
              <span className="text-sm text-[var(--text-muted)] pr-2">+91</span>
              <input name="phone" type="tel" pattern="[0-9]{10}" maxLength={10} placeholder="Phone Number" className="w-full bg-transparent py-3 text-sm outline-none invalid:[&:not(:placeholder-shown)]:text-red-500" onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} />
            </div>
            <select name="service" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300 text-[var(--text-muted)]">
              <option value="">Select Service</option>
              <option>Residential</option>
              <option>Hospitality</option>
              <option>Interiors</option>
              <option>Landscape</option>
              <option>Commercial</option>
              <option>Township</option>
              <option>Others</option>
            </select>
            <input name="location" type="text" placeholder="Location" className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors duration-300" />
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
              <img src="https://media.katyalarchitects.com/static/logo/logo.jpg" alt="Katyal Architects" className="w-10 h-10 object-cover rounded-full" />
              <p className="mt-2 text-sm text-[#a3a3a3] italic">Driven by Vision, Defined by Impact.</p>
            </div>
            <div className="text-sm text-[#a3a3a3]">
              <p className="uppercase tracking-[0.15em] text-[#f5f5f5] text-xs mb-4">Quick Links</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <a href="#about" className="hover:text-white transition-colors duration-300">About</a>
                <a href="#reviews" className="hover:text-white transition-colors duration-300">Reviews</a>
                <a href="#projects" className="hover:text-white transition-colors duration-300">Services</a>
                <a href="#contact" className="hover:text-white transition-colors duration-300">Contact</a>
                <a href="#team" className="hover:text-white transition-colors duration-300">Team</a>
                <a href="/admin" className="hover:text-white transition-colors duration-300">Admin</a>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p className="uppercase tracking-[0.15em] text-[#f5f5f5] text-xs mb-4">Contact</p>
              <a href={contact?.maps_link || "https://maps.app.goo.gl/iuc8RB88AatwJu827"} target="_blank" className="text-[#a3a3a3] hover:text-white transition-colors duration-300 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {contact?.address || "2/108 Housing Board Colony, Hanumangarh, Rajasthan"} ↗
              </a>
              <p className="text-[#a3a3a3]">{contact?.email || "info@katyalarchitects.com"}</p>
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
