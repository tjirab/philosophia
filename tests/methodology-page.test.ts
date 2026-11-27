import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Scoring Methodology & Mathematical Formulas Page', () => {
  it('renders /methodology page with complete metadata and live benchmark data', async () => {
    const { default: MethodologyPage, metadata } = await import('../src/app/methodology/page');
    expect(metadata.title).toContain('Scoring Methodology & Mathematical Formulas');
    expect(metadata.description).toBeDefined();

    const element = MethodologyPage();
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
  });

  it('passes graph edges and concepts from ThinkersPage into ThinkersCatalogView for live scoring', async () => {
    const { default: ThinkersPage } = await import('../src/app/thinkers/page');
    const page = ThinkersPage() as any;
    expect(page.props.initialThinkers.length).toBeGreaterThan(100);
    expect(page.props.edges.length).toBeGreaterThan(200);
    expect(page.props.concepts.length).toBeGreaterThan(50);
  });

  it('links /methodology from ThinkersCatalogView, ExplorationHud, DossierDrawer, and ThinkerPage', () => {
    const root = path.resolve(__dirname, '..');
    const thinkersView = fs.readFileSync(
      path.join(root, 'src/components/catalog/ThinkersCatalogView.tsx'),
      'utf-8'
    );
    const hud = fs.readFileSync(
      path.join(root, 'src/components/exploration/ExplorationHud.tsx'),
      'utf-8'
    );
    const drawer = fs.readFileSync(
      path.join(root, 'src/components/drawer/DossierDrawer.tsx'),
      'utf-8'
    );
    const thinkerPage = fs.readFileSync(
      path.join(root, 'src/app/thinker/[id]/page.tsx'),
      'utf-8'
    );

    expect(thinkersView).toContain('/methodology');
    expect(thinkersView).toContain('applyScoringMethodology');
    expect(thinkersView).toContain('compareByDeterministicRank');
    expect(hud).toContain('/methodology');
    expect(drawer).toContain('/methodology');
    expect(thinkerPage).toContain('/methodology');
  });
});
