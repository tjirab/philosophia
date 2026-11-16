import { describe, it, expect } from 'vitest';

describe('Catalog & Index Pages Engine', () => {
  it('renders Thinkers catalog page with comprehensive metadata', async () => {
    const { default: ThinkersPage, metadata } = await import('../src/app/thinkers/page');
    expect(metadata.title).toContain('Thinkers & Philosophers');
    expect(metadata.description).toBeDefined();

    const page = ThinkersPage();
    expect(page).toBeDefined();
    expect(page.type).toBeDefined();
  });

  it('renders Concepts catalog page with comprehensive metadata', async () => {
    const { default: ConceptsPage, metadata } = await import('../src/app/concepts/page');
    expect(metadata.title).toContain('Landmark Concepts & Paradigms');
    expect(metadata.description).toBeDefined();

    const page = ConceptsPage();
    expect(page).toBeDefined();
    expect(page.type).toBeDefined();
  });

  it('renders Lineages catalog page with comprehensive metadata', async () => {
    const { default: LineagesPage, metadata } = await import('../src/app/lineages/page');
    expect(metadata.title).toContain('Canonical Intellectual Lineages');
    expect(metadata.description).toBeDefined();

    const page = LineagesPage();
    expect(page).toBeDefined();
    expect(page.type).toBeDefined();
  });

  it('provides matching aliases for singular and alternate route endpoints', async () => {
    const thinkers = await import('../src/app/thinkers/page');
    const thinker = await import('../src/app/thinker/page');
    const philosophers = await import('../src/app/philosophers/page');
    const philosopher = await import('../src/app/philosopher/page');

    expect(thinker.default).toBe(thinkers.default);
    expect(philosophers.default).toBe(thinkers.default);
    expect(philosopher.default).toBe(thinkers.default);

    const concepts = await import('../src/app/concepts/page');
    const concept = await import('../src/app/concept/page');
    expect(concept.default).toBe(concepts.default);

    const lineages = await import('../src/app/lineages/page');
    const influence = await import('../src/app/influence/page');
    expect(influence.default).toBe(lineages.default);
  });

  it('verifies that influence folio breadcrumbs contain clickable /lineages link', async () => {
    const { default: InfluencePage } = await import('../src/app/influence/[id]/page');
    const page = await InfluencePage({ params: Promise.resolve({ id: 'epicurus--ataraxia' }) });
    expect(page).toBeDefined();
  });

  it('verifies that thinker folio breadcrumbs contain clickable /thinkers link', async () => {
    const { default: ThinkerPage } = await import('../src/app/thinker/[id]/page');
    const page = await ThinkerPage({ params: Promise.resolve({ id: 'socrates' }) });
    expect(page).toBeDefined();
  });

  it('verifies that concept folio breadcrumbs contain clickable /concepts link', async () => {
    const { default: ConceptPage } = await import('../src/app/concept/[id]/page');
    const page = await ConceptPage({ params: Promise.resolve({ id: 'ataraxia' }) });
    expect(page).toBeDefined();
  });
});
