import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Responsive Navigation & Dossier Drawer Architecture', () => {
  const dossierDrawerCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/drawer/DossierDrawer.tsx'),
    'utf-8'
  );

  const mainPageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/page.tsx'),
    'utf-8'
  );

  const thinkerPageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/thinker/[id]/page.tsx'),
    'utf-8'
  );

  const conceptPageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/concept/[id]/page.tsx'),
    'utf-8'
  );

  const influencePageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/influence/[id]/page.tsx'),
    'utf-8'
  );

  it('guarantees DossierDrawer does not use absolute positioning for expand and close buttons over content', () => {
    // Buttons must be in normal document flow inside a flex utility bar to prevent overlapping labels
    expect(dossierDrawerCode).not.toContain('absolute top-5 right-5');
    expect(dossierDrawerCode).toContain('flex items-center justify-between gap-3 mb-3');
    expect(dossierDrawerCode).toContain('flex items-center gap-1 shrink-0');
    expect(dossierDrawerCode).toContain('Expand Page');
  });

  it('verifies main page navigation bar responsively handles limited screen widths', () => {
    // The large 5-button disciplinary domain switcher must not crowd out header at lg widths
    expect(mainPageCode).toContain('hidden xl:flex items-center gap-1 p-1');
    expect(mainPageCode).not.toContain('hidden lg:flex items-center gap-1 p-1');

    // Subtitle must only appear when ample width exists
    expect(mainPageCode).toContain('hidden xl:block truncate');

    // Primary action buttons must support compact icon-only presentation on limited width
    expect(mainPageCode).toContain('<span className="hidden sm:inline">Trace Lineage</span>');
    expect(mainPageCode).toContain('<span className="hidden md:inline">Folio Key</span>');
    expect(mainPageCode).toContain('<span className="hidden sm:inline">Search</span>');
  });

  it('verifies folio pages adapt back-navigation and locate actions for narrow mobile viewports', () => {
    for (const [name, code] of [
      ['thinker', thinkerPageCode],
      ['concept', conceptPageCode],
      ['influence', influencePageCode],
    ]) {
      expect(code, `${name} page should adapt return link for mobile`).toContain('Return to Constellation Graph');
      expect(code, `${name} page should include compact constellation label for mobile`).toContain('Constellation');
      expect(code, `${name} page should adapt locate button label for mobile`).toContain('Locate in Graph');
      expect(code, `${name} page should include compact locate label for mobile`).toContain('Locate');
    }
  });
});
