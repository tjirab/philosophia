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
      if (p.deathYear !== undefined && p.deathYear !== null) {
        expect(p.deathYear).toBeGreaterThanOrEqual(p.birthYear);
      }
      expect(p.imageUrl, `Philosopher ${p.id} is missing imageUrl`).toBeDefined();
      expect(p.imageUrl).toMatch(/^\/portraits\/[a-z0-9-]+\.jpg$/);
    }
  });

  it('validates that concepts have valid schema, title, summary, branch, era, and introducedBy philosopher', () => {
    expect(conceptsData.length).toBeGreaterThan(20);
    const validBranches = new Set([
      'epistemology',
      'metaphysics',
      'ethics',
      'political',
      'aesthetics',
      'mind',
      'logic',
      'psychoanalytic',
      'behavioral',
      'cognitive',
      'developmental',
      'humanistic',
      'social-psychology',
      'neuropsychology',
      'social-theory',
      'structural-functionalism',
      'conflict-theory',
      'symbolic-interactionism',
      'critical-sociology',
      'macrosociology',
    ]);

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

  it('validates that all edges connect existing nodes with no dangling references and strengths between 1 and 5', () => {
    expect(edgesData.length).toBeGreaterThan(30);

    for (const edge of edgesData) {
      expect(allNodeIds.has(edge.source), `Edge source "${edge.source}" does not exist`).toBe(true);
      expect(allNodeIds.has(edge.target), `Edge target "${edge.target}" does not exist`).toBe(true);
      expect(['INFLUENCED', 'CRITIQUED', 'DEVELOPED', 'SYNTHESIZED']).toContain(edge.type);
      if (edge.strength !== undefined) {
        expect(edge.strength, `Edge ${edge.source} -> ${edge.target} weight exceeds maximum of 5`).toBeLessThanOrEqual(5);
        expect(edge.strength, `Edge ${edge.source} -> ${edge.target} weight is below minimum of 1`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('validates that 100% of edges are provisioned with academic proof, citations, and unique IDs', () => {
    expect(edgesData.length).toBeGreaterThan(200);
    const seenIds = new Set<string>();

    for (const edge of edgesData as any[]) {
      const expectedId = `${edge.source}--${edge.target}`;
      expect(edge.id, `Edge ${edge.source}->${edge.target} missing id`).toBeDefined();
      expect(edge.id).toBe(expectedId);
      expect(seenIds.has(edge.id), `Duplicate edge ID detected: ${edge.id}`).toBe(false);
      seenIds.add(edge.id);

      expect(typeof edge.label).toBe('string');
      expect(edge.label.length).toBeGreaterThan(0);

      expect(typeof edge.description, `Edge ${edge.id} missing description`).toBe('string');
      expect(edge.description.length).toBeGreaterThan(10);

      expect(typeof edge.dialecticalTension, `Edge ${edge.id} missing dialecticalTension`).toBe('string');
      expect(edge.dialecticalTension.length).toBeGreaterThan(5);

      expect(['unanimous', 'broad-consensus', 'debated', 'revisionist']).toContain(edge.academicConsensus);

      expect(Array.isArray(edge.citations), `Edge ${edge.id} missing citations array`).toBe(true);
      expect(edge.citations.length, `Edge ${edge.id} has empty citations`).toBeGreaterThanOrEqual(1);

      for (const cite of edge.citations) {
        expect(['primary', 'secondary', 'sep', 'iep']).toContain(cite.citationType);
        expect(typeof cite.author).toBe('string');
        expect(cite.author.length).toBeGreaterThan(0);
        expect(typeof cite.work).toBe('string');
        expect(cite.work.length).toBeGreaterThan(0);
      }
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

    // Verify chronological directionality for Zupančič relations
    const zupancicDetails = getNodeDetails('alenka-zupancic');
    const zupancicSuccessorIds = zupancicDetails.successors.map((s) => s.node.id);
    const zupancicPredecessorIds = zupancicDetails.predecessors.map((p) => p.node.id);

    // Zupančič should not have historical predecessors as her successors
    expect(zupancicSuccessorIds).not.toContain('immanuel-kant');
    expect(zupancicSuccessorIds).not.toContain('gwf-hegel');
    expect(zupancicSuccessorIds).not.toContain('friedrich-nietzsche');
    expect(zupancicSuccessorIds).not.toContain('jacques-derrida');
    expect(zupancicSuccessorIds).not.toContain('gilles-deleuze');
    expect(zupancicSuccessorIds).toContain('ethics-of-the-real');

    expect(zupancicPredecessorIds).toContain('immanuel-kant');
    expect(zupancicPredecessorIds).toContain('gwf-hegel');
    expect(zupancicPredecessorIds).toContain('friedrich-nietzsche');
    expect(zupancicPredecessorIds).toContain('jacques-derrida');
    expect(zupancicPredecessorIds).toContain('gilles-deleuze');

    // Kant must not have 21st-century thinkers or concepts as predecessors
    const kantDetails = getNodeDetails('immanuel-kant');
    const kantPredecessorIds = kantDetails.predecessors.map((p) => p.node.id);
    expect(kantPredecessorIds).not.toContain('alenka-zupancic');
    expect(kantPredecessorIds).not.toContain('ethics-of-the-real');

    // Hegel -> Marcuse -> Habermas
    const hegelToHabermas = findInfluencePath('gwf-hegel', 'jurgen-habermas', edgesData as any);
    expect(hegelToHabermas.found).toBe(true);

    // Marx -> Marcuse -> One-Dimensional Man -> Foucault
    const marxToFoucault = findInfluencePath('karl-marx', 'michel-foucault', edgesData as any);
    expect(marxToFoucault.found).toBe(true);

    const marcuseToOneDim = findInfluencePath('herbert-marcuse', 'one-dimensional-man', edgesData as any);
    expect(marcuseToOneDim.found).toBe(true);

    // Popper -> Kuhn -> Paradigm Shift
    const popperToKuhn = findInfluencePath('karl-popper', 'thomas-kuhn', edgesData as any);
    expect(popperToKuhn.found).toBe(true);

    const kuhnToShift = findInfluencePath('thomas-kuhn', 'paradigm-shift', edgesData as any);
    expect(kuhnToShift.found).toBe(true);

    const kuhnToNormal = findInfluencePath('thomas-kuhn', 'normal-science', edgesData as any);
    expect(kuhnToNormal.found).toBe(true);

    const kuhnToIncommensurability = findInfluencePath('thomas-kuhn', 'incommensurability', edgesData as any);
    expect(kuhnToIncommensurability.found).toBe(true);

    // Hume -> Popper -> Kuhn
    const humeToKuhn = findInfluencePath('david-hume', 'thomas-kuhn', edgesData as any);
    expect(humeToKuhn.found).toBe(true);
    expect(humeToKuhn.nodes).toContain('karl-popper');

    // Popper -> Kuhn -> Foucault & Habermas
    const popperToFoucault = findInfluencePath('karl-popper', 'michel-foucault', edgesData as any);
    expect(popperToFoucault.found).toBe(true);
    expect(popperToFoucault.nodes).toContain('thomas-kuhn');

    const kuhnToHabermas = findInfluencePath('thomas-kuhn', 'jurgen-habermas', edgesData as any);
    expect(kuhnToHabermas.found).toBe(true);

    // Verify chronological directionality for Kuhn relations
    const kuhnDetails = getNodeDetails('thomas-kuhn');
    const kuhnSuccessorIds = kuhnDetails.successors.map((s) => s.node.id);
    const kuhnPredecessorIds = kuhnDetails.predecessors.map((p) => p.node.id);

    expect(kuhnSuccessorIds).toContain('paradigm-shift');
    expect(kuhnSuccessorIds).toContain('normal-science');
    expect(kuhnSuccessorIds).toContain('incommensurability');
    expect(kuhnSuccessorIds).toContain('michel-foucault');
    expect(kuhnSuccessorIds).toContain('jurgen-habermas');

    expect(kuhnSuccessorIds).not.toContain('karl-popper');
    expect(kuhnSuccessorIds).not.toContain('ludwig-wittgenstein');
    expect(kuhnSuccessorIds).not.toContain('david-hume');

    expect(kuhnPredecessorIds).toContain('karl-popper');
    expect(kuhnPredecessorIds).toContain('falsificationism');
    expect(kuhnPredecessorIds).toContain('ludwig-wittgenstein');
    expect(kuhnPredecessorIds).toContain('language-games');

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

    // Islamic Golden Age: Aristotle -> Al-Farabi -> Avicenna & Maimonides
    const aristotleToFarabi = findInfluencePath('aristotle', 'al-farabi', edgesData as any);
    expect(aristotleToFarabi.found).toBe(true);

    const farabiToAvicenna = findInfluencePath('al-farabi', 'avicenna', edgesData as any);
    expect(farabiToAvicenna.found).toBe(true);

    const farabiToMaimonides = findInfluencePath('al-farabi', 'moses-maimonides', edgesData as any);
    expect(farabiToMaimonides.found).toBe(true);

    const farabiToVirtuous = findInfluencePath('al-farabi', 'the-virtuous-city', edgesData as any);
    expect(farabiToVirtuous.found).toBe(true);

    // Ibn Khaldun: Aristotle / Averroes -> Ibn Khaldun -> Comte & Marx
    const aristotleToKhaldun = findInfluencePath('aristotle', 'ibn-khaldun', edgesData as any);
    expect(aristotleToKhaldun.found).toBe(true);

    const averroesToKhaldun = findInfluencePath('averroes', 'ibn-khaldun', edgesData as any);
    expect(averroesToKhaldun.found).toBe(true);

    const khaldunToComte = findInfluencePath('ibn-khaldun', 'auguste-comte', edgesData as any);
    expect(khaldunToComte.found).toBe(true);

    const khaldunToMarx = findInfluencePath('ibn-khaldun', 'karl-marx', edgesData as any);
    expect(khaldunToMarx.found).toBe(true);

    const khaldunToAsabiyyah = findInfluencePath('ibn-khaldun', 'asabiyyah', edgesData as any);
    expect(khaldunToAsabiyyah.found).toBe(true);

    // Elisabeth of Bohemia: Descartes <-> Elisabeth -> Spinoza
    const descToElisabeth = findInfluencePath('rene-descartes', 'elisabeth-of-bohemia', edgesData as any);
    expect(descToElisabeth.found).toBe(true);

    const elisabethToDesc = findInfluencePath('elisabeth-of-bohemia', 'rene-descartes', edgesData as any);
    expect(elisabethToDesc.found).toBe(true);

    const elisabethToSpinoza = findInfluencePath('elisabeth-of-bohemia', 'baruch-spinoza', edgesData as any);
    expect(elisabethToSpinoza.found).toBe(true);

    const elisabethToMindBody = findInfluencePath('elisabeth-of-bohemia', 'mind-body-interaction-problem', edgesData as any);
    expect(elisabethToMindBody.found).toBe(true);

    // Anscombe & Foot: Aristotle / Wittgenstein -> Anscombe -> Foot -> Rawls
    const wittToFoot = findInfluencePath('ludwig-wittgenstein', 'philippa-foot', edgesData as any);
    expect(wittToFoot.found).toBe(true);
    expect(wittToFoot.nodes).toContain('g-e-m-anscombe');

    const aristotleToAnscombe = findInfluencePath('aristotle', 'g-e-m-anscombe', edgesData as any);
    expect(aristotleToAnscombe.found).toBe(true);

    const anscombeToFoot = findInfluencePath('g-e-m-anscombe', 'philippa-foot', edgesData as any);
    expect(anscombeToFoot.found).toBe(true);

    const aquinasToFoot = findInfluencePath('thomas-aquinas', 'philippa-foot', edgesData as any);
    expect(aquinasToFoot.found).toBe(true);

    const footToRawls = findInfluencePath('philippa-foot', 'john-rawls', edgesData as any);
    expect(footToRawls.found).toBe(true);

    const anscombeToModern = findInfluencePath('g-e-m-anscombe', 'modern-moral-philosophy', edgesData as any);
    expect(anscombeToModern.found).toBe(true);

    const footToTrolley = findInfluencePath('philippa-foot', 'trolley-problem', edgesData as any);
    expect(footToTrolley.found).toBe(true);

    // Frantz Fanon: Sartre / Freud / Du Bois -> Fanon -> Foucault
    const sartreToFanon = findInfluencePath('jean-paul-sartre', 'frantz-fanon', edgesData as any);
    expect(sartreToFanon.found).toBe(true);

    const freudToFanon = findInfluencePath('sigmund-freud', 'frantz-fanon', edgesData as any);
    expect(freudToFanon.found).toBe(true);

    const duBoisToFanon = findInfluencePath('w-e-b-du-bois', 'frantz-fanon', edgesData as any);
    expect(duBoisToFanon.found).toBe(true);

    const fanonToFoucault = findInfluencePath('frantz-fanon', 'michel-foucault', edgesData as any);
    expect(fanonToFoucault.found).toBe(true);

    const fanonToPhenomenology = findInfluencePath('frantz-fanon', 'decolonial-phenomenology', edgesData as any);
    expect(fanonToPhenomenology.found).toBe(true);

    // C. Thi Nguyen: Wittgenstein / Foucault / Han / Kahneman -> C. Thi Nguyen -> Value Capture & Agency as Art
    const wittToNguyen = findInfluencePath('ludwig-wittgenstein', 'c-thi-nguyen', edgesData as any);
    expect(wittToNguyen.found).toBe(true);

    const foucaultToNguyen = findInfluencePath('michel-foucault', 'c-thi-nguyen', edgesData as any);
    expect(foucaultToNguyen.found).toBe(true);

    const hanToNguyen = findInfluencePath('byung-chul-han', 'c-thi-nguyen', edgesData as any);
    expect(hanToNguyen.found).toBe(true);

    const kahnemanToNguyen = findInfluencePath('daniel-kahneman', 'c-thi-nguyen', edgesData as any);
    expect(kahnemanToNguyen.found).toBe(true);

    const nguyenToValueCapture = findInfluencePath('c-thi-nguyen', 'value-capture', edgesData as any);
    expect(nguyenToValueCapture.found).toBe(true);

    const nguyenToAgencyAsArt = findInfluencePath('c-thi-nguyen', 'agency-as-art', edgesData as any);
    expect(nguyenToAgencyAsArt.found).toBe(true);

    // Carl Schmitt: Hobbes / Machiavelli / Weber -> Carl Schmitt -> State of Exception / Arendt / Habermas / Derrida
    const hobbesToSchmitt = findInfluencePath('thomas-hobbes', 'carl-schmitt', edgesData as any);
    expect(hobbesToSchmitt.found).toBe(true);

    const machiavelliToSchmitt = findInfluencePath('machiavelli', 'carl-schmitt', edgesData as any);
    expect(machiavelliToSchmitt.found).toBe(true);

    const weberToSchmitt = findInfluencePath('max-weber', 'carl-schmitt', edgesData as any);
    expect(weberToSchmitt.found).toBe(true);

    const schmittToException = findInfluencePath('carl-schmitt', 'state-of-exception', edgesData as any);
    expect(schmittToException.found).toBe(true);

    const schmittToArendt = findInfluencePath('carl-schmitt', 'hannah-arendt', edgesData as any);
    expect(schmittToArendt.found).toBe(true);

    const schmittToHabermas = findInfluencePath('carl-schmitt', 'jurgen-habermas', edgesData as any);
    expect(schmittToHabermas.found).toBe(true);

    const schmittToDerrida = findInfluencePath('carl-schmitt', 'jacques-derrida', edgesData as any);
    expect(schmittToDerrida.found).toBe(true);

    // Psychoanalytic lineages
    const freudToKlein = findInfluencePath('sigmund-freud', 'melanie-klein', edgesData as any);
    expect(freudToKlein.found).toBe(true);

    const kleinToWinnicott = findInfluencePath('melanie-klein', 'd-w-winnicott', edgesData as any);
    expect(kleinToWinnicott.found).toBe(true);

    const winnicottToMitchell = findInfluencePath('d-w-winnicott', 'stephen-mitchell', edgesData as any);
    expect(winnicottToMitchell.found).toBe(true);

    const freudToAnna = findInfluencePath('sigmund-freud', 'anna-freud', edgesData as any);
    expect(freudToAnna.found).toBe(true);

    const annaToErikson = findInfluencePath('anna-freud', 'erik-erikson', edgesData as any);
    expect(annaToErikson.found).toBe(true);

    const freudToAdler = findInfluencePath('sigmund-freud', 'alfred-adler', edgesData as any);
    expect(freudToAdler.found).toBe(true);

    const adlerToFrankl = findInfluencePath('alfred-adler', 'viktor-frankl', edgesData as any);
    expect(adlerToFrankl.found).toBe(true);

    const freudToLacan = findInfluencePath('sigmund-freud', 'jacques-lacan', edgesData as any);
    expect(freudToLacan.found).toBe(true);

    const lacanToFink = findInfluencePath('jacques-lacan', 'bruce-fink', edgesData as any);
    expect(lacanToFink.found).toBe(true);

    const lacanToJuliet = findInfluencePath('jacques-lacan', 'juliet-mitchell', edgesData as any);
    expect(lacanToJuliet.found).toBe(true);

    const husserlToRicoeur = findInfluencePath('edmund-husserl', 'paul-ricoeur', edgesData as any);
    expect(husserlToRicoeur.found).toBe(true);

    const ricoeurToHabermas = findInfluencePath('paul-ricoeur', 'jurgen-habermas', edgesData as any);
    expect(ricoeurToHabermas.found).toBe(true);

    const kleinToRacker = findInfluencePath('melanie-klein', 'heinrich-racker', edgesData as any);
    expect(kleinToRacker.found).toBe(true);

    const rackerToKernberg = findInfluencePath('heinrich-racker', 'otto-kernberg', edgesData as any);
    expect(rackerToKernberg.found).toBe(true);

    const kohutToKernberg = findInfluencePath('heinz-kohut', 'otto-kernberg', edgesData as any);
    expect(kohutToKernberg.found).toBe(true);

    const bowlbyToMitchell = findInfluencePath('john-bowlby', 'stephen-mitchell', edgesData as any);
    expect(bowlbyToMitchell.found).toBe(true);

    const fairbairnToMitchell = findInfluencePath('ronald-fairbairn', 'stephen-mitchell', edgesData as any);
    expect(fairbairnToMitchell.found).toBe(true);

    // Latin American & Decolonial lineages
    // 1. Descartes -> Sor Juana -> Anzaldúa
    const descToSorJuana = findInfluencePath('rene-descartes', 'sor-juana', edgesData as any);
    expect(descToSorJuana.found).toBe(true);

    const sorJuanaToAnzaldua = findInfluencePath('sor-juana', 'gloria-anzaldua', edgesData as any);
    expect(sorJuanaToAnzaldua.found).toBe(true);

    // 2. Fanon -> Freire -> Dussel -> philosophy-of-liberation
    const fanonToFreire = findInfluencePath('frantz-fanon', 'paulo-freire', edgesData as any);
    expect(fanonToFreire.found).toBe(true);

    const freireToDussel = findInfluencePath('paulo-freire', 'enrique-dussel', edgesData as any);
    expect(freireToDussel.found).toBe(true);

    const freireToPedagogy = findInfluencePath('paulo-freire', 'critical-pedagogy', edgesData as any);
    expect(freireToPedagogy.found).toBe(true);

    const dusselToLiberation = findInfluencePath('enrique-dussel', 'philosophy-of-liberation', edgesData as any);
    expect(dusselToLiberation.found).toBe(true);

    // 3. Du Bois -> Quijano -> coloniality-of-power
    const duBoisToQuijano = findInfluencePath('w-e-b-du-bois', 'anibal-quijano', edgesData as any);
    expect(duBoisToQuijano.found).toBe(true);

    const quijanoToColoniality = findInfluencePath('anibal-quijano', 'coloniality-of-power', edgesData as any);
    expect(quijanoToColoniality.found).toBe(true);

    // 4. Quijano -> Anzaldúa -> mestiza-consciousness
    const quijanoToAnzaldua = findInfluencePath('anibal-quijano', 'gloria-anzaldua', edgesData as any);
    expect(quijanoToAnzaldua.found).toBe(true);

    const anzalduaToMestiza = findInfluencePath('gloria-anzaldua', 'mestiza-consciousness', edgesData as any);
    expect(anzalduaToMestiza.found).toBe(true);

    // Africana & African Philosophy lineages
    // 1. Ptahhotep -> Thales / Socrates / Ma'at
    const ptahhotepToMaat = findInfluencePath('ptahhotep', 'maat-ethics', edgesData as any);
    expect(ptahhotepToMaat.found).toBe(true);

    const ptahhotepToThales = findInfluencePath('ptahhotep', 'thales', edgesData as any);
    expect(ptahhotepToThales.found).toBe(true);

    const ptahhotepToSocrates = findInfluencePath('ptahhotep', 'socrates', edgesData as any);
    expect(ptahhotepToSocrates.found).toBe(true);

    // 2. Zara Yaqob -> Hatäta / Descartes / Amo
    const yaqobToHatata = findInfluencePath('zara-yaqob', 'hatata-rationalism', edgesData as any);
    expect(yaqobToHatata.found).toBe(true);

    const yaqobToDescartes = findInfluencePath('zara-yaqob', 'rene-descartes', edgesData as any);
    expect(yaqobToDescartes.found).toBe(true);

    const yaqobToAmo = findInfluencePath('zara-yaqob', 'anton-wilhelm-amo', edgesData as any);
    expect(yaqobToAmo.found).toBe(true);

    // 3. Descartes -> Amo -> Wiredu -> conceptual-decolonization
    const descToAmo = findInfluencePath('rene-descartes', 'anton-wilhelm-amo', edgesData as any);
    expect(descToAmo.found).toBe(true);

    const amoToWiredu = findInfluencePath('anton-wilhelm-amo', 'kwasi-wiredu', edgesData as any);
    expect(amoToWiredu.found).toBe(true);

    const wireduToDecol = findInfluencePath('kwasi-wiredu', 'conceptual-decolonization', edgesData as any);
    expect(wireduToDecol.found).toBe(true);

    // 4. Césaire -> Négritude / Fanon
    const cesaireToNegritude = findInfluencePath('aime-cesaire', 'negritude', edgesData as any);
    expect(cesaireToNegritude.found).toBe(true);

    const cesaireToFanon = findInfluencePath('aime-cesaire', 'frantz-fanon', edgesData as any);
    expect(cesaireToFanon.found).toBe(true);

    const sartreToCesaire = findInfluencePath('jean-paul-sartre', 'aime-cesaire', edgesData as any);
    expect(sartreToCesaire.found).toBe(true);

    // 5. Fanon / Foucault / Arendt -> Mbembe -> necropolitics
    const fanonToMbembe = findInfluencePath('frantz-fanon', 'achille-mbembe', edgesData as any);
    expect(fanonToMbembe.found).toBe(true);

    const foucaultToMbembe = findInfluencePath('michel-foucault', 'achille-mbembe', edgesData as any);
    expect(foucaultToMbembe.found).toBe(true);

    const arendtToMbembe = findInfluencePath('hannah-arendt', 'achille-mbembe', edgesData as any);
    expect(arendtToMbembe.found).toBe(true);

    const mbembeToNecro = findInfluencePath('achille-mbembe', 'necropolitics', edgesData as any);
    expect(mbembeToNecro.found).toBe(true);

    // Asian Classical Heterodox & Kyoto School lineages
    // 1. Confucius -> Mozi -> jian-ai & Bentham
    const confuciusToMozi = findInfluencePath('confucius', 'mozi', edgesData as any);
    expect(confuciusToMozi.found).toBe(true);

    const moziToJianAi = findInfluencePath('mozi', 'jian-ai', edgesData as any);
    expect(moziToJianAi.found).toBe(true);

    const moziToBentham = findInfluencePath('mozi', 'jeremy-bentham', edgesData as any);
    expect(moziToBentham.found).toBe(true);

    // 2. Mencius -> Xunzi -> acquired-goodness & Han Feizi
    const menciusToXunzi = findInfluencePath('mencius', 'xunzi', edgesData as any);
    expect(menciusToXunzi.found).toBe(true);

    const xunziToAcquiredGoodness = findInfluencePath('xunzi', 'acquired-goodness', edgesData as any);
    expect(xunziToAcquiredGoodness.found).toBe(true);

    const xunziToHanFeizi = findInfluencePath('xunzi', 'han-feizi', edgesData as any);
    expect(xunziToHanFeizi.found).toBe(true);

    // 3. Han Feizi -> legalism-fajia & Machiavelli
    const hanFeiziToLegalism = findInfluencePath('han-feizi', 'legalism-fajia', edgesData as any);
    expect(hanFeiziToLegalism.found).toBe(true);

    const hanFeiziToMachiavelli = findInfluencePath('han-feizi', 'machiavelli', edgesData as any);
    expect(hanFeiziToMachiavelli.found).toBe(true);

    // 4. Mahavira -> anekantavada & Nagarjuna
    const mahaviraToAnekanta = findInfluencePath('mahavira', 'anekantavada', edgesData as any);
    expect(mahaviraToAnekanta.found).toBe(true);

    const mahaviraToNagarjuna = findInfluencePath('mahavira', 'nagarjuna', edgesData as any);
    expect(mahaviraToNagarjuna.found).toBe(true);

    // 5. Siddhartha Gautama -> Dogen -> being-time & Nishida
    const gautamaToDogen = findInfluencePath('siddhartha-gautama', 'dogen', edgesData as any);
    expect(gautamaToDogen.found).toBe(true);

    const dogenToBeingTime = findInfluencePath('dogen', 'being-time', edgesData as any);
    expect(dogenToBeingTime.found).toBe(true);

    const dogenToNishida = findInfluencePath('dogen', 'nishida-kitaro', edgesData as any);
    expect(dogenToNishida.found).toBe(true);

    const dogenToHeidegger = findInfluencePath('dogen', 'martin-heidegger', edgesData as any);
    expect(dogenToHeidegger.found).toBe(true);

    // 6. William James / Kant -> Nishida Kitaro -> logic-of-basho & Byung-Chul Han
    const jamesToNishida = findInfluencePath('william-james', 'nishida-kitaro', edgesData as any);
    expect(jamesToNishida.found).toBe(true);

    const kantToNishida = findInfluencePath('immanuel-kant', 'nishida-kitaro', edgesData as any);
    expect(kantToNishida.found).toBe(true);

    const nishidaToBasho = findInfluencePath('nishida-kitaro', 'logic-of-basho', edgesData as any);
    expect(nishidaToBasho.found).toBe(true);

    const nishidaToHan = findInfluencePath('nishida-kitaro', 'byung-chul-han', edgesData as any);
    expect(nishidaToHan.found).toBe(true);

    // 7. Siddhartha Gautama / Du Bois / James -> Ambedkar -> navayana-buddhism
    const gautamaToAmbedkar = findInfluencePath('siddhartha-gautama', 'b-r-ambedkar', edgesData as any);
    expect(gautamaToAmbedkar.found).toBe(true);

    const duBoisToAmbedkar = findInfluencePath('w-e-b-du-bois', 'b-r-ambedkar', edgesData as any);
    expect(duBoisToAmbedkar.found).toBe(true);

    const jamesToAmbedkar = findInfluencePath('william-james', 'b-r-ambedkar', edgesData as any);
    expect(jamesToAmbedkar.found).toBe(true);

    const ambedkarToNavayana = findInfluencePath('b-r-ambedkar', 'navayana-buddhism', edgesData as any);
    expect(ambedkarToNavayana.found).toBe(true);

    // Islamic Golden Age & Jewish Andalusian Philosophy lineages
    // 1. Aristotle / Plotinus -> Al-Kindi -> cosmic-finitude & Al-Farabi / Avicenna
    const aristotleToKindi = findInfluencePath('aristotle', 'al-kindi', edgesData as any);
    expect(aristotleToKindi.found).toBe(true);

    const plotinusToKindi = findInfluencePath('plotinus', 'al-kindi', edgesData as any);
    expect(plotinusToKindi.found).toBe(true);

    const kindiToFinitude = findInfluencePath('al-kindi', 'cosmic-finitude', edgesData as any);
    expect(kindiToFinitude.found).toBe(true);

    const kindiToFarabi = findInfluencePath('al-kindi', 'al-farabi', edgesData as any);
    expect(kindiToFarabi.found).toBe(true);

    const kindiToAvicenna = findInfluencePath('al-kindi', 'avicenna', edgesData as any);
    expect(kindiToAvicenna.found).toBe(true);

    // 2. Plotinus -> Ibn Gabirol -> universal-hylomorphism & Aquinas / Spinoza
    const plotinusToGabirol = findInfluencePath('plotinus', 'ibn-gabirol', edgesData as any);
    expect(plotinusToGabirol.found).toBe(true);

    const gabirolToHylomorphism = findInfluencePath('ibn-gabirol', 'universal-hylomorphism', edgesData as any);
    expect(gabirolToHylomorphism.found).toBe(true);

    const gabirolToAquinas = findInfluencePath('ibn-gabirol', 'thomas-aquinas', edgesData as any);
    expect(gabirolToAquinas.found).toBe(true);

    const gabirolToSpinoza = findInfluencePath('ibn-gabirol', 'baruch-spinoza', edgesData as any);
    expect(gabirolToSpinoza.found).toBe(true);

    // 3. Avicenna / Al-Ghazali -> Ibn Tufayl -> autodidactic-empiricism & Averroes / Locke
    const avicennaToTufayl = findInfluencePath('avicenna', 'ibn-tufayl', edgesData as any);
    expect(avicennaToTufayl.found).toBe(true);

    const ghazaliToTufayl = findInfluencePath('al-ghazali', 'ibn-tufayl', edgesData as any);
    expect(ghazaliToTufayl.found).toBe(true);

    const tufaylToEmpiricism = findInfluencePath('ibn-tufayl', 'autodidactic-empiricism', edgesData as any);
    expect(tufaylToEmpiricism.found).toBe(true);

    const tufaylToAverroes = findInfluencePath('ibn-tufayl', 'averroes', edgesData as any);
    expect(tufaylToAverroes.found).toBe(true);

    const tufaylToLocke = findInfluencePath('ibn-tufayl', 'john-locke', edgesData as any);
    expect(tufaylToLocke.found).toBe(true);

    // 4. Avicenna / Plato -> Suhrawardi -> knowledge-by-presence & Ibn Arabi / Mulla Sadra
    const avicennaToSuhrawardi = findInfluencePath('avicenna', 'suhrawardi', edgesData as any);
    expect(avicennaToSuhrawardi.found).toBe(true);

    const platoToSuhrawardi = findInfluencePath('plato', 'suhrawardi', edgesData as any);
    expect(platoToSuhrawardi.found).toBe(true);

    const suhrawardiToPresence = findInfluencePath('suhrawardi', 'knowledge-by-presence', edgesData as any);
    expect(suhrawardiToPresence.found).toBe(true);

    const suhrawardiToArabi = findInfluencePath('suhrawardi', 'ibn-arabi', edgesData as any);
    expect(suhrawardiToArabi.found).toBe(true);

    const suhrawardiToSadra = findInfluencePath('suhrawardi', 'mulla-sadra', edgesData as any);
    expect(suhrawardiToSadra.found).toBe(true);

    // 5. Averroes / Plotinus / Suhrawardi -> Ibn Arabi -> wahdat-al-wujud & Spinoza
    const averroesToArabi = findInfluencePath('averroes', 'ibn-arabi', edgesData as any);
    expect(averroesToArabi.found).toBe(true);

    const arabiToWahdat = findInfluencePath('ibn-arabi', 'wahdat-al-wujud', edgesData as any);
    expect(arabiToWahdat.found).toBe(true);

    const arabiToSadra = findInfluencePath('ibn-arabi', 'mulla-sadra', edgesData as any);
    expect(arabiToSadra.found).toBe(true);

    const arabiToSpinoza = findInfluencePath('ibn-arabi', 'baruch-spinoza', edgesData as any);
    expect(arabiToSpinoza.found).toBe(true);

    // 6. Maimonides / Aristotle -> Hasdai Crescas -> infinite-void-and-space & Spinoza
    const maimonidesToCrescas = findInfluencePath('moses-maimonides', 'hasdai-crescas', edgesData as any);
    expect(maimonidesToCrescas.found).toBe(true);

    const aristotleToCrescas = findInfluencePath('aristotle', 'hasdai-crescas', edgesData as any);
    expect(aristotleToCrescas.found).toBe(true);

    const crescasToSpace = findInfluencePath('hasdai-crescas', 'infinite-void-and-space', edgesData as any);
    expect(crescasToSpace.found).toBe(true);

    const crescasToSpinoza = findInfluencePath('hasdai-crescas', 'baruch-spinoza', edgesData as any);
    expect(crescasToSpinoza.found).toBe(true);

    // 7. Avicenna / Suhrawardi / Ibn Arabi -> Mulla Sadra -> primacy-of-existence & Heidegger
    const avicennaToSadra = findInfluencePath('avicenna', 'mulla-sadra', edgesData as any);
    expect(avicennaToSadra.found).toBe(true);

    const sadraToExistence = findInfluencePath('mulla-sadra', 'primacy-of-existence', edgesData as any);
    expect(sadraToExistence.found).toBe(true);

    const sadraToHeidegger = findInfluencePath('mulla-sadra', 'martin-heidegger', edgesData as any);
    expect(sadraToHeidegger.found).toBe(true);

    // Early Modern Women Philosophers lineages
    // 1. Descartes / Hobbes -> Cavendish -> vitalist-materialism & Conway
    const descToCavendish = findInfluencePath('rene-descartes', 'margaret-cavendish', edgesData as any);
    expect(descToCavendish.found).toBe(true);

    const hobbesToCavendish = findInfluencePath('thomas-hobbes', 'margaret-cavendish', edgesData as any);
    expect(hobbesToCavendish.found).toBe(true);

    const cavendishToVitalism = findInfluencePath('margaret-cavendish', 'vitalist-materialism', edgesData as any);
    expect(cavendishToVitalism.found).toBe(true);

    const cavendishToConway = findInfluencePath('margaret-cavendish', 'anne-conway', edgesData as any);
    expect(cavendishToConway.found).toBe(true);

    // 2. Descartes / Spinoza -> Conway -> vitalist-monadism & Leibniz
    const descToConway = findInfluencePath('rene-descartes', 'anne-conway', edgesData as any);
    expect(descToConway.found).toBe(true);

    const spinozaToConway = findInfluencePath('baruch-spinoza', 'anne-conway', edgesData as any);
    expect(spinozaToConway.found).toBe(true);

    const conwayToMonadism = findInfluencePath('anne-conway', 'vitalist-monadism', edgesData as any);
    expect(conwayToMonadism.found).toBe(true);

    const conwayToLeibniz = findInfluencePath('anne-conway', 'gottfried-leibniz', edgesData as any);
    expect(conwayToLeibniz.found).toBe(true);

    // 3. Descartes / Locke -> Astell -> cartesian-feminist-rationalism & Wollstonecraft
    const descToAstell = findInfluencePath('rene-descartes', 'mary-astell', edgesData as any);
    expect(descToAstell.found).toBe(true);

    const lockeToAstell = findInfluencePath('john-locke', 'mary-astell', edgesData as any);
    expect(lockeToAstell.found).toBe(true);

    const astellToRationalism = findInfluencePath('mary-astell', 'cartesian-feminist-rationalism', edgesData as any);
    expect(astellToRationalism.found).toBe(true);

    const astellToWollstonecraft = findInfluencePath('mary-astell', 'mary-wollstonecraft', edgesData as any);
    expect(astellToWollstonecraft.found).toBe(true);

    // 4. Locke -> Masham -> empirical-moral-sentimentalism & Leibniz / Astell
    const lockeToMasham = findInfluencePath('john-locke', 'damaris-masham', edgesData as any);
    expect(lockeToMasham.found).toBe(true);

    const mashamToSentimentalism = findInfluencePath('damaris-masham', 'empirical-moral-sentimentalism', edgesData as any);
    expect(mashamToSentimentalism.found).toBe(true);

    const mashamToLeibniz = findInfluencePath('damaris-masham', 'gottfried-leibniz', edgesData as any);
    expect(mashamToLeibniz.found).toBe(true);

    const mashamToAstell = findInfluencePath('damaris-masham', 'mary-astell', edgesData as any);
    expect(mashamToAstell.found).toBe(true);

    // 5. Locke / Hobbes -> Cockburn -> moral-fitness-realism & Hume
    const lockeToCockburn = findInfluencePath('john-locke', 'catharine-cockburn', edgesData as any);
    expect(lockeToCockburn.found).toBe(true);

    const hobbesToCockburn = findInfluencePath('thomas-hobbes', 'catharine-cockburn', edgesData as any);
    expect(hobbesToCockburn.found).toBe(true);

    const cockburnToRealism = findInfluencePath('catharine-cockburn', 'moral-fitness-realism', edgesData as any);
    expect(cockburnToRealism.found).toBe(true);

    const cockburnToHume = findInfluencePath('catharine-cockburn', 'david-hume', edgesData as any);
    expect(cockburnToHume.found).toBe(true);

    // 6. Leibniz / Voltaire / Descartes -> Du Châtelet -> newtonian-leibnizian-synthesis & Kant
    const leibnizToChatelet = findInfluencePath('gottfried-leibniz', 'emilie-du-chatelet', edgesData as any);
    expect(leibnizToChatelet.found).toBe(true);

    const voltaireToChatelet = findInfluencePath('voltaire', 'emilie-du-chatelet', edgesData as any);
    expect(voltaireToChatelet.found).toBe(true);

    const descToChatelet = findInfluencePath('rene-descartes', 'emilie-du-chatelet', edgesData as any);
    expect(descToChatelet.found).toBe(true);

    const chateletToSynthesis = findInfluencePath('emilie-du-chatelet', 'newtonian-leibnizian-synthesis', edgesData as any);
    expect(chateletToSynthesis.found).toBe(true);

    const chateletToKant = findInfluencePath('emilie-du-chatelet', 'immanuel-kant', edgesData as any);
    expect(chateletToKant.found).toBe(true);

    // Indigenous American & First Nations Philosophy lineages
    // 1. Nezahualcoyotl -> flower-and-song-neltiliztli & Sor Juana / Anzaldúa
    const nezaToFlower = findInfluencePath('nezahualcoyotl', 'flower-and-song-neltiliztli', edgesData as any);
    expect(nezaToFlower.found).toBe(true);

    const nezaToSorJuana = findInfluencePath('nezahualcoyotl', 'sor-juana', edgesData as any);
    expect(nezaToSorJuana.found).toBe(true);

    const nezaToAnzaldua = findInfluencePath('nezahualcoyotl', 'gloria-anzaldua', edgesData as any);
    expect(nezaToAnzaldua.found).toBe(true);

    // 2. Guaman Poma -> pachakuti-ayni & Dussel / Quijano
    const pomaToPachakuti = findInfluencePath('felipe-guaman-poma', 'pachakuti-ayni', edgesData as any);
    expect(pomaToPachakuti.found).toBe(true);

    const pomaToDussel = findInfluencePath('felipe-guaman-poma', 'enrique-dussel', edgesData as any);
    expect(pomaToDussel.found).toBe(true);

    const pomaToQuijano = findInfluencePath('felipe-guaman-poma', 'anibal-quijano', edgesData as any);
    expect(pomaToQuijano.found).toBe(true);

    // 3. Plato -> Inca Garcilaso -> incan-neoplatonic-cosmology & Dussel
    const platoToGarcilaso = findInfluencePath('plato', 'inca-garcilaso-de-la-vega', edgesData as any);
    expect(platoToGarcilaso.found).toBe(true);

    const garcilasoToCosmology = findInfluencePath('inca-garcilaso-de-la-vega', 'incan-neoplatonic-cosmology', edgesData as any);
    expect(garcilasoToCosmology.found).toBe(true);

    const garcilasoToDussel = findInfluencePath('inca-garcilaso-de-la-vega', 'enrique-dussel', edgesData as any);
    expect(garcilasoToDussel.found).toBe(true);

    // 4. William James / Du Bois -> Vine Deloria Jr. -> indigenous-spatial-metaphysics & Kimmerer
    const jamesToDeloria = findInfluencePath('william-james', 'vine-deloria-jr', edgesData as any);
    expect(jamesToDeloria.found).toBe(true);

    const duBoisToDeloria = findInfluencePath('w-e-b-du-bois', 'vine-deloria-jr', edgesData as any);
    expect(duBoisToDeloria.found).toBe(true);

    const deloriaToSpatial = findInfluencePath('vine-deloria-jr', 'indigenous-spatial-metaphysics', edgesData as any);
    expect(deloriaToSpatial.found).toBe(true);

    const deloriaToKimmerer = findInfluencePath('vine-deloria-jr', 'robin-wall-kimmerer', edgesData as any);
    expect(deloriaToKimmerer.found).toBe(true);

    // 5. Deloria / Fanon -> Robin Wall Kimmerer -> grammar-of-animacy & C. Thi Nguyen
    const fanonToKimmerer = findInfluencePath('frantz-fanon', 'robin-wall-kimmerer', edgesData as any);
    expect(fanonToKimmerer.found).toBe(true);

    const kimmererToAnimacy = findInfluencePath('robin-wall-kimmerer', 'grammar-of-animacy', edgesData as any);
    expect(kimmererToAnimacy.found).toBe(true);

    const kimmererToNguyen = findInfluencePath('robin-wall-kimmerer', 'c-thi-nguyen', edgesData as any);
    expect(kimmererToNguyen.found).toBe(true);
  });

  it('verifies visual graph generation and node details retrieval', () => {
    const { nodes, links } = getVisualGraph();
    expect(nodes.length).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);

    const kantDetails = getNodeDetails('immanuel-kant');
    expect(kantDetails.node).toBeDefined();
    expect((kantDetails.node as any)?.name).toBe('Immanuel Kant');
    expect(kantDetails.predecessors.length).toBeGreaterThan(0);
    expect(kantDetails.successors.length).toBeGreaterThan(0);
    expect(kantDetails.media.length).toBeGreaterThan(0);

    const smithDetails = getNodeDetails('adam-smith');
    expect(smithDetails.node).toBeDefined();
    expect((smithDetails.node as any)?.name).toBe('Adam Smith');
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

  it('validates that living philosophers do not have a deathYear set', () => {
    const livingIds = ['byung-chul-han', 'alenka-zupancic', 'nick-bostrom', 'jurgen-habermas'];
    for (const id of livingIds) {
      const phil = philosophersData.find((p) => p.id === id);
      expect(phil, `Living philosopher ${id} should exist in dataset`).toBeDefined();
      expect(phil?.deathYear, `Living philosopher ${id} must not have a deathYear marked`).toBeUndefined();
    }
  });

  it('correctly includes living philosophers when filtering graph by minYear', () => {
    // When minYear is 2000, deceased thinkers who died before 2000 are excluded,
    // but living thinkers (Habermas, Han, etc.) should not be filtered out
    const { nodes } = getVisualGraph({ minYear: 2000, includeConcepts: false });
    const nodeIds = new Set(nodes.map((n) => n.id));

    expect(nodeIds.has('jurgen-habermas')).toBe(true);
    expect(nodeIds.has('byung-chul-han')).toBe(true);
    expect(nodeIds.has('alenka-zupancic')).toBe(true);
    expect(nodeIds.has('nick-bostrom')).toBe(true);
    expect(nodeIds.has('michel-foucault')).toBe(false); // died 1984
  });

  it('validates multi-domain assignments and interdisciplinary bridge figures', () => {
    const validDomains = new Set(['philosophy', 'psychology', 'sociology']);
    
    // Every philosopher/thinker has valid domain(s)
    for (const p of philosophersData) {
      const domains = p.domains || ['philosophy'];
      expect(domains.length).toBeGreaterThan(0);
      for (const d of domains) {
        expect(validDomains.has(d), `Thinker ${p.id} has invalid domain ${d}`).toBe(true);
      }
    }

    // William James is both Philosophy and Psychology
    const james = philosophersData.find((p) => p.id === 'william-james');
    expect(james?.domains).toContain('philosophy');
    expect(james?.domains).toContain('psychology');

    // Karl Marx is both Philosophy and Sociology
    const marx = philosophersData.find((p) => p.id === 'karl-marx');
    expect(marx?.domains).toContain('philosophy');
    expect(marx?.domains).toContain('sociology');

    // Michel Foucault bridges Philosophy, Psychology, and Sociology
    const foucault = philosophersData.find((p) => p.id === 'michel-foucault');
    expect(foucault?.domains).toContain('philosophy');
    expect(foucault?.domains).toContain('psychology');
    expect(foucault?.domains).toContain('sociology');

    // Test domain filtering in getVisualGraph
    const psychGraph = getVisualGraph({ domainId: 'psychology', includeConcepts: false });
    const psychIds = new Set(psychGraph.nodes.map((n) => n.id));
    expect(psychIds.has('sigmund-freud')).toBe(true);
    expect(psychIds.has('b-f-skinner')).toBe(true);
    expect(psychIds.has('william-james')).toBe(true);
    expect(psychIds.has('thales')).toBe(false);

    const socGraph = getVisualGraph({ domainId: 'sociology', includeConcepts: false });
    const socIds = new Set(socGraph.nodes.map((n) => n.id));
    expect(socIds.has('emile-durkheim')).toBe(true);
    expect(socIds.has('max-weber')).toBe(true);
    expect(socIds.has('karl-marx')).toBe(true);
    expect(socIds.has('b-f-skinner')).toBe(false);

    // Test interdisciplinary filter
    const interdisciplinaryGraph = getVisualGraph({ interdisciplinaryOnly: true, includeConcepts: false });
    const interIds = new Set(interdisciplinaryGraph.nodes.map((n) => n.id));
    expect(interIds.has('william-james')).toBe(true);
    expect(interIds.has('karl-marx')).toBe(true);
    expect(interIds.has('michel-foucault')).toBe(true);
    expect(interIds.has('sigmund-freud')).toBe(false); // Psychology only
  });

  it('verifies critical cross-disciplinary pathfinding lineages between philosophy, psychology, and sociology', () => {
    // 1. Philosophy -> Psychology: Plato -> Schopenhauer -> Freud
    const platoToFreud = findInfluencePath('plato', 'sigmund-freud', edgesData as any);
    expect(platoToFreud.found).toBe(true);
    expect(platoToFreud.nodes).toContain('plato');
    expect(platoToFreud.nodes).toContain('sigmund-freud');

    // 2. Philosophy -> Psychology: Descartes -> Pavlov -> Skinner
    const descToSkinner = findInfluencePath('rene-descartes', 'b-f-skinner', edgesData as any);
    expect(descToSkinner.found).toBe(true);
    expect(descToSkinner.nodes[0]).toBe('rene-descartes');
    expect(descToSkinner.nodes[descToSkinner.nodes.length - 1]).toBe('b-f-skinner');

    // 3. Philosophy -> Sociology: Aristotle -> Rousseau -> Comte -> Durkheim
    const aristotleToDurkheim = findInfluencePath('aristotle', 'emile-durkheim', edgesData as any);
    expect(aristotleToDurkheim.found).toBe(true);
    expect(aristotleToDurkheim.nodes).toContain('aristotle');
    expect(aristotleToDurkheim.nodes).toContain('emile-durkheim');

    // 4. Philosophy -> Psychology: Kant -> Piaget
    const kantToPiaget = findInfluencePath('immanuel-kant', 'jean-piaget', edgesData as any);
    expect(kantToPiaget.found).toBe(true);
    expect(kantToPiaget.nodes).toContain('immanuel-kant');
    expect(kantToPiaget.nodes).toContain('jean-piaget');

    // 5. Philosophy -> Sociology: Hegel -> Marx -> Weber -> Bourdieu
    const hegelToBourdieu = findInfluencePath('gwf-hegel', 'pierre-bourdieu', edgesData as any);
    expect(hegelToBourdieu.found).toBe(true);
    expect(hegelToBourdieu.nodes).toContain('gwf-hegel');
    expect(hegelToBourdieu.nodes).toContain('karl-marx');
    expect(hegelToBourdieu.nodes).toContain('pierre-bourdieu');
  });
});
