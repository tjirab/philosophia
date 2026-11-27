import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  evaluateDiversity,
  VALID_GENDERS,
  VALID_CULTURAL_SPHERES,
} from '../scripts/check-diversity.mjs';

const tempDirs: string[] = [];

function createTempRepo(thinkers: Record<string, any>[], policy?: Record<string, any>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'philosophia-div-'));
  tempDirs.push(dir);
  const philDir = path.join(dir, 'data', 'philosophers');
  fs.mkdirSync(philDir, { recursive: true });
  for (const t of thinkers) {
    fs.writeFileSync(path.join(philDir, `${t.id}.json`), JSON.stringify(t, null, 2));
  }
  if (policy) {
    fs.writeFileSync(
      path.join(dir, 'data', 'diversity-policy.json'),
      JSON.stringify(policy, null, 2)
    );
  }
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('Diversity & Global Representation Pre-Commit Guardrail', () => {
  it('passes against the live repository dataset and enforces 40% / 50% targets metadata', () => {
    const report = evaluateDiversity();
    expect(report.passed).toBe(true);
    expect(report.violations).toHaveLength(0);
    expect(report.total).toBeGreaterThanOrEqual(187);
    expect(report.policy.targetWomenPct).toBe(40);
    expect(report.policy.targetNonWesternPct).toBe(50);
    expect(report.womenPct).toBeGreaterThanOrEqual(report.policy.minWomenPct);
    expect(report.nonWesternPct).toBeGreaterThanOrEqual(report.policy.minNonWesternPct);
  });

  it('rejects thinker files missing valid gender or culturalSphere metadata', () => {
    const dir = createTempRepo(
      [
        { id: 't1', gender: 'woman', culturalSphere: 'african' },
        { id: 't2', gender: 'unknown', culturalSphere: 'invalid-region' },
      ],
      {
        targetWomenPct: 40,
        targetNonWesternPct: 50,
        minWomenPct: 10,
        minNonWesternPct: 10,
        blockWesternMaleOnlyAdditionsBelowTarget: true,
      }
    );

    const report = evaluateDiversity({ rootDir: dir });
    expect(report.passed).toBe(false);
    expect(report.violations.some((v: string) => v.includes('invalid or missing gender'))).toBe(true);
    expect(
      report.violations.some((v: string) => v.includes('invalid or missing culturalSphere'))
    ).toBe(true);
  });

  it('blocks regressions below ratchet floors and Western-male-only additions while below targets', () => {
    const dir = createTempRepo(
      [
        { id: 'w1', gender: 'woman', culturalSphere: 'east-asian' },
        { id: 'm1', gender: 'man', culturalSphere: 'western' },
        { id: 'm2', gender: 'man', culturalSphere: 'western' },
        { id: 'm3', gender: 'man', culturalSphere: 'western' },
      ],
      {
        targetWomenPct: 40,
        targetNonWesternPct: 50,
        minWomenPct: 25,
        minNonWesternPct: 25,
        blockWesternMaleOnlyAdditionsBelowTarget: true,
      }
    );

    // Adding a single Western man lowers both shares (25% -> 20%) and triggers both rules
    fs.writeFileSync(
      path.join(dir, 'data', 'philosophers', 'm4.json'),
      JSON.stringify({ id: 'm4', gender: 'man', culturalSphere: 'western' })
    );

    const regressed = evaluateDiversity({
      rootDir: dir,
      stagedNewFiles: ['data/philosophers/m4.json'],
    });
    expect(regressed.passed).toBe(false);
    expect(regressed.violations.some((v: string) => v.includes('ratchet floor'))).toBe(true);
    expect(regressed.violations.some((v: string) => v.includes('Western men-only'))).toBe(true);
  });

  it('allows balanced or underrepresented additions that advance toward targets', () => {
    const dir = createTempRepo(
      [
        { id: 'w1', gender: 'woman', culturalSphere: 'african' },
        { id: 'm1', gender: 'man', culturalSphere: 'western' },
        { id: 'm2', gender: 'man', culturalSphere: 'western' },
      ],
      {
        targetWomenPct: 40,
        targetNonWesternPct: 50,
        minWomenPct: 33,
        minNonWesternPct: 33,
        blockWesternMaleOnlyAdditionsBelowTarget: true,
      }
    );

    fs.writeFileSync(
      path.join(dir, 'data', 'philosophers', 'w2.json'),
      JSON.stringify({ id: 'w2', gender: 'woman', culturalSphere: 'south-asian' })
    );

    const improved = evaluateDiversity({
      rootDir: dir,
      stagedNewFiles: ['data/philosophers/w2.json'],
    });
    expect(improved.passed).toBe(true);
    expect(improved.womenPct).toBe(50);
    expect(improved.nonWesternPct).toBe(50);
  });

  it('scopes .githooks/pre-commit strictly to staged data/philosophers/*.json or diversity-policy.json', () => {
    const hookPath = path.resolve(__dirname, '../.githooks/pre-commit');
    const hookCode = fs.readFileSync(hookPath, 'utf-8');
    expect(hookCode).toContain("git diff --cached --name-only -- 'data/philosophers/*.json' 'data/diversity-policy.json'");
    expect(hookCode).toContain('node scripts/check-diversity.mjs --staged');
    expect(VALID_GENDERS).toEqual(['woman', 'man', 'non-binary']);
    expect(VALID_CULTURAL_SPHERES).toContain('western');
    expect(VALID_CULTURAL_SPHERES).toContain('east-asian');
  });
});
