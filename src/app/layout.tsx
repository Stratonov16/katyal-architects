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
const LOGO_URL = "https://pub-79d22fbf37e444a896d6acc795f2444b.r2.dev/static/logo/logo.jpg";

export const metadata: Metadata = {
  title: {
    default: "Katyal Architects | Driven by Vision, Defined by Impact",
    template: "%s | Katyal Architects",
  },
  description: "Katyal Architects is a design studio led by Shubham Katyal, creating architecture and interiors that balance bold vision with refined execution. Services: Residential, Hospitality, Interiors, Landscape, Commercial, Township.",
  keywords: ["architecture", "interior design", "Katyal Architects", "Shubham Katyal", "Hanumangarh", "Rajasthan", "luxury interiors", "hospitality design", "residential architecture", "commercial space", "landscape design", "township"],
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
  icons: {
    icon: LOGO_URL,
    apple: LOGO_URL,
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
