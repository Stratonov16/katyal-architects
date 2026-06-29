import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const SITE_URL = "https://katyalarchitects.com";
const LOGO_URL = "https://media.katyalarchitects.com/static/logo/logo.jpg";

export const metadata: Metadata = {
  title: {
    default: "Katyal Architects | Driven by Vision, Defined by Impact",
    template: "%s | Katyal Architects",
  },
  description: "Katyal Architects is a design studio led by Shubham Katyal, creating architecture and interiors that balance bold vision with refined execution. Services: Residential, Hospitality, Interiors, Landscape, Commercial, Township.",
  keywords: [
    "Katyal Architects", "Shubham Katyal", "architect Hanumangarh", "architect Rajasthan",
    "interior designer Hanumangarh", "best architect in Rajasthan", "luxury interior design",
    "architecture firm Rajasthan", "hospitality design India", "salon interior design",
    "residential architecture", "commercial interior design", "landscape design",
    "township planning", "modern home design Rajasthan", "luxury salon design",
    "architecture studio India", "interior architect", "home renovation Hanumangarh",
    "premium interiors", "Smile Luxury Salon",
  ],
  authors: [{ name: "Katyal Architects" }],
  creator: "Katyal Architects",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: "Katyal Architects | Driven by Vision, Defined by Impact",
    description: "Architecture & interior design studio creating spaces that inspire, transform, and endure.",
    siteName: "Katyal Architects",
    images: [
      {
        url: LOGO_URL,
        width: 512,
        height: 512,
        alt: "Katyal Architects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Katyal Architects",
    description: "Architecture & interior design studio. Driven by Vision, Defined by Impact.",
    images: [LOGO_URL],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Favicon / app icons are provided by the file-based convention:
  // src/app/icon.png and src/app/apple-icon.png (auto-detected by Next.js).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");var d=t==="light"?"light":"dark";document.documentElement.setAttribute("data-theme",d);document.documentElement.style.backgroundColor=d==="dark"?"#0a0a0a":"#ffffff";document.documentElement.style.color=d==="dark"?"#f5f5f5":"#0a0a0a"})()`,
          }}
        />
        {/* Structured data — tells Google this is an architecture business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["ArchitecturalService", "ProfessionalService", "LocalBusiness"],
              "@id": `${SITE_URL}/#business`,
              name: "Katyal Architects",
              alternateName: "Katyal Architects & Interior Designers",
              description: "Katyal Architects is an architecture and interior design studio led by Shubham Katyal in Hanumangarh, Rajasthan, creating residential, hospitality, commercial, and landscape projects.",
              url: SITE_URL,
              logo: LOGO_URL,
              image: LOGO_URL,
              email: "info@katyalarchitects.com",
              telephone: "+91-6377432778",
              founder: { "@type": "Person", name: "Shubham Katyal", jobTitle: "Principal Architect" },
              address: {
                "@type": "PostalAddress",
                streetAddress: "2/108 Housing Board Colony",
                addressLocality: "Hanumangarh",
                addressRegion: "Rajasthan",
                postalCode: "335512",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 29.5816,
                longitude: 74.3294,
              },
              hasMap: "https://maps.app.goo.gl/iuc8RB88AatwJu827",
              areaServed: [
                { "@type": "City", name: "Hanumangarh" },
                { "@type": "State", name: "Rajasthan" },
                { "@type": "Country", name: "India" },
              ],
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                opens: "09:00",
                closes: "19:00",
              },
              priceRange: "$$$",
              knowsAbout: ["Architecture", "Interior Design", "Hospitality Design", "Residential Design", "Commercial Spaces", "Landscape Design", "Township Planning"],
              sameAs: ["https://instagram.com/katyal_architects"],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
