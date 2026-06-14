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

export const metadata: Metadata = {
  title: "Katyal Architects",
  description: "Driven by Vision, Defined by Impact.",
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
