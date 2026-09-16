"use client";

import { useEffect, useState } from "react";
import { useSearch, PAGE_SIZE } from "@/lib/useSearch";
import { PALETTES, DEFAULT_PALETTE } from "@/lib/palettes";

const EXAMPLES = ["debounce timer", "retry counter", "cache invalidation", "empty state"];
const LANGUAGES = [
  { label: "any", value: "" },
  { label: "js", value: "javascript" },
  { label: "ts", value: "typescript" },
  { label: "py", value: "python" },
  { label: "go", value: "go" },
  { label: "rust", value: "rust" },
  { label: "java", value: "java" },
];
const POP_COLORS = ["var(--accent)", "var(--pop-1)", "var(--pop-2)", "var(--pop-3)", "var(--pop-4)"];
const PALETTE_STORAGE_KEY = "coined-palette";

function popRotation(i) {
  return ((i % 5) - 2) * 1.5;
}

export default function MaximalistTheme() {
  const s = useSearch();
  const [paletteKey, setPaletteKey] = useState(DEFAULT_PALETTE);

  // Client-only preference, no cache/server sync — read once after mount so
  // server and first client render always match (no hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && PALETTES[saved]) setPaletteKey(saved);
    } catch {
      // localStorage unavailable (private mode, etc.) — just stay on default
    }
  }, []);

  function choosePalette(key) {
    setPaletteKey(key);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, key);
    } catch {
      // best-effort only — palette still applies for this session
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background" style={PALETTES[paletteKey].vars}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-14 sm:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="animate-wiggle-hover -rotate-3 rounded-full bg-accent px-5 py-2 text-3xl font-bold text-background">
              Coined
            </span>
            <span className="rotate-2 text-sm text-muted">what do you call this thing? 🤔</span>
          </div>

          <div className="flex gap-1.5 rounded-full bg-foreground/10 p-1.5">
            {Object.entries(PALETTES).map(([key, p]) => (
              <button
                key={key}
                onClick={() => choosePalette(key)}
                title={p.label}
                aria-label={`Switch to ${p.label} palette`}
                aria-pressed={paletteKey === key}
                className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  paletteKey === key ? "scale-110 border-foreground" : "border-transparent opacity-70"
                }`}
                style={{ backgroundColor: p.swatch }}
              />
            ))}
          </div>
        </header>

        <form onSubmit={s.handleSubmit} className="mt-10 flex gap-3">
          <input
            type="text"
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            placeholder="type your idea..."
            autoFocus
            disabled={s.status === "loading"}
            className="flex-1 rounded-full border-2 border-foreground/20 bg-foreground/10 px-6 py-3 font-medium text-foreground outline-none placeholder:text-foreground/40 focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={s.status === "loading"}
            className="flex shrink-0 items-center gap-2 rounded-full bg-pop-1 px-6 py-3 font-bold text-background transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
          >
            {s.status === "loading" ? (
              <>
                <Dots />
                <span>looking</span>
              </>
            ) : (
              "find it ✨"
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => s.selectLang(l.value)}
              disabled={s.status === "loading"}
              className={`rounded-full px-4 py-1 text-sm font-bold transition-colors disabled:opacity-50 ${
                s.lang === l.value
                  ? "bg-accent text-background"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-12 flex-1">
          {s.status === "idle" && (
            <div className="flex flex-wrap items-center gap-3">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex}
                  onClick={() => s.runExample(ex)}
                  style={{ borderColor: POP_COLORS[i % POP_COLORS.length] }}
                  className="rounded-2xl border-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
                >
                  {ex}
                </button>
              ))}
              <button
                onClick={() => s.runExample(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])}
                className="rounded-2xl bg-foreground/10 px-4 py-2 text-sm font-bold text-foreground transition-transform hover:scale-105 hover:bg-foreground/20"
              >
                🎲 surprise me
              </button>
            </div>
          )}

          {s.status === "loading" && (
            <div className="flex items-center gap-3 text-lg font-medium text-foreground/70">
              <Dots size="lg" />
              <span>looking around for &ldquo;{s.query}&rdquo;…</span>
            </div>
          )}

          {s.status === "error" && (
            <p className="w-fit rounded-2xl bg-pop-1 px-4 py-2 text-lg font-bold text-background">
              {s.errorMessage}
            </p>
          )}

          {s.status === "done" && s.variables.length === 0 && (
            <p className="text-lg font-medium text-foreground/70">
              nothing for &ldquo;{s.query}&rdquo; — try again? 🤷
            </p>
          )}

          {s.status === "done" && s.variables.length > 0 && (
            <>
              <div className="flex flex-wrap gap-4">
                {s.variables.slice(0, s.visibleCount).map((v, i) => {
                  const color = POP_COLORS[i % POP_COLORS.length];
                  const rot = popRotation(i);
                  return (
                    <div
                      key={v.keyword}
                      style={{ backgroundColor: color, "--rot": `${rot}deg`, animationDelay: `${i * 40}ms` }}
                      className="animate-pop-in flex flex-col rounded-2xl px-4 py-3 text-background shadow-lg transition-transform hover:scale-105 hover:rotate-0"
                    >
                      <button
                        onClick={() => s.copyKeyword(v.keyword)}
                        aria-label={s.copiedKeyword === v.keyword ? `${v.keyword}, copied` : `copy ${v.keyword}`}
                        title="click to copy"
                        className="text-left font-mono text-base font-bold"
                      >
                        {s.copiedKeyword === v.keyword ? "copied! ✅" : v.keyword}
                      </button>
                      <a
                        href={v.repoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium opacity-70 hover:underline"
                      >
                        {v.repoLang} · {v.repoList.length} repo{v.repoList.length === 1 ? "" : "s"}
                      </a>
                    </div>
                  );
                })}
              </div>

              {s.visibleCount < s.variables.length ? (
                <button
                  onClick={s.loadMore}
                  className="mt-6 rounded-full bg-foreground/10 px-5 py-2 text-sm font-bold text-foreground transition-transform hover:scale-105 hover:bg-foreground/20"
                >
                  {`show more ✨ (${s.variables.length - s.visibleCount})`}
                </button>
              ) : (
                s.variables.length > PAGE_SIZE && (
                  <p className="mt-6 text-sm font-medium text-foreground/60">that&apos;s all of them! 🎉</p>
                )
              )}
            </>
          )}
        </div>

        <footer className="mt-16 flex flex-col gap-1 text-xs font-medium text-foreground/50">
          <span>pulled straight from real, public code 🔍</span>
          <span className="text-foreground/30">running on coffee and bad decisions ☕</span>
        </footer>
      </div>
    </div>
  );
}

function Dots({ size = "sm" }) {
  const dot = size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5";
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.12}s` }}
          className={`animate-bounce-dot rounded-full bg-current ${dot}`}
        />
      ))}
    </span>
  );
}
