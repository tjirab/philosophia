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

  it('validates that concepts have valid schema, title, summary, branch, era, and introducedBy philosopher', () => {
    expect(conceptsData.length).toBeGreaterThan(20);
    const validBranches = new Set(['epistemology', 'metaphysics', 'ethics', 'political', 'aesthetics', 'mind', 'logic']);

    for (const c of conceptsData) {
      expect(validEraIds.has(c.eraId), `Concept ${c.id} has invalid eraId ${c.eraId}`).toBe(true);
      expect(
        validPhilosopherIds.has(c.introducedBy),
        `Concept ${c.id} has unknown philosopher ${c.introducedBy}`
      ).toBe(true);
      expect(c.title, `Concept ${c.id} is missing title`).toBeDefined();
      expect(c.title.length, `Concept ${c.id} has empty title`).toBeGreaterThan(0);
      expect(c.summary, `Concept ${c.id} is missing summary`).toBeDefined();
      expect(c.summary.length, `Concept ${c.id} has empty summary`).toBeGreaterThan(0);
      expect(validBranches.has(c.branch), `Concept ${c.id} has invalid branch ${c.branch}`).toBe(true);
    }
  });

  it('validates that all concepts are connected to edges and not isolated', () => {
    const connectedIds = new Set<string>();
    for (const e of edgesData) {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    }
    for (const c of conceptsData) {
      expect(connectedIds.has(c.id), `Concept ${c.id} is isolated with no edges`).toBe(true);
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

    // Kant -> German Idealism -> Hegel
    const kantToHegel = findInfluencePath('immanuel-kant', 'gwf-hegel', edgesData as any);
    expect(kantToHegel.found).toBe(true);

    // Kant -> Frege -> Wittgenstein
    const kantToWitt = findInfluencePath('immanuel-kant', 'ludwig-wittgenstein', edgesData as any);
    expect(kantToWitt.found).toBe(true);

    // Avicenna -> Al-Ghazali -> Averroes -> Maimonides -> Aquinas
    const aviToAquinas = findInfluencePath('avicenna', 'thomas-aquinas', edgesData as any);
    expect(aviToAquinas.found).toBe(true);
    expect(aviToAquinas.nodes).toContain('al-ghazali');

    // Pyrrho -> Montaigne -> Descartes -> Pascal -> Kierkegaard
    const pyrrhoToKierk = findInfluencePath('pyrrho', 'soren-kierkegaard', edgesData as any);
    expect(pyrrhoToKierk.found).toBe(true);
    expect(pyrrhoToKierk.nodes).toContain('michel-de-montaigne');
    expect(pyrrhoToKierk.nodes).toContain('blaise-pascal');

    // Aristotle -> Boethius -> Thomas Aquinas
    const aristotleToAquinas = findInfluencePath('aristotle', 'thomas-aquinas', edgesData as any);
    expect(aristotleToAquinas.found).toBe(true);

    // Plotinus -> Boethius -> William of Ockham
    const plotinusToOckham = findInfluencePath('plotinus', 'william-of-ockham', edgesData as any);
    expect(plotinusToOckham.found).toBe(true);
    expect(plotinusToOckham.nodes).toContain('boethius');
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

  it('verifies search query filtering on philosophers and concepts without throwing exceptions', () => {
    const testQueries = ['kant', 'peirce', 'ontological', 'wager', 'butterfly', 'ego', 'forms', 'zeno', 'x'];
    for (const q of testQueries) {
      expect(() => {
        const result = getVisualGraph({ searchQuery: q, includeConcepts: true });
        expect(result.nodes).toBeDefined();
      }).not.toThrow();
    }
  });

  it('verifies chronological coordinate seeding for visual nodes', () => {
    const { nodes } = getVisualGraph({ includeConcepts: true });
    
    // Every node must have seeded x and y coordinates
    for (const node of nodes) {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }

    // Antiquity thinkers should be positioned to the left of Modern/Contemporary thinkers
    const thales = nodes.find((n) => n.id === 'thales');
    const plato = nodes.find((n) => n.id === 'plato');
    const kant = nodes.find((n) => n.id === 'immanuel-kant');
    const wittgenstein = nodes.find((n) => n.id === 'ludwig-wittgenstein');

    expect(thales?.x).toBeDefined();
    expect(plato?.x).toBeDefined();
    expect(kant?.x).toBeDefined();
    expect(wittgenstein?.x).toBeDefined();

    expect(thales!.x!).toBeLessThan(plato!.x!);
    expect(plato!.x!).toBeLessThan(kant!.x!);
    expect(kant!.x!).toBeLessThan(wittgenstein!.x!);
  });
});
