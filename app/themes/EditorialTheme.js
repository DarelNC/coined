"use client";

import { Newsreader } from "next/font/google";
import { useSearch, PAGE_SIZE } from "@/lib/useSearch";

const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600"] });

const EXAMPLES = ["debounce timer", "retry counter", "cache invalidation", "empty state"];
const LANGUAGES = [
  { label: "Any", value: "" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Java", value: "java" },
];

export default function EditorialTheme() {
  const s = useSearch();

  return (
    <div className={`${serif.className} min-h-screen bg-[#f4f0e6] text-[#1a1610]`}>
      <div className="mx-auto max-w-3xl px-8 py-16">
        <header className="border-b-4 border-[#1a1610] pb-4">
          <h1 className="text-6xl italic tracking-tight">Coined</h1>
          <div className="mt-2 flex items-baseline justify-between border-t border-[#1a1610]/30 pt-2 text-xs uppercase tracking-[0.2em] text-[#1a1610]/60">
            <span>A Gazette of Real-World Names</span>
            <span>Vol. I, No. 1</span>
          </div>
        </header>

        <form onSubmit={s.handleSubmit} className="mt-10">
          <label className="block text-xs uppercase tracking-[0.2em] text-[#1a1610]/60">
            What are you trying to name?
          </label>
          <div className="mt-2 flex items-end gap-4 border-b-2 border-[#1a1610] pb-2">
            <input
              value={s.query}
              onChange={(e) => s.setQuery(e.target.value)}
              placeholder="e.g. debounce timer"
              autoFocus
              disabled={s.status === "loading"}
              className="flex-1 bg-transparent text-3xl italic outline-none placeholder:text-[#1a1610]/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={s.status === "loading"}
              className="text-sm uppercase tracking-[0.15em] text-[#a13d2f] hover:underline disabled:opacity-50"
            >
              {s.status === "loading" ? "Searching…" : "Search →"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm uppercase tracking-[0.1em]">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => s.selectLang(l.value)}
              disabled={s.status === "loading"}
              className={
                s.lang === l.value
                  ? "text-[#a13d2f]"
                  : "text-[#1a1610]/50 hover:text-[#1a1610] disabled:opacity-50"
              }
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-12">
          {s.status === "idle" && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#1a1610]/60">In this issue</p>
              <ul className="mt-3 space-y-2">
                {EXAMPLES.map((ex) => (
                  <li key={ex}>
                    <button
                      onClick={() => s.runExample(ex)}
                      className="text-xl italic text-[#1a1610]/70 hover:text-[#a13d2f]"
                    >
                      &ldquo;{ex}&rdquo;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {s.status === "loading" && <p className="italic text-[#1a1610]/60">Consulting the archives…</p>}
          {s.status === "error" && <p className="italic text-[#a13d2f]">{s.errorMessage}</p>}
          {s.status === "done" && s.variables.length === 0 && (
            <p className="italic text-[#1a1610]/60">No entries found for &ldquo;{s.query}&rdquo;.</p>
          )}

          {s.status === "done" && s.variables.length > 0 && (
            <>
              <ol className="divide-y divide-[#1a1610]/20 border-t border-[#1a1610]/20">
                {s.variables.slice(0, s.visibleCount).map((v, i) => (
                  <li key={v.keyword} className="flex items-baseline gap-4 py-4">
                    <span className="w-8 shrink-0 text-right text-sm text-[#1a1610]/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-1 items-baseline justify-between gap-4">
                      <button
                        onClick={() => s.copyKeyword(v.keyword)}
                        aria-label={s.copiedKeyword === v.keyword ? `${v.keyword}, copied` : `copy ${v.keyword}`}
                        title="click to copy"
                        className="text-left text-2xl hover:text-[#a13d2f]"
                      >
                        {s.copiedKeyword === v.keyword ? "Copied." : v.keyword}
                      </button>
                      <a
                        href={v.repoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs uppercase tracking-[0.1em] text-[#1a1610]/50 hover:text-[#a13d2f]"
                      >
                        {v.repoLang} · {v.repoList.length} repo{v.repoList.length === 1 ? "" : "s"}
                      </a>
                    </div>
                  </li>
                ))}
              </ol>

              {s.visibleCount < s.variables.length ? (
                <button
                  onClick={s.loadMore}
                  className="mt-6 text-sm uppercase tracking-[0.15em] text-[#a13d2f] hover:underline"
                >
                  {`Continued — ${s.variables.length - s.visibleCount} more →`}
                </button>
              ) : (
                s.variables.length > PAGE_SIZE && (
                  <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#1a1610]/40">End of listing.</p>
                )
              )}
            </>
          )}
        </div>

        <footer className="mt-16 border-t border-[#1a1610]/20 pt-4 text-xs uppercase tracking-[0.15em] text-[#1a1610]/40">
          Printed from public repositories. No syndication implied.
        </footer>
      </div>
    </div>
  );
}
