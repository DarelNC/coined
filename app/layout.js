import { Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Two typefaces, on purpose: serif for the one brand moment (the wordmark),
// mono for everything else. See docs/design.md — this is the "code-first,
// not generic-SaaS" identity, not a default left untouched.
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic", "normal"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Coined",
  description: "Search real-world code to find out how other developers name things.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
