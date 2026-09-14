// Shared by every upstream client (Sourcegraph, GitHub, ...) — each returns
// a file path, none reliably return a clean language name, so we derive one
// from the extension ourselves rather than duplicating this per client.
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

export function languageFromPath(path) {
  const ext = path.split('.').pop();
  return EXTENSION_TO_LANGUAGE[ext] || ext || 'unknown';
}
