import { describe, it, expect } from 'vitest';
import { getConceptDetails, getEdgeDetails, concepts } from '../src/lib/graph/graph-service';
import { generateStaticParams, generateMetadata } from '../src/app/concept/[id]/page';

describe('Concept Folio & Dialectical Architecture Engine', () => {
  it('generates static params matching all concepts with zero duplicates', () => {
    const params = generateStaticParams();
    expect(params.length).toBe(concepts.length);
    expect(params.length).toBeGreaterThanOrEqual(90);

    const ids = new Set<string>();
    for (const p of params) {
      expect(p.id).toBeDefined();
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(ids.has(p.id), `Duplicate static param id detected: ${p.id}`).toBe(false);
      ids.add(p.id);
    }
  });

  it('retrieves comprehensive concept details for Kantian Categorical Imperative', () => {
    const details = getConceptDetails('categorical-imperative');
    expect(details).not.toBeNull();
    expect(details?.concept.id).toBe('categorical-imperative');
    expect(details?.concept.title).toBe('The Categorical Imperative');
    expect(details?.concept.branch).toBe('ethics');
    expect(details?.era?.id).toBe('german-idealism');
    expect(details?.introducedByPhilosopher?.id).toBe('immanuel-kant');
    expect(details?.introducedByPhilosopher?.name).toBe('Immanuel Kant');
    expect(details?.introducedByTradition?.name).toBe('German Idealism');
    expect(details?.domain).toBe('philosophy');

    // Predecessors & successors
    expect(details?.predecessors.length).toBeGreaterThanOrEqual(1);
    expect(details?.successors.length).toBeGreaterThanOrEqual(1);

    // Citations
    expect(details?.citations.length).toBeGreaterThanOrEqual(1);

    // Co-introduced concepts by Kant
    expect(details?.coIntroducedConcepts.length).toBeGreaterThanOrEqual(1);
    expect(details?.coIntroducedConcepts.some((c) => c.introducedBy === 'immanuel-kant')).toBe(true);
    expect(details?.coIntroducedConcepts.some((c) => c.id === 'categorical-imperative')).toBe(false);
  });

  it('retrieves comprehensive concept details for Instrumental Reason (Horkheimer)', () => {
    const details = getConceptDetails('instrumental-reason');
    expect(details).not.toBeNull();
    expect(details?.concept.id).toBe('instrumental-reason');
    expect(details?.concept.title).toContain('Instrumental Reason');
    expect(details?.concept.branch).toBe('political');
    expect(details?.introducedByPhilosopher?.id).toBe('max-horkheimer');
    expect(details?.introducedByPhilosopher?.name).toBe('Max Horkheimer');
    expect(details?.concept.sepSlug).toBe('horkheimer');

    // Successor trajectory (e.g. Habermas or Marcuse)
    expect(details?.successors.length).toBeGreaterThanOrEqual(1);

    // Related edges in graph
    expect(details?.relatedEdges.length).toBeGreaterThanOrEqual(1);
  });

  it('retrieves media resources correctly when targeted to concept', () => {
    const sunyata = getConceptDetails('sunyata-emptiness');
    expect(sunyata).not.toBeNull();
    expect(sunyata?.concept.id).toBe('sunyata-emptiness');
    expect(sunyata?.media.length).toBeGreaterThanOrEqual(1);
  });

  it('returns null gracefully for non-existent concept IDs', () => {
    expect(getConceptDetails('non-existent-concept')).toBeNull();
    expect(getConceptDetails('')).toBeNull();
  });

  it('generates rich metadata for concept folio pages', async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ id: 'categorical-imperative' }) });
    expect(meta.title).toContain('The Categorical Imperative');
    expect(meta.title).toContain('Philosophia');
    expect(meta.description).toBeDefined();

    const notFoundMeta = await generateMetadata({ params: Promise.resolve({ id: 'missing-concept' }) });
    expect(notFoundMeta.title).toBe('Concept Not Found | Philosophia');
  });

  it('verifies integration: influence edge immanuel-kant--max-horkheimer provides navigable concepts', () => {
    const edgeDetails = getEdgeDetails('immanuel-kant--max-horkheimer');
    expect(edgeDetails).not.toBeNull();
    expect(edgeDetails?.connectedConcepts.length).toBeGreaterThanOrEqual(2);

    const conceptIds = edgeDetails?.connectedConcepts.map((c) => c.id) || [];
    expect(conceptIds).toContain('categorical-imperative');
    expect(conceptIds).toContain('instrumental-reason');

    for (const c of edgeDetails?.connectedConcepts || []) {
      const cDetails = getConceptDetails(c.id);
      expect(cDetails).not.toBeNull();
      expect(cDetails?.concept.id).toBe(c.id);
      expect(cDetails?.concept.title).toBeDefined();
    }
  });
});
