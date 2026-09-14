const SOURCEGRAPH_ENDPOINT = 'https://sourcegraph.com/.api/graphql';

const SEARCH_QUERY = `
  query CodelfSearch($query: String!) {
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
 * @param {{count?: number}} [options]
 * @returns {Promise<Array<{repo: string, language: string, lines: string[]}>>}
 */
// Exclude prose files so results are actual code, not docs/READMEs
// mentioning the search term — the whole point is real variable names.
const NON_CODE_FILES = String.raw`-file:\.(md|mdx|txt|rst)$`;

export async function searchSourcegraph(keyword, { count = 100 } = {}) {
  const query = `${keyword} ${NON_CODE_FILES} count:${count}`;

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

function languageFromPath(path) {
  const ext = path.split('.').pop();
  return EXTENSION_TO_LANGUAGE[ext] || ext || 'unknown';
}

const EXTENSION_TO_LANGUAGE = {
  js: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  py: 'Python',
  go: 'Go',
  rb: 'Ruby',
  java: 'Java',
  rs: 'Rust',
  php: 'PHP',
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  swift: 'Swift',
  kt: 'Kotlin',
};
