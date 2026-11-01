import { describe, it, expect } from 'vitest';
import { getThinkerDetails, getPhilosopherDetails, philosophers } from '../src/lib/graph/graph-service';
import { generateStaticParams, generateMetadata } from '../src/app/thinker/[id]/page';

describe('Thinker Folio & Dialectical Architecture Engine', () => {
  it('generates static params matching exactly all 117 philosophers with zero duplicates', () => {
    const params = generateStaticParams();
    expect(params.length).toBe(philosophers.length);
    expect(params.length).toBeGreaterThanOrEqual(100);

    const ids = new Set<string>();
    for (const p of params) {
      expect(p.id).toBeDefined();
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(ids.has(p.id), `Duplicate static param id detected: ${p.id}`).toBe(false);
      ids.add(p.id);
    }
  });

  it('retrieves comprehensive thinker details for Socrates and Plato', () => {
    const socrates = getThinkerDetails('socrates');
    expect(socrates).not.toBeNull();
    expect(socrates?.thinker.id).toBe('socrates');
    expect(socrates?.thinker.name).toBe('Socrates');
    expect(socrates?.era?.id).toBe('classical-greek');
    expect(socrates?.tradition?.id).toBe('platonism');
    expect(socrates?.successors.length).toBeGreaterThanOrEqual(1);
    expect(socrates?.successors.some((s) => s.node.id === 'plato')).toBe(true);

    const plato = getThinkerDetails('plato');
    expect(plato).not.toBeNull();
    expect(plato?.thinker.name).toBe('Plato');
    expect(plato?.predecessors.some((p) => p.node.id === 'socrates')).toBe(true);
    expect(plato?.successors.some((s) => s.node.id === 'aristotle')).toBe(true);
    expect(plato?.formulatedConcepts.length).toBeGreaterThanOrEqual(1);
    expect(plato?.keyWorks.length).toBeGreaterThanOrEqual(2);
  });

  it('retrieves comprehensive thinker details and rich lineages for Simone de Beauvoir', () => {
    const beauvoir = getThinkerDetails('simone-de-beauvoir');
    expect(beauvoir).not.toBeNull();
    expect(beauvoir?.thinker.id).toBe('simone-de-beauvoir');
    expect(beauvoir?.thinker.name).toBe('Simone de Beauvoir');
    expect(beauvoir?.era?.id).toBe('twentieth-century');
    expect(beauvoir?.tradition?.id).toBe('existentialism');

    // Key works verification
    expect(beauvoir?.keyWorks.length).toBeGreaterThanOrEqual(2);
    const ethicsOfAmbiguity = beauvoir?.keyWorks.find((w) => w.title.includes('Ethics of Ambiguity'));
    expect(ethicsOfAmbiguity).toBeDefined();
    expect(ethicsOfAmbiguity?.year).toBe('1947 CE');

    // Predecessors / Influences: Hegel, Wollstonecraft, Merleau-Ponty, Sartre, etc.
    const predecessorIds = beauvoir?.predecessors.map((p) => p.node.id) || [];
    expect(predecessorIds).toContain('gwf-hegel');
    expect(predecessorIds).toContain('mary-wollstonecraft');
    expect(predecessorIds).toContain('maurice-merleau-ponty');
    expect(predecessorIds).toContain('jean-paul-sartre');

    // Successors: Sartre, Fanon, Foucault
    const successorIds = beauvoir?.successors.map((s) => s.node.id) || [];
    expect(successorIds).toContain('jean-paul-sartre');
    expect(successorIds).toContain('frantz-fanon');
    expect(successorIds).toContain('michel-foucault');

    // Citations & Academic proof
    expect(beauvoir?.citations.length).toBeGreaterThanOrEqual(3);
    expect(beauvoir?.citations.some((c) => c.work.includes('The Second Sex') || c.work.includes('Ethics of Ambiguity'))).toBe(true);

    // Media resources: podcasts
    expect(beauvoir?.media.length).toBeGreaterThanOrEqual(1);
    expect(beauvoir?.media.some((m) => m.type === 'podcast')).toBe(true);
  });

  it('supports alias getPhilosopherDetails identically', () => {
    const fromThinker = getThinkerDetails('immanuel-kant');
    const fromPhilosopher = getPhilosopherDetails('immanuel-kant');
    expect(fromThinker).toEqual(fromPhilosopher);
  });

  it('returns null gracefully for non-existent thinker IDs', () => {
    expect(getThinkerDetails('non-existent-thinker')).toBeNull();
    expect(getThinkerDetails('')).toBeNull();
  });

  it('generates rich metadata for thinker folio pages', async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: 'simone-de-beauvoir' }) });
    expect(meta.title).toContain('Simone de Beauvoir');
    expect(meta.title).toContain('Dialectical Thinker Folio');
    expect(meta.title).toContain('Philosophia');
    expect(meta.description).toContain('one is not born, but rather becomes, a woman');

    const notFoundMeta = await generateMetadata({ params: Promise.resolve({ id: 'missing-thinker' }) });
    expect(notFoundMeta.title).toBe('Thinker Not Found | Philosophia');
  });
});
