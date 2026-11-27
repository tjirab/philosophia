import { Concept, Edge, Philosopher } from './types';

const EXTRA_LATIN_FOLDS: Record<string, string> = {
  ø: 'o',
  ł: 'l',
  đ: 'd',
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
};

/**
 * Normalizes text for case- and diacritic-insensitive search matching.
 * Decomposes Unicode characters (NFD), strips combining marks, lowercases,
 * and folds non-decomposing Latin letters (e.g. ø, ł, œ).
 */
export function normalizeSearchText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[øłđßæœ]/g, (ch) => EXTRA_LATIN_FOLDS[ch] ?? ch);
}

/**
 * Returns true when `haystack` contains the already-normalized `normalizedQuery`.
 */
export function includesNormalized(
  haystack: string | null | undefined,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return true;
  return normalizeSearchText(haystack).includes(normalizedQuery);
}

/**
 * Matches a philosopher against a search query across name, bio, central question,
 * key work titles, and optional extra fields (e.g. eraId, tradition name).
 */
export function matchesPhilosopherQuery(
  philosopher: Philosopher,
  query: string,
  extraFields: Array<string | null | undefined> = []
): boolean {
  const q = normalizeSearchText(query.trim());
  if (!q) return true;

  if (
    includesNormalized(philosopher.name, q) ||
    includesNormalized(philosopher.shortBio, q) ||
    includesNormalized(philosopher.centralQuestion, q)
  ) {
    return true;
  }

  if (
    (philosopher.keyWorks || []).some((w) => {
      const title = typeof w === 'string' ? w : w?.title || '';
      return includesNormalized(title, q);
    })
  ) {
    return true;
  }

  return extraFields.some((field) => includesNormalized(field, q));
}

/**
 * Matches a concept against a search query across title, summary, branch,
 * and optional extra fields (e.g. introducing thinker's name).
 */
export function matchesConceptQuery(
  concept: Concept,
  query: string,
  extraFields: Array<string | null | undefined> = []
): boolean {
  const q = normalizeSearchText(query.trim());
  if (!q) return true;

  const legacyConcept = concept as Concept & { name?: string; description?: string };
  const title = concept.title || legacyConcept.name || '';
  const summary = concept.summary || legacyConcept.description || '';
  const branch = concept.branch || '';

  return (
    includesNormalized(title, q) ||
    includesNormalized(summary, q) ||
    includesNormalized(branch, q) ||
    extraFields.some((field) => includesNormalized(field, q))
  );
}

/**
 * Matches a lineage edge against a search query across endpoint names, label, and description.
 */
export function matchesEdgeQuery(
  edge: Edge,
  sourceName: string,
  targetName: string,
  query: string
): boolean {
  const q = normalizeSearchText(query.trim());
  if (!q) return true;

  return (
    includesNormalized(sourceName, q) ||
    includesNormalized(targetName, q) ||
    includesNormalized(edge.label, q) ||
    includesNormalized(edge.description, q)
  );
}
