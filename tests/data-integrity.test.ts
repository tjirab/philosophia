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
      expect(p.imageUrl, `Philosopher ${p.id} is missing imageUrl`).toBeDefined();
      expect(p.imageUrl).toMatch(/^\/portraits\/[a-z0-9-]+\.jpg$/);
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

  it('validates that all philosophers and concepts are connected to edges and not isolated', () => {
    const connectedIds = new Set<string>();
    for (const e of edgesData) {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    }
    for (const p of philosophersData) {
      expect(connectedIds.has(p.id), `Philosopher "${p.id}" is isolated with no edges`).toBe(true);
    }
    for (const c of conceptsData) {
      expect(connectedIds.has(c.id), `Concept "${c.id}" is isolated with no edges`).toBe(true);
    }
  });

  it('validates that the graph is a single unified connected component', () => {
    const adj = new Map<string, string[]>();
    for (const id of allNodeIds) adj.set(id, []);
    for (const e of edgesData) {
      if (adj.has(e.source) && adj.has(e.target)) {
        adj.get(e.source)!.push(e.target);
        adj.get(e.target)!.push(e.source);
      }
    }
    const visited = new Set<string>();
    const firstNode = allNodeIds.values().next().value;
    expect(firstNode).toBeDefined();

    const queue = [firstNode!];
    visited.add(firstNode!);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const neighbor of adj.get(curr) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    expect(visited.size).toBe(allNodeIds.size);
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

    // John Locke -> Montesquieu -> Separation of Powers
    const lockeToSep = findInfluencePath('john-locke', 'separation-of-powers', edgesData as any);
    expect(lockeToSep.found).toBe(true);
    expect(lockeToSep.nodes).toContain('montesquieu');

    // Hegel -> Feuerbach -> Anthropological Projection
    const hegelToProj = findInfluencePath('gwf-hegel', 'anthropological-projection', edgesData as any);
    expect(hegelToProj.found).toBe(true);
    expect(hegelToProj.nodes).toContain('ludwig-feuerbach');

    // Marx -> Baudrillard -> Simulacra
    const marxToSimulacra = findInfluencePath('karl-marx', 'simulacra-and-hyperreality', edgesData as any);
    expect(marxToSimulacra.found).toBe(true);
    expect(marxToSimulacra.nodes).toContain('jean-baudrillard');

    // Baudrillard -> Bostrom
    const baudrillardToBostrom = findInfluencePath('jean-baudrillard', 'nick-bostrom', edgesData as any);
    expect(baudrillardToBostrom.found).toBe(true);

    // Kant -> Saussure -> Semiology
    const kantToSemiology = findInfluencePath('immanuel-kant', 'semiology-signifier-signified', edgesData as any);
    expect(kantToSemiology.found).toBe(true);
    expect(kantToSemiology.nodes).toContain('ferdinand-de-saussure');

    // Kant -> Horkheimer -> Instrumental Reason
    const kantToInstrumental = findInfluencePath('immanuel-kant', 'instrumental-reason', edgesData as any);
    expect(kantToInstrumental.found).toBe(true);
    expect(kantToInstrumental.nodes).toContain('max-horkheimer');

    // Kant / Hegel -> Alenka Zupančič -> Ethics of the Real
    const kantToZupancic = findInfluencePath('immanuel-kant', 'alenka-zupancic', edgesData as any);
    expect(kantToZupancic.found).toBe(true);

    const hegelToZupancic = findInfluencePath('gwf-hegel', 'alenka-zupancic', edgesData as any);
    expect(hegelToZupancic.found).toBe(true);

    const zupancicToEthics = findInfluencePath('alenka-zupancic', 'ethics-of-the-real', edgesData as any);
    expect(zupancicToEthics.found).toBe(true);

    // Hegel -> Marcuse -> Habermas
    const hegelToHabermas = findInfluencePath('gwf-hegel', 'jurgen-habermas', edgesData as any);
    expect(hegelToHabermas.found).toBe(true);

    // Marx -> Marcuse -> One-Dimensional Man -> Foucault
    const marxToFoucault = findInfluencePath('karl-marx', 'michel-foucault', edgesData as any);
    expect(marxToFoucault.found).toBe(true);

    const marcuseToOneDim = findInfluencePath('herbert-marcuse', 'one-dimensional-man', edgesData as any);
    expect(marcuseToOneDim.found).toBe(true);

    // David Hume -> Adam Smith -> Karl Marx
    const humeToMarx = findInfluencePath('david-hume', 'karl-marx', edgesData as any);
    expect(humeToMarx.found).toBe(true);
    expect(humeToMarx.nodes).toContain('adam-smith');

    // Adam Smith -> John Stuart Mill
    const smithToMill = findInfluencePath('adam-smith', 'john-stuart-mill', edgesData as any);
    expect(smithToMill.found).toBe(true);

    // Adam Smith -> Impartial Spectator -> John Rawls
    const smithToRawls = findInfluencePath('adam-smith', 'john-rawls', edgesData as any);
    expect(smithToRawls.found).toBe(true);

    // Aristotle -> Machiavelli -> Hobbes
    const aristotleToHobbes = findInfluencePath('aristotle', 'thomas-hobbes', edgesData as any);
    expect(aristotleToHobbes.found).toBe(true);
    expect(aristotleToHobbes.nodes).toContain('machiavelli');

    // John Locke -> Voltaire -> Rousseau / Kant
    const lockeToVoltaire = findInfluencePath('john-locke', 'voltaire', edgesData as any);
    expect(lockeToVoltaire.found).toBe(true);

    const voltaireToRousseau = findInfluencePath('voltaire', 'jean-jacques-rousseau', edgesData as any);
    expect(voltaireToRousseau.found).toBe(true);

    const voltaireToKant = findInfluencePath('voltaire', 'immanuel-kant', edgesData as any);
    expect(voltaireToKant.found).toBe(true);

    // Siddhartha Gautama -> Nagarjuna -> Adi Shankara -> Schopenhauer
    const gautamaToNagarjuna = findInfluencePath('siddhartha-gautama', 'nagarjuna', edgesData as any);
    expect(gautamaToNagarjuna.found).toBe(true);

    const nagarjunaToShankara = findInfluencePath('nagarjuna', 'adi-shankara', edgesData as any);
    expect(nagarjunaToShankara.found).toBe(true);

    const gautamaToShankara = findInfluencePath('siddhartha-gautama', 'adi-shankara', edgesData as any);
    expect(gautamaToShankara.found).toBe(true);

    const shankaraToSchop = findInfluencePath('adi-shankara', 'arthur-schopenhauer', edgesData as any);
    expect(shankaraToSchop.found).toBe(true);

    // Pyrrho -> Nagarjuna
    const pyrrhoToNagarjuna = findInfluencePath('pyrrho', 'nagarjuna', edgesData as any);
    expect(pyrrhoToNagarjuna.found).toBe(true);

    // Nagarjuna -> Derrida
    const nagarjunaToDerrida = findInfluencePath('nagarjuna', 'jacques-derrida', edgesData as any);
    expect(nagarjunaToDerrida.found).toBe(true);

    // Nagarjuna -> Wittgenstein
    const nagarjunaToWitt = findInfluencePath('nagarjuna', 'ludwig-wittgenstein', edgesData as any);
    expect(nagarjunaToWitt.found).toBe(true);

    // Socrates -> Epictetus -> Spinoza
    const socratesToSpinoza = findInfluencePath('socrates', 'baruch-spinoza', edgesData as any);
    expect(socratesToSpinoza.found).toBe(true);
    expect(socratesToSpinoza.nodes).toContain('epictetus');

    // Marcus Aurelius -> Montaigne
    const aureliusToMontaigne = findInfluencePath('marcus-aurelius', 'michel-de-montaigne', edgesData as any);
    expect(aureliusToMontaigne.found).toBe(true);

    // Thales -> Anaximander -> Parmenides
    const thalesToAnax = findInfluencePath('thales', 'anaximander', edgesData as any);
    expect(thalesToAnax.found).toBe(true);

    const anaxToParm = findInfluencePath('anaximander', 'parmenides', edgesData as any);
    expect(anaxToParm.found).toBe(true);

    // Confucius -> Mencius -> Zhuangzi
    const confuciusToZhuang = findInfluencePath('confucius', 'zhuangzi', edgesData as any);
    expect(confuciusToZhuang.found).toBe(true);
    expect(confuciusToZhuang.nodes).toContain('mencius');

    // David Hume -> Jeremy Bentham -> John Stuart Mill
    const humeToBentham = findInfluencePath('david-hume', 'jeremy-bentham', edgesData as any);
    expect(humeToBentham.found).toBe(true);

    const benthamToMill = findInfluencePath('jeremy-bentham', 'john-stuart-mill', edgesData as any);
    expect(benthamToMill.found).toBe(true);

    // John Locke -> Mary Wollstonecraft -> John Stuart Mill
    const lockeToMill = findInfluencePath('john-locke', 'john-stuart-mill', edgesData as any);
    expect(lockeToMill.found).toBe(true);

    const wollstonecraftToMill = findInfluencePath('mary-wollstonecraft', 'john-stuart-mill', edgesData as any);
    expect(wollstonecraftToMill.found).toBe(true);
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

    const smithDetails = getNodeDetails('adam-smith');
    expect(smithDetails.node).toBeDefined();
    expect(smithDetails.node?.name).toBe('Adam Smith');
    expect(smithDetails.predecessors.length).toBeGreaterThan(0);
    expect(smithDetails.successors.length).toBeGreaterThan(0);
    expect(smithDetails.media.length).toBeGreaterThan(0);
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

  it('verifies distinction between concepts and thinkers in node relations', () => {
    const epicurusDetails = getNodeDetails('epicurus');
    expect(epicurusDetails.node).toBeDefined();

    // Epicurus formulated ataraxia (concept) and influenced Marx (thinker)
    const ataraxiaSuccessor = epicurusDetails.successors.find((s) => s.node.id === 'ataraxia');
    const marxSuccessor = epicurusDetails.successors.find((s) => s.node.id === 'karl-marx');

    expect(ataraxiaSuccessor).toBeDefined();
    expect(marxSuccessor).toBeDefined();

    // ataraxia has 'title' and 'branch' (Concept)
    expect('title' in ataraxiaSuccessor!.node).toBe(true);
    expect('branch' in ataraxiaSuccessor!.node).toBe(true);

    // karl-marx has 'name' and 'birthYear' (Philosopher)
    expect('name' in marxSuccessor!.node).toBe(true);
    expect('birthYear' in marxSuccessor!.node).toBe(true);
  });
});
