import { extractVariables } from '@/lib/extractVariables';
import { searchSourcegraph } from '@/lib/sourcegraph';
import { getCached, setCached } from '@/lib/searchCache';

// Frontend only ever calls this route, never Sourcegraph directly — see
// codelf/docs/rules.md (never call a third-party API from the client).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return Response.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const cacheKey = q.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) {
    return Response.json({ variables: cached, cached: true });
  }

  try {
    const results = await searchSourcegraph(q);
    const variables = extractVariables(results, q);
    setCached(cacheKey, variables);
    return Response.json({ variables });
  } catch (err) {
    // No secondary source wired up yet for v1 — see the open question in
    // codelf/docs/features/variable-search.md.
    return Response.json({ error: 'Search failed, try again shortly.' }, { status: 502 });
  }
}
