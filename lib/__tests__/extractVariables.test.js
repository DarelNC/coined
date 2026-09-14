import { describe, expect, it } from "vitest";
import { extractVariables } from "../extractVariables.js";

describe("extractVariables", () => {
  it("extracts identifier tokens near the keyword and dedupes case-insensitively", () => {
    const results = [
      {
        repo: "https://github.com/example/one",
        language: "JavaScript",
        lines: ["const debounceTimer = setTimeout(fn, 300);", "let DEBOUNCETIMER = null;"],
      },
    ];

    const variables = extractVariables(results, "debounce");

    const keywords = variables.map((v) => v.keyword.toLowerCase());
    expect(keywords).toContain("debouncetimer");
    // case-insensitive dedupe: only one entry despite two casings
    expect(keywords.filter((k) => k === "debouncetimer")).toHaveLength(1);
  });

  it("groups repos per keyword without duplicating the same repo", () => {
    const results = [
      { repo: "https://github.com/a/a", language: "JS", lines: ["const debounceTimer = 1;"] },
      { repo: "https://github.com/a/a", language: "JS", lines: ["const debounceTimer = 2;"] },
      { repo: "https://github.com/b/b", language: "JS", lines: ["const debounceTimer = 3;"] },
    ];

    const [match] = extractVariables(results, "debounce");

    expect(match.repoList).toHaveLength(2);
  });

  it("filters out links, base64 blobs, and overlong tokens", () => {
    const results = [
      {
        repo: "https://github.com/x/x",
        language: "JS",
        lines: [
          "// see https://example.com/debounce/path for docs",
          `const img = "data:image/png;base64,${"a".repeat(300)}debounce";`,
          `const ${"debounceReallyLongIdentifierNameThatGoesOnForeverAndEver".repeat(2)} = 1;`,
        ],
      },
    ];

    const variables = extractVariables(results, "debounce");

    expect(variables.every((v) => !v.keyword.includes("/"))).toBe(true);
    expect(variables.every((v) => v.keyword.length < 64)).toBe(true);
  });

  it("treats regex special characters in the query as literal text", () => {
    const results = [
      { repo: "https://github.com/x/x", language: "JS", lines: ["const a = b.debounce();"] },
    ];

    expect(() => extractVariables(results, "debounce(")).not.toThrow();
  });

  it("returns an empty list for an empty or whitespace-only keyword", () => {
    const results = [{ repo: "r", language: "JS", lines: ["const debounce = 1;"] }];
    expect(extractVariables(results, "")).toEqual([]);
    expect(extractVariables(results, "   ")).toEqual([]);
  });
});
