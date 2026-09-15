/**
 * Turns raw code-search matches into a deduped list of real-world variable
 * names used near the search keyword. Data-source-agnostic on purpose — it
 * only cares about `{ repo, language, lines }`, not where those came from.
 * See coined/docs/architecture.md for why this is a separate, pure module.
 *
 * @param {Array<{repo: string, language: string, lines: string[]}>} results
 * @param {string} keyword - the raw search query, possibly multiple words
 * @returns {Array<{keyword: string, repoLink: string, repoLang: string, repoList: Array<{repo: string, language: string}>}>}
 */
export function extractVariables(results, keyword) {
  const keywordRegs = buildKeywordRegs(keyword);
  if (keywordRegs.length === 0) return [];

  const repoMapping = new Map();
  const seen = new Set();
  const variables = [];

  for (const result of results) {
    const lineStr = (result.lines || [])
      .filter((line) => !isLikelyBase64(line))
      .join(' ')
      .replace(/\r?\n/g, ' ');

    for (const reg of keywordRegs) {
      for (const raw of lineStr.match(reg) || []) {
        const value = trimPunctuation(raw);
        if (!isValidToken(value)) continue;

        addToRepoMapping(repoMapping, value, result);

        const lower = value.toLowerCase();
        if (seen.has(lower)) continue;
        seen.add(lower);

        variables.push({ keyword: value, repoLink: result.repo, repoLang: result.language });
      }
    }
  }

  return variables.map((v) => ({ ...v, repoList: repoMapping.get(v.keyword.toLowerCase()) || [] }));
}

function buildKeywordRegs(keyword) {
  return (keyword || '')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map((word) => new RegExp(`([-_\\w\\d/$]{0,}){0,1}${escapeRegExp(word)}([-_\\w\\d$]{0,}){0,1}`, 'gi'));
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function trimPunctuation(value) {
  return value.replace(/^[-/]+/, '').replace(/[-/]+$/, '');
}

function isValidToken(value) {
  // exclude links/paths and anything too long to plausibly be an identifier
  return value.length > 0 && value.length < 64 && !/\//.test(value);
}

function isLikelyBase64(line) {
  return /;base64,/.test(line) && line.length > 256;
}

function addToRepoMapping(mapping, value, result) {
  const key = value.toLowerCase();
  if (!mapping.has(key)) mapping.set(key, []);
  const list = mapping.get(key);
  if (!list.some((r) => r.repo === result.repo)) {
    list.push({ repo: result.repo, language: result.language });
  }
}
