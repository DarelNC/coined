"use client";

import { Archivo_Black, Space_Mono } from "next/font/google";
import { useSearch, PAGE_SIZE } from "@/lib/useSearch";

const display = Archivo_Black({ subsets: ["latin"], weight: "400" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const EXAMPLES = ["debounce timer", "retry counter", "cache invalidation", "empty state"];
const LANGUAGES = [
  { label: "ANY", value: "" },
  { label: "JS", value: "javascript" },
  { label: "TS", value: "typescript" },
  { label: "PY", value: "python" },
  { label: "GO", value: "go" },
  { label: "RUST", value: "rust" },
  { label: "JAVA", value: "java" },
];

export default function BrutalistTheme() {
  const s = useSearch();

  return (
    <div className={`${mono.className} min-h-screen bg-white text-black`}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header
          className={`${display.className} border-4 border-black bg-[#ff3b1f] p-6 text-white shadow-[8px_8px_0_0_#000]`}
        >
          <h1 className="text-5xl">COINED</h1>
          <p className={`${mono.className} mt-2 text-sm font-bold uppercase`}>NAME YOUR VARIABLES. NO FLUFF.</p>
        </header>

        <form onSubmit={s.handleSubmit} className="mt-8 flex gap-3">
          <input
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            placeholder="WHAT ARE YOU NAMING?"
            autoFocus
            disabled={s.status === "loading"}
            className="flex-1 border-4 border-black bg-white px-4 py-3 font-bold uppercase outline-none placeholder:text-black/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={s.status === "loading"}
            className="shrink-0 border-4 border-black bg-black px-6 py-3 font-bold uppercase text-white shadow-[4px_4px_0_0_#ff3b1f] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-70"
          >
            {s.status === "loading" ? "..." : "GO"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => s.selectLang(l.value)}
              disabled={s.status === "loading"}
              className={`border-4 border-black px-3 py-1 text-sm font-bold uppercase disabled:opacity-50 ${
                s.lang === l.value ? "bg-black text-white" : "bg-white text-black hover:bg-[#ff3b1f]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {s.status === "idle" && (
            <div className="flex flex-col gap-3">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => s.runExample(ex)}
                  className="w-fit border-2 border-black bg-white px-3 py-1 text-left font-bold uppercase hover:bg-[#ff3b1f] hover:text-white"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {s.status === "loading" && <p className="font-bold uppercase">LOADING...</p>}
          {s.status === "error" && (
            <p className="border-4 border-black bg-[#ff3b1f] p-3 font-bold text-white">{s.errorMessage}</p>
          )}
          {s.status === "done" && s.variables.length === 0 && (
            <p className="font-bold uppercase">NOTHING FOUND FOR &ldquo;{s.query}&rdquo;.</p>
          )}

          {s.status === "done" && s.variables.length > 0 && (
            <>
              <ul className="flex flex-col gap-3">
                {s.variables.slice(0, s.visibleCount).map((v) => (
                  <li
                    key={v.keyword}
                    className="flex items-center justify-between border-4 border-black bg-white px-4 py-3 font-bold shadow-[4px_4px_0_0_#000]"
                  >
                    <button
                      onClick={() => s.copyKeyword(v.keyword)}
                      aria-label={s.copiedKeyword === v.keyword ? `${v.keyword}, copied` : `copy ${v.keyword}`}
                      title="click to copy"
                      className="text-left text-lg uppercase hover:text-[#ff3b1f]"
                    >
                      {s.copiedKeyword === v.keyword ? "COPIED!" : v.keyword}
                    </button>
                    <a
                      href={v.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs uppercase hover:text-[#ff3b1f]"
                    >
                      {v.repoLang} · {v.repoList.length}
                    </a>
                  </li>
                ))}
              </ul>

              {s.visibleCount < s.variables.length ? (
                <button
                  onClick={s.loadMore}
                  className="mt-4 border-4 border-black bg-white px-5 py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-[#ff3b1f] hover:text-white"
                >
                  {`MORE (${s.variables.length - s.visibleCount})`}
                </button>
              ) : (
                s.variables.length > PAGE_SIZE && <p className="mt-4 font-bold uppercase">THAT&apos;S EVERYTHING.</p>
              )}
            </>
          )}
        </div>

        <footer className="mt-16 border-t-4 border-black pt-3 text-xs font-bold uppercase">
          REAL CODE. NO SUGGESTIONS. NO NONSENSE.
        </footer>
      </div>
    </div>
  );
}
