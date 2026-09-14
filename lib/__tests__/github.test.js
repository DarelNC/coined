import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isGitHubConfigured, searchGitHub } from "../github.js";

const ORIGINAL_TOKEN = process.env.GITHUB_TOKEN;

afterEach(() => {
  process.env.GITHUB_TOKEN = ORIGINAL_TOKEN;
  vi.unstubAllGlobals();
});

describe("isGitHubConfigured", () => {
  it("is false when GITHUB_TOKEN is unset", () => {
    delete process.env.GITHUB_TOKEN;
    expect(isGitHubConfigured()).toBe(false);
  });

  it("is true when GITHUB_TOKEN is set", () => {
    process.env.GITHUB_TOKEN = "fake-token";
    expect(isGitHubConfigured()).toBe(true);
  });
});

describe("searchGitHub", () => {
  it("refuses to call GitHub at all without a token — never a doomed request", async () => {
    delete process.env.GITHUB_TOKEN;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(searchGitHub("debounce")).rejects.toThrow("GITHUB_TOKEN not configured");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("normalizes a GitHub search response into the shared upstream shape", async () => {
    process.env.GITHUB_TOKEN = "fake-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              path: "src/debounce.js",
              repository: { html_url: "https://github.com/example/repo" },
              text_matches: [{ fragment: "const debounceTimer = setTimeout(fn, 300);" }],
            },
          ],
        }),
      })
    );

    const results = await searchGitHub("debounce");

    expect(results).toEqual([
      {
        repo: "https://github.com/example/repo",
        language: "JavaScript",
        lines: ["const debounceTimer = setTimeout(fn, 300);"],
      },
    ]);
  });

  it("throws on a non-ok response instead of silently returning nothing", async () => {
    process.env.GITHUB_TOKEN = "fake-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(searchGitHub("debounce")).rejects.toThrow("GitHub search failed: 403");
  });
});
