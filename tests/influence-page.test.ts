import { describe, it, expect } from 'vitest';
import { getEdgeDetails, getVisualGraph, edges } from '../src/lib/graph/graph-service';
import { generateStaticParams } from '../src/app/influence/[id]/page';

describe('Influence & Academic Proof Folio Engine', () => {
  it('generates static params matching exactly all 336 edges with zero duplicates', () => {
    const params = generateStaticParams();
    expect(params.length).toBe(edges.length);
    expect(params.length).toBeGreaterThan(250);

    const ids = new Set<string>();
    for (const p of params) {
      expect(p.id).toBeDefined();
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(ids.has(p.id), `Duplicate static param id detected: ${p.id}`).toBe(false);
      ids.add(p.id);
    }
  });

  it('retrieves comprehensive edge details for canonical philosophical lineages', () => {
    const socratesPlato = getEdgeDetails('socrates--plato');
    expect(socratesPlato).not.toBeNull();
    expect(socratesPlato?.edge.source).toBe('socrates');
    expect(socratesPlato?.edge.target).toBe('plato');
    expect(socratesPlato?.sourceNode?.name).toBe('Socrates');
    expect(socratesPlato?.targetNode?.name).toBe('Plato');
    expect(socratesPlato?.sourceEra?.id).toBe('classical-greek');
    expect(socratesPlato?.edge.citations?.length).toBeGreaterThanOrEqual(2);
    expect(socratesPlato?.edge.academicConsensus).toBe('unanimous');

    const platoAristotle = getEdgeDetails('plato--aristotle');
    expect(platoAristotle).not.toBeNull();
    expect(platoAristotle?.edge.type).toBe('INFLUENCED');
    expect(platoAristotle?.edge.citations?.some((c) => c.citationType === 'primary')).toBe(true);

    const kantHegel = getEdgeDetails('immanuel-kant--gwf-hegel');
    expect(kantHegel).not.toBeNull();
    expect(kantHegel?.edge.type).toBe('DEVELOPED');
    expect(kantHegel?.edge.dialecticalTension).toBeDefined();

    const humeKant = getEdgeDetails('david-hume--immanuel-kant');
    expect(humeKant).not.toBeNull();
    expect(humeKant?.edge.type).toBe('INFLUENCED');
    expect(humeKant?.edge.citations?.some((c) => c.author.includes('Kant'))).toBe(true);
  });

  it('correctly handles concept-to-thinker and thinker-to-concept relations', () => {
    const descartesCogito = getEdgeDetails('rene-descartes--cogito-ergo-sum');
    expect(descartesCogito).not.toBeNull();
    expect(descartesCogito?.sourceNode?.name).toBe('René Descartes');
    expect((descartesCogito?.targetNode as any)?.title).toBe('Methodological Doubt & Cogito');
    expect(descartesCogito?.edge.citations?.length).toBeGreaterThanOrEqual(1);
  });

  it('returns null gracefully for non-existent edge IDs', () => {
    expect(getEdgeDetails('non-existent--edge')).toBeNull();
    expect(getEdgeDetails('')).toBeNull();
  });

  it('verifies that getVisualGraph assigns deterministic link IDs and edge objects', () => {
    const { links } = getVisualGraph();
    expect(links.length).toBeGreaterThan(200);

    for (const link of links) {
      expect(link.id).toBeDefined();
      expect(link.edge).toBeDefined();
      expect(link.edge?.id).toBe(link.id);
    }
  });
});
