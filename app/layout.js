import { Fredoka, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Two typefaces: Fredoka (rounded, playful) for the wordmark/UI voice,
// JetBrains Mono for anything that's literally code (results). See
// docs/design.md for the maximalist direction this backs.
const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const SITE_URL = "https://coined.vercel.app";
const TITLE = "Coined";
const DESCRIPTION = "Search real-world code to find out how other developers name things.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "variable naming",
    "naming conventions",
    "code search",
    "developer tools",
    "codelf alternative",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: TITLE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Structured data (schema.org SoftwareApplication) — not just for search
// engines' rich results. Explicit, unambiguous fields like this are also
// what AI answer engines/crawlers can parse and cite reliably, unlike
// prose they have to interpret. See docs/architecture.md's naming/credit
// rationale for why the original Codelf is referenced here.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: TITLE,
  description: DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (web-based)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isBasedOn: "https://github.com/unbug/codelf",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
