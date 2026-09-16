"use client";

import { useEffect, useRef, useState } from "react";

const EXAMPLES = ["debounce timer", "retry counter", "cache invalidation", "empty state"];
const PAGE_SIZE = 8;

const LANGUAGES = [
  { label: "any", value: "" },
  { label: "js", value: "javascript" },
  { label: "ts", value: "typescript" },
  { label: "py", value: "python" },
  { label: "go", value: "go" },
  { label: "rust", value: "rust" },
  { label: "java", value: "java" },
];

const POP_COLORS = [
  "var(--accent)",
  "var(--pop-pink)",
  "var(--pop-cyan)",
  "var(--pop-lime)",
  "var(--pop-orange)",
];

function popRotation(i) {
  return ((i % 5) - 2) * 1.5;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [variables, setVariables] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKeyword, setCopiedKeyword] = useState("");
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  async function copyKeyword(keyword) {
    try {
      await navigator.clipboard.writeText(keyword);
    } catch {
      return;
    }
    clearTimeout(copyTimeoutRef.current);
    setCopiedKeyword(keyword);
    copyTimeoutRef.current = setTimeout(() => setCopiedKeyword(""), 1200);
  }

  async function runSearch(q, searchLang) {
    if (!q) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const params = new URLSearchParams({ q });
      if (searchLang) params.set("lang", searchLang);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Oops, that broke.");
        setStatus("error");
        return;
      }

      setVariables(data.variables);
      setVisibleCount(PAGE_SIZE);
      setStatus("done");
    } catch {
      setErrorMessage("Oops, that broke.");
      setStatus("error");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(query.trim(), lang);
  }

  function runExample(example) {
    setQuery(example);
    runSearch(example, lang);
  }

  function surpriseMe() {
    const pick = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    runExample(pick);
  }

  function selectLang(value) {
    setLang(value);
    if (query.trim()) runSearch(query.trim(), value);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-14 sm:px-10">
        <header className="flex flex-wrap items-center gap-4">
          <span className="animate-wiggle-hover -rotate-3 rounded-full bg-accent px-5 py-2 text-3xl font-bold text-background">
            Coined
          </span>
          <span className="rotate-2 text-sm text-muted">what do you call this thing? 🤔</span>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="type your idea..."
            autoFocus
            disabled={status === "loading"}
            className="flex-1 rounded-full border-2 border-foreground/20 bg-foreground/10 px-6 py-3 font-medium text-foreground outline-none placeholder:text-foreground/40 focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex shrink-0 items-center gap-2 rounded-full bg-pop-pink px-6 py-3 font-bold text-background transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
          >
            {status === "loading" ? (
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
              onClick={() => selectLang(l.value)}
              disabled={status === "loading"}
              className={`rounded-full px-4 py-1 text-sm font-bold transition-colors disabled:opacity-50 ${
                lang === l.value
                  ? "bg-accent text-background"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-12 flex-1">
          {status === "idle" && (
            <div className="flex flex-wrap items-center gap-3">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex}
                  onClick={() => runExample(ex)}
                  style={{ borderColor: POP_COLORS[i % POP_COLORS.length] }}
                  className="rounded-2xl border-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
                >
                  {ex}
                </button>
              ))}
              <button
                onClick={surpriseMe}
                className="rounded-2xl bg-foreground/10 px-4 py-2 text-sm font-bold text-foreground transition-transform hover:scale-105 hover:bg-foreground/20"
              >
                🎲 surprise me
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center gap-3 text-lg font-medium text-foreground/70">
              <Dots size="lg" />
              <span>looking around for &ldquo;{query}&rdquo;…</span>
            </div>
          )}

          {status === "error" && (
            <p className="w-fit rounded-2xl bg-pop-pink px-4 py-2 text-lg font-bold text-background">
              {errorMessage}
            </p>
          )}

          {status === "done" && variables.length === 0 && (
            <p className="text-lg font-medium text-foreground/70">
              nothing for &ldquo;{query}&rdquo; — try again? 🤷
            </p>
          )}

          {status === "done" && variables.length > 0 && (
            <>
              <div className="flex flex-wrap gap-4">
                {variables.slice(0, visibleCount).map((v, i) => {
                  const color = POP_COLORS[i % POP_COLORS.length];
                  const rot = popRotation(i);
                  return (
                    <div
                      key={v.keyword}
                      style={{ backgroundColor: color, "--rot": `${rot}deg`, animationDelay: `${i * 40}ms` }}
                      className="animate-pop-in flex flex-col rounded-2xl px-4 py-3 text-background shadow-lg transition-transform hover:scale-105 hover:rotate-0"
                    >
                      <button
                        onClick={() => copyKeyword(v.keyword)}
                        aria-label={copiedKeyword === v.keyword ? `${v.keyword}, copied` : `copy ${v.keyword}`}
                        title="click to copy"
                        className="text-left font-mono text-base font-bold"
                      >
                        {copiedKeyword === v.keyword ? "copied! ✅" : v.keyword}
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

              {visibleCount < variables.length ? (
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="mt-6 rounded-full bg-foreground/10 px-5 py-2 text-sm font-bold text-foreground transition-transform hover:scale-105 hover:bg-foreground/20"
                >
                  {`show more ✨ (${variables.length - visibleCount})`}
                </button>
              ) : (
                variables.length > PAGE_SIZE && (
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
