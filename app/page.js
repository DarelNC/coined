"use client";

import { useEffect, useState } from "react";

const EXAMPLES = ["debounce timer", "retry counter", "cache invalidation", "empty state"];

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
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [variables, setVariables] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const spinner = useSpinner(status === "loading");

  async function runSearch(q) {
    if (!q) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "search failed, try again.");
        setStatus("error");
        return;
      }

      setVariables(data.variables);
      setStatus("done");
    } catch {
      setErrorMessage("search failed, try again.");
      setStatus("error");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(query.trim());
  }

  function runExample(example) {
    setQuery(example);
    runSearch(example);
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
            <ul className="flex flex-col">
              {variables.map((v) => (
                <li
                  key={v.keyword}
                  className="group border-l-2 border-border pl-4 py-3 transition-colors hover:border-accent"
                >
                  <a
                    href={v.repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="truncate text-lg text-foreground group-hover:text-accent">
                      {v.keyword}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {v.repoLang} · {v.repoList.length} repo{v.repoList.length === 1 ? "" : "s"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="mt-16 text-xs text-muted">
          {"// search real, public code — not a suggestion engine"}
        </footer>
      </div>
    </div>
  );
}
