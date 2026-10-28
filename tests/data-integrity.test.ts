import { describe, it, expect } from 'vitest';
import erasData from '../data/eras.json';
import traditionsData from '../data/traditions.json';
import philosophersData from '../data/philosophers.json';
import conceptsData from '../data/concepts.json';
import edgesData from '../data/edges.json';
import mediaData from '../data/media.json';
import { findInfluencePath } from '../src/lib/graph/pathfinding';
import { getVisualGraph, getNodeDetails } from '../src/lib/graph/graph-service';

describe('Philosophy Graph Data Integrity', () => {
  const validEraIds = new Set(erasData.map((e) => e.id));
  const validTraditionIds = new Set(traditionsData.map((t) => t.id));
  const validPhilosopherIds = new Set(philosophersData.map((p) => p.id));
  const validConceptIds = new Set(conceptsData.map((c) => c.id));
  const allNodeIds = new Set([...validPhilosopherIds, ...validConceptIds]);

  it('validates that every philosopher has valid era, tradition, and SEP slug', () => {
    expect(philosophersData.length).toBeGreaterThan(30);

    for (const p of philosophersData) {
      expect(validEraIds.has(p.eraId), `Philosopher ${p.id} has invalid eraId ${p.eraId}`).toBe(true);
      expect(
        validTraditionIds.has(p.traditionId),
        `Philosopher ${p.id} has invalid traditionId ${p.traditionId}`
      ).toBe(true);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.sepSlug.length).toBeGreaterThan(0);
      expect(p.deathYear).toBeGreaterThanOrEqual(p.birthYear);
    }
  });

  it('validates that concepts have valid era and introducedBy philosopher', () => {
    expect(conceptsData.length).toBeGreaterThan(20);

    for (const c of conceptsData) {
      expect(validEraIds.has(c.eraId), `Concept ${c.id} has invalid eraId ${c.eraId}`).toBe(true);
      expect(
        validPhilosopherIds.has(c.introducedBy),
        `Concept ${c.id} has unknown philosopher ${c.introducedBy}`
      ).toBe(true);
    }
  });

  it('validates that all edges connect existing nodes with no dangling references', () => {
    expect(edgesData.length).toBeGreaterThan(30);

    for (const edge of edgesData) {
      expect(allNodeIds.has(edge.source), `Edge source "${edge.source}" does not exist`).toBe(true);
      expect(allNodeIds.has(edge.target), `Edge target "${edge.target}" does not exist`).toBe(true);
      expect(['INFLUENCED', 'CRITIQUED', 'DEVELOPED', 'SYNTHESIZED']).toContain(edge.type);
    }
  });

  it('validates that media links have valid targets', () => {
    expect(mediaData.length).toBeGreaterThan(50);

    for (const item of mediaData) {
      expect(
        allNodeIds.has(item.targetId),
        `Media item "${item.id}" references unknown target "${item.targetId}"`
      ).toBe(true);
      expect(item.url.length).toBeGreaterThan(0);
    }
  });

  it('verifies pathfinding across major philosophical lineages', () => {
    // Plato -> Schopenhauer
    const platoToSchop = findInfluencePath('plato', 'arthur-schopenhauer', edgesData as any);
    expect(platoToSchop.found).toBe(true);
    expect(platoToSchop.nodes).toContain('plato');
    expect(platoToSchop.nodes).toContain('immanuel-kant');
    expect(platoToSchop.nodes).toContain('arthur-schopenhauer');

    // Socrates -> Nietzsche
    const socToNietzsche = findInfluencePath('socrates', 'friedrich-nietzsche', edgesData as any);
    expect(socToNietzsche.found).toBe(true);
    expect(socToNietzsche.nodes[0]).toBe('socrates');
    expect(socToNietzsche.nodes[socToNietzsche.nodes.length - 1]).toBe('friedrich-nietzsche');

    // Descartes -> Nick Bostrom
    const descToBostrom = findInfluencePath('rene-descartes', 'nick-bostrom', edgesData as any);
    expect(descToBostrom.found).toBe(true);
  });

  it('verifies visual graph generation and node details retrieval', () => {
    const { nodes, links } = getVisualGraph();
    expect(nodes.length).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);

    const kantDetails = getNodeDetails('immanuel-kant');
    expect(kantDetails.node).toBeDefined();
    expect(kantDetails.node?.name).toBe('Immanuel Kant');
    expect(kantDetails.predecessors.length).toBeGreaterThan(0);
    expect(kantDetails.successors.length).toBeGreaterThan(0);
    expect(kantDetails.media.length).toBeGreaterThan(0);
  });
});
