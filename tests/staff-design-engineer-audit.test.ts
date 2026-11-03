import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Staff Design Engineer Audit & UX Verification', () => {
  const globalsCss = fs.readFileSync(
    path.resolve(__dirname, '../src/app/globals.css'),
    'utf-8'
  );
  const layoutCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/layout.tsx'),
    'utf-8'
  );
  const pageCode = fs.readFileSync(
    path.resolve(__dirname, '../src/app/page.tsx'),
    'utf-8'
  );
  const forceGraphCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/graph/ForceGraphView.tsx'),
    'utf-8'
  );
  const audioPlayerCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/audio/AudioPlayer.tsx'),
    'utf-8'
  );
  const globalAudioPlayerCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/audio/GlobalAudioPlayer.tsx'),
    'utf-8'
  );
  const dossierDrawerCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/drawer/DossierDrawer.tsx'),
    'utf-8'
  );
  const edgeDossierDrawerCode = fs.readFileSync(
    path.resolve(__dirname, '../src/components/drawer/EdgeDossierDrawer.tsx'),
    'utf-8'
  );

  describe('1. Visual Tokens, WCAG AA Contrast & Font Hygiene', () => {
    it('purges redundant font @import to prevent duplicate downloads and render-blocking CSS', () => {
      expect(globalsCss).not.toContain('@import url(\'https://fonts.googleapis.com');
      expect(globalsCss).not.toContain('Cinzel:wght');
      expect(layoutCode).toContain('next/font/google');
    });

    it('enforces WCAG AA compliant contrast ratios in light (parchment) mode', () => {
      // Light theme --text-dim must be #655441 (5.8:1 contrast against #f7f3ea)
      expect(globalsCss).toContain('--text-dim: #655441;');
      // Light theme --gold-accent must be #875d0e (5.1:1 contrast against #f7f3ea)
      expect(globalsCss).toContain('--gold-accent: #875d0e;');
      expect(globalsCss).not.toContain('--text-dim: #847460;');
      expect(globalsCss).not.toContain('--gold-accent: #9a6f14;');
    });

    it('eliminates hardcoded dark mode hex codes in audio player in favor of semantic CSS variables', () => {
      expect(audioPlayerCode).not.toContain('bg-[#1a1714]');
      expect(audioPlayerCode).not.toContain('border-[#2a241e]');
      expect(audioPlayerCode).not.toContain('text-[#f4efe6]');
      expect(audioPlayerCode).not.toContain('bg-[#25201a]');
      expect(audioPlayerCode).toContain('var(--bg-card)');
      expect(audioPlayerCode).toContain('var(--gold-accent)');
      expect(audioPlayerCode).toContain('var(--border-main)');
    });
  });

  describe('2. Audio Architecture & Persistent Media Flow', () => {
    it('wraps root layout with AudioProvider for cross-navigation playback persistence', () => {
      expect(layoutCode).toContain('AudioProvider');
      expect(layoutCode).toContain('<AudioProvider>{children}</AudioProvider>');
    });

    it('mounts GlobalAudioPlayer and screen reader live announcements on main canvas page', () => {
      expect(pageCode).toContain('GlobalAudioPlayer');
      expect(pageCode).toContain('<GlobalAudioPlayer onSelectNode={handleSelectNode} />');
      expect(pageCode).toContain('aria-live="polite"');
      expect(pageCode).toContain('sr-only');
    });

    it('implements GlobalAudioPlayer with full transport controls and thinker centering', () => {
      expect(globalAudioPlayerCode).toContain('role="region"');
      expect(globalAudioPlayerCode).toContain('aria-label="Philosophia Audio Player"');
      expect(globalAudioPlayerCode).toContain('onSelectNode');
      expect(globalAudioPlayerCode).toContain('cyclePlaybackRate');
      expect(globalAudioPlayerCode).toContain('toggleMute');
    });
  });

  describe('3. Viewport-Aware Camera Framing & Vestibular Motion Ergonomics', () => {
    it('applies horizontal offset framing to prevent node and edge occlusion by the slide-out drawer', () => {
      expect(forceGraphCode).toContain('drawerWidth');
      expect(forceGraphCode).toContain('offsetX = (drawerWidth / 2) / targetZoom');
      expect(forceGraphCode).toContain('fgRef.current.centerAt(node.x + offsetX, node.y');
      expect(forceGraphCode).toContain('fgRef.current.centerAt(midX + offsetX, midY');
    });

    it('honors prefers-reduced-motion media query by reducing camera transition duration to 0ms', () => {
      expect(forceGraphCode).toContain('prefers-reduced-motion');
      expect(forceGraphCode).toContain('prefersReducedMotion ? 0 : 800');
      expect(forceGraphCode).toContain('prefersReducedMotion ? 0 : 700');
    });

    it('implements 16px invisible pointer area buffer for effortless edge clicking', () => {
      expect(forceGraphCode).toContain('linkPointerAreaPaint');
      expect(forceGraphCode).toContain('ctx.lineWidth = 16;');
      expect(forceGraphCode).toContain('ctx.quadraticCurveTo');
    });

    it('staggers portrait preloading to prevent 140+ concurrent network requests on mount', () => {
      expect(forceGraphCode).toContain('importanceScore >= 85');
      expect(forceGraphCode).toContain('loadNextBatch');
    });
  });

  describe('4. Mobile Ergonomics & Dialog Accessibility', () => {
    it('provisions mobile tactile dismiss handles on both thinker and edge dossiers', () => {
      expect(dossierDrawerCode).toContain('aria-label="Dismiss Dossier"');
      expect(dossierDrawerCode).toContain('w-12 h-1.5 bg-[var(--border-strong)] rounded-full');
      expect(edgeDossierDrawerCode).toContain('aria-label="Dismiss Drawer"');
      expect(edgeDossierDrawerCode).toContain('w-12 h-1.5 bg-[var(--border-strong)] rounded-full');
    });

    it('enforces min-44px touch targets on drawer close buttons for mobile accessibility', () => {
      expect(dossierDrawerCode).toContain('min-w-[44px] min-h-[44px]');
      expect(edgeDossierDrawerCode).toContain('min-w-[44px] min-h-[44px]');
    });

    it('tags both drawers with accessible dialog semantics and aria-modal attributes', () => {
      expect(dossierDrawerCode).toContain('role="dialog"');
      expect(dossierDrawerCode).toContain('aria-modal="true"');
      expect(edgeDossierDrawerCode).toContain('role="dialog"');
      expect(edgeDossierDrawerCode).toContain('aria-modal="true"');
    });
  });
});
