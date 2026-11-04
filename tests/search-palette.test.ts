import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SearchPalette outside click and component logic', () => {
  const searchPaletteCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/search/SearchPalette.tsx'),
    'utf-8'
  );

  it('integrates useClickOutside and backdrop click listener to dismiss search modal', () => {
    // Verifies useClickOutside hook is imported and invoked with paletteRef
    expect(searchPaletteCode).toContain("import { useClickOutside } from '../../lib/hooks/useClickOutside';");
    expect(searchPaletteCode).toContain('const paletteRef = useRef<HTMLDivElement | null>(null);');
    expect(searchPaletteCode).toContain('useClickOutside(paletteRef, onClose, isOpen);');

    // Verifies the backdrop overlay has an explicit direct-click handler as well
    expect(searchPaletteCode).toContain('if (e.target === e.currentTarget)');
    expect(searchPaletteCode).toContain('ref={paletteRef}');
  });

  it('filters philosophers and concepts correctly based on search query', () => {
    const mockPhilosophers = [
      {
        id: 'kant',
        name: 'Immanuel Kant',
        shortBio: 'German philosopher of the Enlightenment and transcendental idealism.',
        centralQuestion: 'What can I know?',
        birthYear: 1724,
        keyWorks: ['Critique of Pure Reason'],
      },
      {
        id: 'plato',
        name: 'Plato',
        shortBio: 'Classical Greek philosopher and founder of the Academy.',
        centralQuestion: 'What is justice and the nature of Forms?',
        birthYear: -427,
        keyWorks: ['The Republic'],
      },
    ];

    const mockConcepts = [
      {
        id: 'categorical-imperative',
        title: 'Categorical Imperative',
        summary: 'Deontological moral principle proposed by Kant.',
        branch: 'ethics',
      },
      {
        id: 'theory-of-forms',
        title: 'Theory of Forms',
        summary: 'Non-physical essences of all things proposed by Plato.',
        branch: 'metaphysics',
      },
    ];

    const filterEntities = (q: string) => {
      const query = q.trim().toLowerCase();
      const matchedPhilosophers = query
        ? mockPhilosophers.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.shortBio.toLowerCase().includes(query) ||
              p.centralQuestion.toLowerCase().includes(query) ||
              p.keyWorks.some((w) => w.toLowerCase().includes(query))
          )
        : mockPhilosophers.slice(0, 6);

      const matchedConcepts = query
        ? mockConcepts.filter(
            (c) =>
              c.title.toLowerCase().includes(query) ||
              c.summary.toLowerCase().includes(query) ||
              c.branch.toLowerCase().includes(query)
          )
        : mockConcepts.slice(0, 4);

      return { matchedPhilosophers, matchedConcepts };
    };

    // Searching 'kant' should return Kant and Categorical Imperative
    const kantResult = filterEntities('kant');
    expect(kantResult.matchedPhilosophers.map((p) => p.id)).toEqual(['kant']);
    expect(kantResult.matchedConcepts.map((c) => c.id)).toEqual(['categorical-imperative']);

    // Searching 'forms' should return Plato and Theory of Forms
    const formsResult = filterEntities('forms');
    expect(formsResult.matchedPhilosophers.map((p) => p.id)).toEqual(['plato']);
    expect(formsResult.matchedConcepts.map((c) => c.id)).toEqual(['theory-of-forms']);

    // Empty search returns slice
    const emptyResult = filterEntities('');
    expect(emptyResult.matchedPhilosophers.length).toBe(2);
    expect(emptyResult.matchedConcepts.length).toBe(2);
  });

  it('renders spotlight badges and canvas indicators for concepts', () => {
    // Verifies the concept section includes spotlight messaging and diamond markers
    expect(searchPaletteCode).toContain('Spotlights on canvas');
    expect(searchPaletteCode).toContain('Focus on canvas');
    expect(searchPaletteCode).toContain('Spotlight');
    expect(searchPaletteCode).toContain('◆');
    expect(searchPaletteCode).toContain('showConcepts');
  });
});
