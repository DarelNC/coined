"use client";

import { useEffect, useState } from "react";
import MaximalistTheme from "./themes/MaximalistTheme";
import EditorialTheme from "./themes/EditorialTheme";
import BrutalistTheme from "./themes/BrutalistTheme";

const STORAGE_KEY = "coined-theme";
const DEFAULT_THEME = "maximalist";

const THEMES = {
  maximalist: { label: "Maximalist", dot: "#ffd23f", Component: MaximalistTheme },
  editorial: { label: "Editorial", dot: "#a13d2f", Component: EditorialTheme },
  brutalist: { label: "Brutalist", dot: "#ff3b1f", Component: BrutalistTheme },
};

export default function Home() {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Client-only preference, no cache/server sync — reads once after mount so
  // server and first client render always match (no hydration mismatch).
  // This is the documented legitimate case for an effect (syncing from an
  // external client-only store), not state derived from props/other state.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && THEMES[saved]) setTheme(saved);
    } catch {
      // localStorage unavailable (private mode, etc.) — just stay on default
    }
  }, []);

  function chooseTheme(key) {
    setTheme(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // best-effort only — theme still applies for this session
    }
  }

  const ActiveTheme = THEMES[theme].Component;

  return (
    <>
      <div className="fixed right-4 top-4 z-50 flex gap-1 rounded-full bg-black/70 p-1 backdrop-blur-sm">
        {Object.entries(THEMES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => chooseTheme(key)}
            title={t.label}
            aria-label={`Switch to ${t.label} theme`}
            aria-pressed={theme === key}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
              theme === key ? "border-white scale-110" : "border-transparent opacity-70"
            }`}
            style={{ backgroundColor: t.dot }}
          />
        ))}
      </div>
      <ActiveTheme />
    </>
  );
}
