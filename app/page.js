"use client";

import { useEffect, useRef, useState } from "react";

const EXAMPLES = ["debounce timer", "retry counter", "cache invalidation", "empty state"];
const PAGE_SIZE = 10;

// Sourcegraph lang: values. Kept short on purpose — a handful of common
// languages, not an exhaustive picker.
const LANGUAGES = [
  { label: "any", value: "" },
  { label: "js", value: "javascript" },
  { label: "ts", value: "typescript" },
  { label: "py", value: "python" },
  { label: "go", value: "go" },
  { label: "rust", value: "rust" },
  { label: "java", value: "java" },
];

// Classic CLI braille spinner (npm/yarn-style) — on-brand for a terminal-ish
// UI, and generic enough to represent "waiting on some upstream," whichever
// source (Sourcegraph, GitHub, a future one) actually answers the request.
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function useSpinner(active) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, [active]);

  return SPINNER_FRAMES[frame];
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
  const spinner = useSpinner(status === "loading");

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
        setErrorMessage(data.error || "search failed, try again.");
        setStatus("error");
        return;
      }

      setVariables(data.variables);
      setVisibleCount(PAGE_SIZE);
      setStatus("done");
    } catch {
      setErrorMessage("search failed, try again.");
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

  function selectLang(value) {
    setLang(value);
    // if there's an active query, re-run it immediately under the new filter
    if (query.trim()) runSearch(query.trim(), value);
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16 sm:px-10">
        <header className="flex items-baseline justify-between gap-4 border-b border-border pb-6">
          <h1 className="font-serif text-4xl italic tracking-tight text-foreground">Codelf</h1>
          <p className="hidden shrink-0 text-xs text-muted sm:block">
            {"// real names, from real code"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 flex items-center gap-3 border-b border-border pb-3">
          <span className="select-none text-accent">&gt;</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="what are you trying to name?"
            autoFocus
            disabled={status === "loading"}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 text-sm text-muted transition-colors hover:text-accent disabled:opacity-50"
          >
            {status === "loading" ? `${spinner} searching` : "[ search ]"}
          </button>
        </form>

        <div className="mt-3 flex gap-4">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => selectLang(l.value)}
              disabled={status === "loading"}
              className={`text-xs transition-colors disabled:opacity-50 ${
                lang === l.value ? "text-accent" : "text-muted hover:text-accent"
              }`}
            >
              [{l.label}]
            </button>
          ))}
        </div>

        <div className="mt-8 flex-1">
          {status === "idle" && (
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  onClick={() => runExample(example)}
                  className="w-fit text-left text-sm text-muted transition-colors hover:text-accent"
                >
                  {"// try: "}
                  {example}
                </button>
              ))}
            </div>
          )}

          {status === "loading" && (
            <p className="text-sm text-muted">
              <span className="text-accent">{spinner}</span> searching for &ldquo;{query}&rdquo;…
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-accent">
              {"! "}
              {errorMessage}
            </p>
          )}

          {status === "done" && variables.length === 0 && (
            <p className="text-sm text-muted">
              {"// nothing found for \""}
              {query}
              {"\" — try different words"}
            </p>
          )}

          {status === "done" && variables.length > 0 && (
            <>
              <ul className="flex flex-col">
                {variables.slice(0, visibleCount).map((v) => (
                  <li
                    key={v.keyword}
                    className="group/row flex items-baseline justify-between gap-4 border-l-2 border-border pl-4 py-3 transition-colors hover:border-accent"
                  >
                    <button
                      onClick={() => copyKeyword(v.keyword)}
                      title="click to copy"
                      aria-label={
                        copiedKeyword === v.keyword ? `${v.keyword}, copied` : `copy ${v.keyword}`
                      }
                      className="group/chip truncate text-lg text-foreground transition-colors hover:text-accent"
                    >
                      <span className="text-accent opacity-0 transition-opacity group-hover/chip:opacity-100">
                        {"[ "}
                      </span>
                      {copiedKeyword === v.keyword ? "copied" : v.keyword}
                      <span className="text-accent opacity-0 transition-opacity group-hover/chip:opacity-100">
                        {" ]"}
                      </span>
                    </button>
                    <a
                      href={v.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-muted transition-colors hover:text-accent"
                    >
                      {v.repoLang} · {v.repoList.length} repo{v.repoList.length === 1 ? "" : "s"}
                    </a>
                  </li>
                ))}
              </ul>

              {visibleCount < variables.length ? (
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="mt-4 text-sm text-muted transition-colors hover:text-accent"
                >
                  {`[ load more — ${variables.length - visibleCount} more ]`}
                </button>
              ) : (
                variables.length > PAGE_SIZE && (
                  <p className="mt-4 text-sm text-muted">{"// that's everything found"}</p>
                )
              )}
            </>
          )}
        </div>

        <footer className="mt-16 text-xs text-muted">
          {"// search real, public code — not a suggestion engine"}
        </footer>
      </div>
    </div>
  );
}
