import { describe, it, expect } from 'vitest';
import { forceSimulation, forceCollide, forceManyBody, forceLink, forceX, forceY } from 'd3-force';
import { getVisualGraph } from '../src/lib/graph/graph-service';

describe('Graph Node Spacing & Anti-Overlap Seeding', () => {
  it('ensures all nodes have finite seeded coordinates and valid chronological years', () => {
    const { nodes } = getVisualGraph({ includeConcepts: true });
    expect(nodes.length).toBeGreaterThan(40);

    for (const node of nodes) {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
      expect(typeof node.year).toBe('number');
      expect(Number.isFinite(node.year)).toBe(true);
    }
  });

  it('distributes nodes generously across positive and negative vertical space', () => {
    const { nodes } = getVisualGraph({ includeConcepts: true });
    const yValues = nodes.map((n) => n.y ?? 0);

    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    expect(minY).toBeLessThan(-200);
    expect(maxY).toBeGreaterThan(200);

    const positiveCount = yValues.filter((y) => y > 0).length;
    const negativeCount = yValues.filter((y) => y < 0).length;

    // Balanced vertical distribution
    expect(positiveCount).toBeGreaterThan(15);
    expect(negativeCount).toBeGreaterThan(15);
  });

  it('preserves chronological progression along horizontal axis', () => {
    const { nodes } = getVisualGraph({ includeConcepts: true });

    const thales = nodes.find((n) => n.id === 'thales');
    const plato = nodes.find((n) => n.id === 'plato');
    const descartes = nodes.find((n) => n.id === 'rene-descartes');
    const kant = nodes.find((n) => n.id === 'immanuel-kant');
    const nietzsche = nodes.find((n) => n.id === 'friedrich-nietzsche');

    expect(thales?.x).toBeDefined();
    expect(plato?.x).toBeDefined();
    expect(descartes?.x).toBeDefined();
    expect(kant?.x).toBeDefined();
    expect(nietzsche?.x).toBeDefined();

    expect(thales!.x!).toBeLessThan(plato!.x!);
    expect(plato!.x!).toBeLessThan(descartes!.x!);
    expect(descartes!.x!).toBeLessThan(kant!.x!);
    expect(kant!.x!).toBeLessThan(nietzsche!.x!);
  });

  it('verifies that D3 force configuration actively prevents node overlap after physics warmup', () => {
    const { nodes: rawNodes, links: rawLinks } = getVisualGraph({ includeConcepts: true });

    // Deep clone nodes and links so simulation mutates test objects only
    const simNodes = rawNodes.map((n) => ({ ...n }));
    const simLinks = rawLinks.map((l) => ({ ...l }));

    const multiplier = 1.9; // Default generous spread multiplier
    const collisionRadius = (node: any) => {
      const size = Math.max(8, (node.val || 8) * 0.9);
      const isAnchor = (node.importanceScore && node.importanceScore >= 90) || false;
      const basePadding = isAnchor ? 54 : 46;
      return size + basePadding * multiplier;
    };

    const sim = forceSimulation(simNodes as any)
      .force('collide', forceCollide().radius(collisionRadius).iterations(4))
      .force(
        'charge',
        forceManyBody()
          .strength(-750 * multiplier)
          .distanceMax(2600 * multiplier)
      )
      .force(
        'link',
        forceLink(simLinks as any)
          .id((d: any) => d.id)
          .distance(135 * multiplier)
      )
      .force(
        'x',
        forceX((node: any) => {
          const minYear = -650;
          const totalSpan = 2020 - minYear;
          const year = typeof node.year === 'number' ? node.year : 1500;
          const norm = Math.max(0, Math.min(1, (year - minYear) / totalSpan));
          return (norm - 0.5) * 3400;
        }).strength(0.05)
      )
      .force('y', forceY(0).strength(0.015))
      .stop();

    // Run 100 simulation ticks to let physics settle
    for (let i = 0; i < 100; i++) {
      sim.tick();
    }

    // Verify minimum pairwise distance across all nodes to guarantee zero overlap
    let minPairwiseDistance = Infinity;
    let closestPair: [string, string] = ['', ''];

    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        const dx = (a.x ?? 0) - (b.x ?? 0);
        const dy = (a.y ?? 0) - (b.y ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minPairwiseDistance) {
          minPairwiseDistance = dist;
          closestPair = [a.id, b.id];
        }
      }
    }

    // Every node should have plenty of breathing room (at least 75px between centers)
    expect(
      minPairwiseDistance,
      `Closest nodes "${closestPair[0]}" and "${closestPair[1]}" are too close: ${minPairwiseDistance.toFixed(1)}px`
    ).toBeGreaterThanOrEqual(75);
  });
});
