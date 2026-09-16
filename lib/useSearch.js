"use client";

import { useEffect, useRef, useState } from "react";

export const PAGE_SIZE = 8;

// Shared search/copy/pagination logic, independent of how a theme renders
// it — every theme component gets the same real behavior (search, copy,
// pagination, language filter), never a stripped-down mockup version.
export function useSearch() {
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
        setErrorMessage(data.error || "Search failed, try again.");
        setStatus("error");
        return;
      }

      setVariables(data.variables);
      setVisibleCount(PAGE_SIZE);
      setStatus("done");
    } catch {
      setErrorMessage("Search failed, try again.");
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
    if (query.trim()) runSearch(query.trim(), value);
  }

  function loadMore() {
    setVisibleCount((c) => c + PAGE_SIZE);
  }

  return {
    query,
    setQuery,
    lang,
    status,
    variables,
    visibleCount,
    errorMessage,
    copiedKeyword,
    copyKeyword,
    handleSubmit,
    runExample,
    selectLang,
    loadMore,
  };
}
