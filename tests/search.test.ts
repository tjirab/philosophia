import { describe, it, expect } from 'vitest';
import {
  normalizeSearchText,
  includesNormalized,
  matchesPhilosopherQuery,
  matchesConceptQuery,
  matchesEdgeQuery,
} from '../src/lib/search';
import { Philosopher, Concept, Edge } from '../src/lib/types';

const mockZizek: Philosopher = {
  id: 'slavoj-zizek',
  name: 'Slavoj Žižek',
  birthYear: 1949,
  eraId: 'contemporary',
  traditionId: 'post-structuralism',
  shortBio: 'Slovenian philosopher and cultural theorist synthesizing Hegel, Marx, and Lacan.',
  centralQuestion: 'How does ideology grip unconscious enjoyment?',
  keyWorks: [
    { title: 'The Sublime Object of Ideology', year: '1989 CE' },
    'Tarrying with the Negative',
  ],
  sepSlug: 'lacan',
  importanceScore: 89,
};

const mockKierkegaard: Philosopher = {
  id: 'soren-kierkegaard',
  name: 'Søren Kierkegaard',
  birthYear: 1813,
  deathYear: 1855,
  eraId: 'nineteenth-century',
  traditionId: 'existentialism-early',
  shortBio: 'Danish existentialist philosopher.',
  centralQuestion: 'What does it mean to exist as an individual?',
  keyWorks: [{ title: 'Either/Or', year: '1843 CE' }],
  sepSlug: 'kierkegaard',
  importanceScore: 95,
};

const mockConcept: Concept = {
  id: 'deconstruction-differance',
  title: 'Deconstruction & Différance',
  branch: 'metaphysics',
  eraId: 'contemporary',
  introducedBy: 'jacques-derrida',
  summary: 'Derridean critique of logocentrism and binary oppositions.',
};

const mockLegacyConcept = {
  id: 'legacy-concept',
  name: 'Élan Vital',
  description: 'Vital impetus in philosophy.',
  branch: 'metaphysics',
  eraId: 'twentieth-century',
  introducedBy: 'henri-bergson',
} as unknown as Concept;

const mockEdge: Edge = {
  id: 'slavoj-zizek--alenka-zupancic',
  source: 'slavoj-zizek',
  target: 'alenka-zupancic',
  type: 'INFLUENCED',
  label: 'Co-founded the Ljubljana School of Psychoanalysis',
  description: 'Synthesized German Idealism with Lacanian theory.',
};

describe('Diacritic-insensitive search helpers', () => {
  it('normalizes combining diacritics, case, and special Latin characters', () => {
    expect(normalizeSearchText('Slavoj Žižek')).toBe('slavoj zizek');
    expect(normalizeSearchText('Alenka Zupančič')).toBe('alenka zupancic');
    expect(normalizeSearchText('Søren Kierkegaard')).toBe('soren kierkegaard');
    expect(normalizeSearchText('Jürgen Habermas')).toBe('jurgen habermas');
    expect(normalizeSearchText('Émile Durkheim')).toBe('emile durkheim');
    expect(normalizeSearchText('Paul Ricœur')).toBe('paul ricoeur');
    expect(normalizeSearchText('Łukasiewicz & Weiß')).toBe('lukasiewicz & weiss');
    expect(normalizeSearchText('Đuro & Æther')).toBe('duro & aether');
    expect(normalizeSearchText(undefined)).toBe('');
    expect(normalizeSearchText(null)).toBe('');
  });

  it('checks normalized inclusion cleanly', () => {
    expect(includesNormalized('Slavoj Žižek', 'zizek')).toBe(true);
    expect(includesNormalized('Slavoj Žižek', '')).toBe(true);
    expect(includesNormalized('Slavoj Žižek', 'plato')).toBe(false);
    expect(includesNormalized(undefined, 'zizek')).toBe(false);
  });

  it('matches philosophers without diacritical signs across name, works, bio, and extra fields', () => {
    expect(matchesPhilosopherQuery(mockZizek, 'zizek')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'Žižek')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'slavoj zizek')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, '  ')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'sublime object')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'tarrying')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'enjoyment')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'lacan')).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'post-structuralism', ['Post-Structuralism'])).toBe(true);
    expect(matchesPhilosopherQuery(mockZizek, 'nonexistent-query')).toBe(false);

    expect(matchesPhilosopherQuery(mockKierkegaard, 'soren')).toBe(true);
    expect(matchesPhilosopherQuery(mockKierkegaard, 'Søren')).toBe(true);
  });

  it('matches concepts without diacritical signs including legacy fields and extra fields', () => {
    expect(matchesConceptQuery(mockConcept, 'differance')).toBe(true);
    expect(matchesConceptQuery(mockConcept, 'Différance')).toBe(true);
    expect(matchesConceptQuery(mockConcept, 'logocentrism')).toBe(true);
    expect(matchesConceptQuery(mockConcept, 'metaphysics')).toBe(true);
    expect(matchesConceptQuery(mockConcept, 'derrida', ['Jacques Derrida'])).toBe(true);
    expect(matchesConceptQuery(mockConcept, '')).toBe(true);
    expect(matchesConceptQuery(mockConcept, 'zizek')).toBe(false);

    expect(matchesConceptQuery(mockLegacyConcept, 'elan vital')).toBe(true);
    expect(matchesConceptQuery(mockLegacyConcept, 'impetus')).toBe(true);
    expect(matchesConceptQuery({} as Concept, 'zizek')).toBe(false);
  });

  it('matches lineage edges without diacritical signs', () => {
    expect(matchesEdgeQuery(mockEdge, 'Slavoj Žižek', 'Alenka Zupančič', 'zizek')).toBe(true);
    expect(matchesEdgeQuery(mockEdge, 'Slavoj Žižek', 'Alenka Zupančič', 'zupancic')).toBe(true);
    expect(matchesEdgeQuery(mockEdge, 'Slavoj Žižek', 'Alenka Zupančič', 'ljubljana')).toBe(true);
    expect(matchesEdgeQuery(mockEdge, 'Slavoj Žižek', 'Alenka Zupančič', 'lacanian')).toBe(true);
    expect(matchesEdgeQuery(mockEdge, 'Slavoj Žižek', 'Alenka Zupančič', '')).toBe(true);
    expect(matchesEdgeQuery(mockEdge, 'Slavoj Žižek', 'Alenka Zupančič', 'aristotle')).toBe(false);
  });
});
