import { languageFromPath } from './languageFromPath';

const GITHUB_SEARCH_ENDPOINT = 'https://api.github.com/search/code';

// Same reasoning as Sourcegraph's NON_CODE_FILES — see lib/sourcegraph.js.
const NON_CODE_EXTENSIONS = ['-extension:md', '-extension:mdx', '-extension:txt', '-extension:rst'].join(' ');

/**
 * Whether GITHUB_TOKEN is configured. GitHub's code search endpoint has no
 * anonymous access at all — confirmed live: an unauthenticated request gets
 * a flat 401, not just a low rate limit (docs/stack.md previously assumed
 * otherwise; corrected once actually tested). Callers should check this
 * before attempting searchGitHub() rather than let it fail every time.
 */
export function isGitHubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN);
}

/**
 * Queries GitHub's code search REST API for `keyword` and normalizes the
 * response into the shape extractVariables() expects — same contract as
 * searchSourcegraph(). Only meant to be called as a fallback, and only when
 * isGitHubConfigured() is true.
 *
 * @param {string} keyword
 * @param {{lang?: string}} [options] - `lang` is a GitHub language: value
 *   (e.g. "javascript"), omit/empty for no filter
 * @returns {Promise<Array<{repo: string, language: string, lines: string[]}>>}
 */
export async function searchGitHub(keyword, { lang = '' } = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not configured');
  }

  const langFilter = lang ? `language:${lang}` : '';
  const query = `${keyword} ${NON_CODE_EXTENSIONS} ${langFilter}`.trim();
  const url = `${GITHUB_SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&per_page=100`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.text-match+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub search failed: ${res.status}`);
  }

  const json = await res.json();
  const items = json.items || [];

  return items.map((item) => ({
    repo: item.repository.html_url,
    language: languageFromPath(item.path),
    lines: (item.text_matches || []).map((m) => m.fragment),
  }));
}
