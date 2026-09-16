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

export const metadata = {
  title: "Coined",
  description: "Search real-world code to find out how other developers name things.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
