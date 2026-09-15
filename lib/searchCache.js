// In-memory cache for a single serverless instance's lifetime. Fine for v1 —
// see coined/docs/stack.md for when to graduate to a shared store (Redis/KV).
const cache = new Map();
const TTL_MS = 1000 * 60 * 30; // 30 minutes

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.savedAt > TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setCached(key, value) {
  cache.set(key, { value, savedAt: Date.now() });
}
