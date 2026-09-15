import { languageFromPath } from './languageFromPath';

const SOURCEGRAPH_ENDPOINT = 'https://sourcegraph.com/.api/graphql';

const SEARCH_QUERY = `
  query CoinedSearch($query: String!) {
    search(query: $query, version: V3) {
      results {
        matchCount
        results {
          __typename
          ... on FileMatch {
            repository { name }
            file { path }
            lineMatches { preview }
          }
        }
      }
    }
  }
`;

/**
 * Queries Sourcegraph's public code search for `keyword` and normalizes the
 * response into the shape extractVariables() expects. Anonymous, no API key
 * required — confirmed working directly against sourcegraph.com.
 *
 * @param {string} keyword
 * @param {{count?: number, lang?: string}} [options] - `lang` is a
 *   Sourcegraph lang: value (e.g. "javascript"), omit/empty for no filter
 * @returns {Promise<Array<{repo: string, language: string, lines: string[]}>>}
 */
// Exclude prose files so results are actual code, not docs/READMEs
// mentioning the search term — the whole point is real variable names.
const NON_CODE_FILES = String.raw`-file:\.(md|mdx|txt|rst)$`;

export async function searchSourcegraph(keyword, { count = 100, lang = '' } = {}) {
  const langFilter = lang ? `lang:${lang}` : '';
  const query = `${keyword} ${NON_CODE_FILES} ${langFilter} count:${count}`;

  const res = await fetch(SOURCEGRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { query } }),
  });

  if (!res.ok) {
    throw new Error(`Sourcegraph search failed: ${res.status}`);
  }

  const json = await res.json();
  const matches = json?.data?.search?.results?.results || [];

  return matches
    .filter((m) => m.__typename === 'FileMatch')
    .map((m) => ({
      repo: `https://${m.repository.name}`,
      language: languageFromPath(m.file.path),
      lines: (m.lineMatches || []).map((l) => l.preview),
    }));
}
