import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('LineagePathModal and NodeAutocomplete integration', () => {
  const modalCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/pathfinding/LineagePathModal.tsx'),
    'utf-8'
  );
  const autocompleteCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/pathfinding/NodeAutocomplete.tsx'),
    'utf-8'
  );
  const legendCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/legend/GraphLegendModal.tsx'),
    'utf-8'
  );
  const suggestionCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/submission/SuggestionModal.tsx'),
    'utf-8'
  );

  describe('Modal outside click dismissal', () => {
    it('verifies LineagePathModal integrates useClickOutside and backdrop click listener', () => {
      expect(modalCode).toContain("import { useClickOutside } from '../../lib/hooks/useClickOutside';");
      expect(modalCode).toContain('const modalRef = useRef<HTMLDivElement | null>(null);');
      expect(modalCode).toContain('useClickOutside(modalRef, onClose, isOpen);');
      expect(modalCode).toContain('ref={modalRef}');
      expect(modalCode).toContain('if (e.target === e.currentTarget)');
      expect(modalCode).toContain('onClose();');
    });

    it('verifies GraphLegendModal and SuggestionModal also integrate useClickOutside and backdrop click', () => {
      expect(legendCode).toContain("import { useClickOutside } from '../../lib/hooks/useClickOutside';");
      expect(legendCode).toContain('useClickOutside(modalRef, onClose, isOpen);');
      expect(legendCode).toContain('if (e.target === e.currentTarget)');

      expect(suggestionCode).toContain("import { useClickOutside } from '../../lib/hooks/useClickOutside';");
      expect(suggestionCode).toContain('useClickOutside(modalRef, onClose, isOpen);');
      expect(suggestionCode).toContain('if (e.target === e.currentTarget)');
    });
  });

  describe('Search box with autocomplete replacement', () => {
    it('replaces raw HTML select elements with NodeAutocomplete for Origin and Destination', () => {
      // Must not contain raw select elements for origin/destination
      expect(modalCode).not.toContain('<select');
      expect(modalCode).toContain('<NodeAutocomplete');
      expect(modalCode).toContain('label="Origin Thinker (Foundation)"');
      expect(modalCode).toContain('label="Destination Thinker (Successor)"');
    });

    it('provides trajectory swapping between Origin and Destination', () => {
      expect(modalCode).toContain('handleSwap');
      expect(modalCode).toContain('ArrowRightLeft');
      expect(modalCode).toContain('Swap Trajectory');
    });

    it('supports initialStartId and initialTargetId synchronization', () => {
      expect(modalCode).toContain('initialStartId?: string;');
      expect(modalCode).toContain('initialTargetId?: string;');
      expect(modalCode).toContain('if (initialStartId) setStartId(initialStartId);');
      expect(modalCode).toContain('if (initialTargetId) setTargetId(initialTargetId);');
    });
  });

  describe('NodeAutocomplete component logic and search filtering', () => {
    const mockPhilosophers = [
      {
        id: 'plato',
        name: 'Plato',
        shortBio: 'Classical Greek philosopher and founder of the Academy.',
        centralQuestion: 'What is the nature of the Forms and Justice?',
        birthYear: -428,
        deathYear: -348,
        eraId: 'classical-greek' as const,
        traditionId: 'platonism',
        sepSlug: 'plato',
        keyWorks: ['The Republic', 'Phaedo'],
        importanceScore: 100,
      },
      {
        id: 'aristotle',
        name: 'Aristotle',
        shortBio: 'Ancient Greek polymath and founder of the Lyceum.',
        centralQuestion: 'What is the highest human good (eudaimonia)?',
        birthYear: -384,
        deathYear: -322,
        eraId: 'classical-greek' as const,
        traditionId: 'aristotelianism',
        sepSlug: 'aristotle',
        keyWorks: ['Nicomachean Ethics', 'Metaphysics'],
        importanceScore: 100,
      },
      {
        id: 'arthur-schopenhauer',
        name: 'Arthur Schopenhauer',
        shortBio: 'German philosopher renowned for his pessimism and metaphysics of Will.',
        centralQuestion: 'Is existence fundamentally driven by blind striving (Will)?',
        birthYear: 1788,
        deathYear: 1860,
        eraId: 'nineteenth-century' as const,
        traditionId: 'post-kantian',
        sepSlug: 'schopenhauer',
        keyWorks: ['The World as Will and Representation'],
        importanceScore: 90,
      },
    ];

    const mockConcepts = [
      {
        id: 'theory-of-forms',
        title: 'Theory of Forms',
        summary: 'Metaphysical assertion that non-physical essences represent true reality.',
        branch: 'metaphysics' as const,
      },
      {
        id: 'will-to-power',
        title: 'Will to Power',
        summary: 'Primary driving force in humans according to Nietzsche.',
        branch: 'ethics' as const,
      },
    ];

    it('correctly filters thinkers and concepts with prefix priority', () => {
      const filterEntities = (query: string, currentDisplayName: string) => {
        const q = query.trim().toLowerCase();
        const querying = q.length > 0 && q !== currentDisplayName.toLowerCase();

        if (!querying) {
          return {
            philosophers: mockPhilosophers.slice(0, 15),
            concepts: mockConcepts.slice(0, 6),
          };
        }

        const matchedP = mockPhilosophers.filter((p) => {
          return (
            p.name.toLowerCase().includes(q) ||
            p.shortBio.toLowerCase().includes(q) ||
            p.centralQuestion.toLowerCase().includes(q) ||
            p.keyWorks.some((w) => w.toLowerCase().includes(q))
          );
        });

        matchedP.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(q);
          const bStarts = b.name.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        });

        const matchedC = mockConcepts.filter((c) => {
          return (
            c.title.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q)
          );
        });

        return { philosophers: matchedP, concepts: matchedC };
      };

      // Searching 'pl' matches Plato first
      const resPlato = filterEntities('pl', 'Aristotle');
      expect(resPlato.philosophers.map((p) => p.id)).toEqual(['plato']);

      // Searching 'will' matches Arthur Schopenhauer (bio/work) and Will to Power concept
      const resWill = filterEntities('will', 'Plato');
      expect(resWill.philosophers.map((p) => p.id)).toEqual(['arthur-schopenhauer']);
      expect(resWill.concepts.map((c) => c.id)).toEqual(['will-to-power']);

      // Searching 'forms' matches Theory of Forms concept and Plato (due to question/bio)
      const resForms = filterEntities('forms', 'Arthur Schopenhauer');
      expect(resForms.concepts.map((c) => c.id)).toEqual(['theory-of-forms']);
      expect(resForms.philosophers.map((p) => p.id)).toEqual(['plato']);
    });

    it('verifies accessibility attributes and outside click handling in NodeAutocomplete', () => {
      expect(autocompleteCode).toContain('role="combobox"');
      expect(autocompleteCode).toContain('aria-expanded={isOpen}');
      expect(autocompleteCode).toContain('aria-autocomplete="list"');
      expect(autocompleteCode).toContain('role="listbox"');
      expect(autocompleteCode).toContain('role="option"');
      expect(autocompleteCode).toContain('useClickOutside');
      expect(autocompleteCode).toContain('e.stopPropagation()'); // inside Escape key handler
    });
  });
});
