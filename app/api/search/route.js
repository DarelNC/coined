import { extractVariables } from '@/lib/extractVariables';
import { searchSourcegraph } from '@/lib/sourcegraph';
import { searchGitHub, isGitHubConfigured } from '@/lib/github';
import { getCached, setCached } from '@/lib/searchCache';

// Ordered upstream sources. The route owns this decision — see
// docs/architecture.md — so a source can be added/reordered/disabled here
// without touching anything else.
const SOURCES = [
  { search: searchSourcegraph, enabled: () => true },
  { search: searchGitHub, enabled: isGitHubConfigured },
];

async function searchAllSources(q, { lang }) {
  let lastError;
  for (const source of SOURCES) {
    if (!source.enabled()) continue;
    try {
      return await source.search(q, { lang });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('No search source available');
}

// Frontend only ever calls this route, never an upstream directly — see
// codelf/docs/rules.md (never call a third-party API from the client).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const lang = (searchParams.get('lang') || '').trim();

  if (!q) {
    return Response.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const cacheKey = `${q.toLowerCase()}::${lang.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return Response.json({ variables: cached, cached: true });
  }

  try {
    const results = await searchAllSources(q, { lang });
    const variables = extractVariables(results, q);
    setCached(cacheKey, variables);
    return Response.json({ variables });
  } catch (err) {
    return Response.json({ error: 'Search failed, try again shortly.' }, { status: 502 });
  }
}
