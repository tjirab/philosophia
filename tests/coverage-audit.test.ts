import { describe, it, expect } from 'vitest';
import { auditCanon, generateMarkdownReport } from '../scripts/audit-coverage.mjs';

describe('Philosophia Canon Coverage & Audit Engine', () => {
  const report = auditCanon();

  it('audits total inventory and confirms nodes & edges presence', () => {
    expect(report.totals.philosophers).toBeGreaterThan(70);
    expect(report.totals.concepts).toBeGreaterThan(50);
    expect(report.totals.totalNodes).toBe(report.totals.philosophers + report.totals.concepts);
    expect(report.totals.edges).toBeGreaterThan(200);
    expect(parseFloat(report.totals.meanDegree)).toBeGreaterThan(1.5);
  });

  it('confirms zero isolated nodes and single unified connected component', () => {
    expect(report.topology.isolatedTotal).toBe(0);
    expect(report.topology.isolatedPhilosophers).toHaveLength(0);
    expect(report.topology.isolatedConcepts).toHaveLength(0);
    expect(report.topology.danglingEdgesCount).toBe(0);
    expect(report.topology.connectedComponentsCount).toBe(1);
  });

  it('verifies 100% coverage for SEP slugs and Central Inquiries', () => {
    expect(parseFloat(report.completeness.sepCoveragePct)).toBe(100.0);
    expect(report.completeness.missingSep).toHaveLength(0);
    expect(parseFloat(report.completeness.questionCoveragePct)).toBe(100.0);
    expect(report.completeness.missingQuestion).toHaveLength(0);
    expect(parseFloat(report.completeness.portraitCoveragePct)).toBe(100.0);
  });

  it('verifies key works quality and spread', () => {
    expect(report.completeness.totalWorksCount).toBeGreaterThan(150);
    expect(parseFloat(report.completeness.structuredWorksPct)).toBe(100.0);
    expect(parseFloat(report.completeness.worksWithUrlPct)).toBeGreaterThan(95.0);
    expect(report.completeness.worksDistribution[0]).toBe(0);
  });

  it('verifies all critical dialectical lineages resolve without breaks', () => {
    expect(report.lineages.length).toBeGreaterThanOrEqual(10);
    for (const lineage of report.lineages) {
      expect(lineage.found, `Lineage ${lineage.name} failed to resolve`).toBe(true);
      expect(lineage.hops).toBeGreaterThan(0);
      expect(lineage.path[0]).toBe(lineage.from);
      expect(lineage.path[lineage.path.length - 1]).toBe(lineage.to);
    }
  });

  it('generates a valid, complete markdown assessment report', () => {
    const md = generateMarkdownReport(report);
    expect(md).toContain('# 📜 Philosophia Canon Coverage & Assessment Report');
    expect(md).toContain('1. Canon Inventory & High-Level Metrics');
    expect(md).toContain('2. Content Completeness & Richness');
    expect(md).toContain('3. Temporal Era Distribution');
    expect(md).toContain('4. Critical Dialectical Lineage Verification');
    expect(md).toContain('5. Network Hubs & Centrality');
    expect(md).toContain('✅ Verified');
  });
});
