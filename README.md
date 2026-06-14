# Katyal Architects — Portfolio Website & CMS

A custom-built portfolio website and content management system for **Katyal Architects**, an architecture and interior design firm led by Shubham Katyal.

**Live:** [katyal-architects.pages.dev](https://katyal-architects.pages.dev)

---

## Overview

Full-stack architecture portfolio with:
- Public-facing website (single-scroll homepage + project pages)
- Admin panel for content management (no-code editing)
- Draft/approval workflow (super admin + client admin roles)
- Image & video hosting with Cloudflare R2
- Database-driven dynamic content

---

## Features

### Public Website
- **Hero Carousel** — Auto-rotating project images/videos with crossfade transitions
- **About Section** — Firm philosophy and description
- **Services Grid** — 6 categories (Residential, Hospitality, Interiors, Landscape, Commercial, Township) with cover images
- **Instagram Feed** — Section for auto-synced posts (API integration pending)
- **Reviews Carousel** — Client testimonials with horizontal swipe, auto-rotation
- **Team Section** — Circular photos, grayscale-to-color on click
- **Contact Form** — "Get Quote Now" with +91 prefix, service dropdown, saves to database
- **Careers Page** — Job listings with full application form (resume upload)
- **Project Pages** — ZHA-style layout: full-width hero, sidebar metadata, stacked gallery with scroll reveal
- **Category Pages** — Grid of projects per service category
- **404 Page** — Custom page with Oreo (the office dog)

### Design
- **Dual Theme** — Dark (default) + Light with toggle, no flash on navigation
- **Fonts** — Cormorant Garamond (display/headings) + Outfit (body)
- **Animations** — Scroll reveal, hover effects, image gallery grow-on-scroll
- **Responsive** — Mobile-first with hamburger menu, swipeable carousels
- **Style Reference** — Sabyasachi.com (editorial), UNStudio (transitions), ZHA (project layout)

### Admin Panel (`/admin`)
- **Authentication** — JWT-based with httpOnly cookies, rate-limited login (5 attempts/15min lockout)
- **Two Roles:**
  - Super Admin — publishes immediately, manages everything
  - Client Admin — submits drafts for approval
- **Sections:**
  - Hero Carousel — upload images/videos, set project links, reorder
  - Projects — full CRUD with multi-image upload, featured image selector, category assignment
  - Services — upload cover images for each category
  - Team — add/edit/delete members with photo, reorder (super admin)
  - Reviews — add/edit/delete client testimonials with photo
  - About — edit headline, description, firm photo
  - Contact — update contact info, view "Get Quote" submissions
  - Careers — post jobs, view applications with resumes
  - Drafts — super admin reviews and approves pending changes
  - Analytics — website traffic (visitors, page views) from Cloudflare
- **Image Crop Tool** — drag, zoom, aspect ratio presets (16:9, 4:3, 1:1, free, etc.)
- **Video Upload** — direct MP4 upload (no watermark) or YouTube URL
- **Toast Notifications** — floating success/error messages

### SEO
- Meta tags, Open Graph, Twitter cards
- Auto-generated sitemap (`/sitemap.xml`)
- robots.txt (blocks /admin/ and /api/ from indexing)
- Semantic HTML structure

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 | Full-stack React framework |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Language | TypeScript | Type safety |
| Hosting | Cloudflare Pages | Website deployment |
| Database | Cloudflare D1 (SQLite) | Structured data storage |
| File Storage | Cloudflare R2 | Images, videos, resumes |
| CDN + Security | Cloudflare | DDoS protection, SSL, caching |
| Auth | JWT (jose library) | Admin authentication |
| Image Crop | react-easy-crop | Client-side image cropping |
| Domain | Cloudflare Registrar | katyalarchitects.com (planned) |

**Total cost: ~$9/year (domain only). Everything else is free tier.**

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage (single scroll)
│   ├── layout.tsx                  # Root layout (fonts, theme, SEO)
│   ├── not-found.tsx               # Custom 404 (Oreo)
│   ├── sitemap.ts                  # Auto-generated sitemap
│   ├── robots.ts                   # Search engine rules
│   ├── careers/                    # Public careers page + apply form
│   ├── projects/[category]/        # Category listing
│   ├── projects/[category]/[slug]/ # Individual project page
│   ├── admin/                      # Admin panel pages
│   │   ├── login/                  # Authentication
│   │   ├── register/               # Client admin registration
│   │   ├── hero/                   # Hero carousel manager
│   │   ├── projects/               # Project CRUD
│   │   ├── services/               # Service cover images
│   │   ├── team/                   # Team members
│   │   ├── reviews/                # Client testimonials
│   │   ├── about/                  # Firm info editor
│   │   ├── contact/                # Contact info + form submissions
│   │   ├── careers/                # Job postings + applications
│   │   └── drafts/                 # Approval queue (super admin)
│   └── api/
│       ├── auth/                   # Login, logout, register, me
│       ├── admin/                  # Protected CRUD endpoints
│       └── public/                 # Public read endpoints
├── components/
│   ├── Navbar.tsx                  # Navigation (desktop + mobile)
│   ├── AdminHeader.tsx             # Admin top bar
│   ├── ThemeToggle.tsx             # Dark/light switch
│   ├── Logo.tsx                    # Reusable logo (from R2)
│   ├── Toast.tsx                   # Floating notifications
│   ├── ImageCropper.tsx            # Crop tool modal
│   ├── VideoUploader.tsx           # Video upload/YouTube modal
│   └── GallerySection.tsx          # Scroll-reveal image gallery
├── lib/
│   ├── auth.ts                     # JWT, rate limiting, validation
│   ├── db.ts                       # D1 database helpers
│   ├── r2.ts                       # R2 upload/delete helpers
│   └── projects.ts                 # Hardcoded fallback data
└── env.d.ts                        # Cloudflare type definitions
```

---

## Database Schema (D1)

| Table | Purpose |
|-------|---------|
| `projects` | All projects (title, category, description, location, year, status) |
| `project_images` | Images per project (URLs, featured flag, order) |
| `hero_slides` | Hero carousel slides (image URL, project link) |
| `team` | Team members (name, role, photo) |
| `reviews` | Client testimonials (name, quote, photo) |
| `about` | Firm info (headline, description, photo) — single row |
| `contact_info` | Contact details (email, phone, address) — single row |
| `contact_submissions` | "Get Quote" form entries |
| `services` | Service category cover images |
| `careers` | Job postings |
| `job_applications` | Career applications (with resume URL) |
| `client_admins` | Registered admin accounts |
| `drafts` | Pending changes awaiting approval |

---

## Getting Started

### Prerequisites
- Node.js 20+ (22+ for wrangler commands)
- nvm (Node Version Manager)
- Cloudflare account
- Git

### Local Development

```bash
# Install dependencies
npm install

# Run Next.js dev server (no DB/R2 — uses fallback data)
npm run dev
# Open http://localhost:3000

# Run with Cloudflare bindings (D1 + R2)
nvm use 22
npm run cloud-build
npm run cloud-run
# Open http://localhost:8788
```

### Environment Variables

Create `.env.local`:
```env
SUPER_ADMIN_EMAIL=admin@gmail.com
SUPER_ADMIN_PASSWORD=12345678
JWT_SECRET=your-random-secret-string
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### Deployment

Automatic via GitHub → Cloudflare Pages:
1. Push to `main` branch
2. Cloudflare auto-builds with `npx @cloudflare/next-on-pages`
3. Deploys to `katyal-architects.pages.dev`

### Cloudflare Secrets (Production)

```bash
nvm use 22
npx wrangler pages secret put SUPER_ADMIN_EMAIL --project-name=katyal-architects
npx wrangler pages secret put SUPER_ADMIN_PASSWORD --project-name=katyal-architects
npx wrangler pages secret put JWT_SECRET --project-name=katyal-architects
```

---

## NPM Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run cloud-build` | Build for Cloudflare Pages |
| `npm run cloud-run` | Run locally with D1 + R2 bindings |
| `npm run cloud` | Build + run (both together) |
| `npm run lint` | Run ESLint |

---

## Admin Workflow

### Super Admin
1. Login at `/admin/login`
2. Add/edit content → publishes immediately
3. Review drafts at `/admin/drafts` → approve or reject

### Client Admin
1. Register at `/admin/register`
2. Login at `/admin/login`
3. Add/edit content → saved as draft
4. Super admin must approve before it goes live

---

## Design Decisions

- **Style:** Editorial luxury (inspired by Sabyasachi, ZHA, UNStudio)
- **Typography:** Cormorant Garamond (serif, editorial) + Outfit (sans, clean)
- **Colors:** Black & white only, no accent colors (except golden review borders in dark mode)
- **Layout:** Single-scroll homepage, full-width imagery, generous whitespace
- **Mobile:** Hamburger nav with slide-from-left panel, swipeable carousels
- **Performance:** Edge runtime, lazy loading, CSS-only animations (no heavy JS libraries)

---

## Credits

- **Client:** Shubham Katyal — Katyal Architects
- **Developer:** [Nikhil Sachdeva](https://github.com/Stratonov16)
- **Powered by:** Cloudflare (Pages, D1, R2) + Next.js

---

Made with 🤍 by [Nikhil](https://github.com/Stratonov16)
