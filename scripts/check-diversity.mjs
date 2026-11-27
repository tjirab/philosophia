import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const VALID_GENDERS = ['woman', 'man', 'non-binary'];

export const VALID_CULTURAL_SPHERES = [
  'western',
  'east-asian',
  'south-asian',
  'mena',
  'african',
  'latin-american',
  'indigenous',
];

export const DEFAULT_POLICY = {
  targetWomenPct: 40,
  targetNonWesternPct: 50,
  minWomenPct: 17.6,
  minNonWesternPct: 24.0,
  blockWesternMaleOnlyAdditionsBelowTarget: true,
};

/**
 * Evaluates gender and culturalSphere representation across all modular
 * philosopher files in data/philosophers/ against data/diversity-policy.json.
 */
export function evaluateDiversity(options = {}) {
  const rootDir = options.rootDir || ROOT_DIR;
  const stagedNewFiles = options.stagedNewFiles || [];
  const philosophersDir = path.join(rootDir, 'data', 'philosophers');
  const policyPath = path.join(rootDir, 'data', 'diversity-policy.json');

  const policy = fs.existsSync(policyPath)
    ? { ...DEFAULT_POLICY, ...JSON.parse(fs.readFileSync(policyPath, 'utf-8')) }
    : DEFAULT_POLICY;

  const files = fs
    .readdirSync(philosophersDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
    .sort();

  const schemaErrors = [];
  const genderCounts = { woman: 0, man: 0, 'non-binary': 0 };
  const sphereCounts = {};
  for (const s of VALID_CULTURAL_SPHERES) sphereCounts[s] = 0;

  let nonWesternCount = 0;
  let westernCount = 0;
  const byId = new Map();

  for (const file of files) {
    const fullPath = path.join(philosophersDir, file);
    const p = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    byId.set(p.id, p);

    if (!VALID_GENDERS.includes(p.gender)) {
      schemaErrors.push(`${file}: invalid or missing gender (${p.gender})`);
    } else {
      genderCounts[p.gender]++;
    }

    if (!VALID_CULTURAL_SPHERES.includes(p.culturalSphere)) {
      schemaErrors.push(`${file}: invalid or missing culturalSphere (${p.culturalSphere})`);
    } else {
      sphereCounts[p.culturalSphere]++;
      if (p.culturalSphere === 'western') {
        westernCount++;
      } else {
        nonWesternCount++;
      }
    }
  }

  const total = files.length;
  const womenPct = total > 0 ? Number(((genderCounts.woman / total) * 100).toFixed(2)) : 0;
  const nonWesternPct = total > 0 ? Number(((nonWesternCount / total) * 100).toFixed(2)) : 0;
  const menToWomenRatio =
    genderCounts.woman > 0 ? Number((genderCounts.man / genderCounts.woman).toFixed(2)) : Infinity;

  const violations = [...schemaErrors];

  if (womenPct < policy.minWomenPct) {
    violations.push(
      `Women share (${womenPct}%) dropped below ratchet floor (${policy.minWomenPct}%, target ${policy.targetWomenPct}%).`
    );
  }
  if (nonWesternPct < policy.minNonWesternPct) {
    violations.push(
      `Non-Western share (${nonWesternPct}%) dropped below ratchet floor (${policy.minNonWesternPct}%, target ${policy.targetNonWesternPct}%).`
    );
  }

  const belowTarget =
    womenPct < policy.targetWomenPct || nonWesternPct < policy.targetNonWesternPct;

  if (
    policy.blockWesternMaleOnlyAdditionsBelowTarget &&
    belowTarget &&
    stagedNewFiles.length > 0
  ) {
    const addedThinkers = stagedNewFiles
      .map((relPath) => {
        const abs = path.isAbsolute(relPath) ? relPath : path.join(rootDir, relPath);
        if (!fs.existsSync(abs)) return null;
        return JSON.parse(fs.readFileSync(abs, 'utf-8'));
      })
      .filter(Boolean);

    if (
      addedThinkers.length > 0 &&
      addedThinkers.every((p) => p.gender === 'man' && p.culturalSphere === 'western')
    ) {
      violations.push(
        `Cannot add Western men-only thinker batch while below targets (Women ${womenPct}%/${policy.targetWomenPct}%, Non-Western ${nonWesternPct}%/${policy.targetNonWesternPct}%). Pair with underrepresented thinkers.`
      );
    }
  }

  return {
    passed: violations.length === 0,
    total,
    genderCounts,
    menToWomenRatio,
    womenPct,
    westernCount,
    nonWesternCount,
    nonWesternPct,
    sphereCounts,
    policy,
    violations,
  };
}

function getStagedThinkerChanges(rootDir) {
  try {
    const changed = execSync(
      "git diff --cached --name-only -- 'data/philosophers/*.json' 'data/diversity-policy.json'",
      { cwd: rootDir, encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    const addedPhilosophers = execSync(
      "git diff --cached --name-only --diff-filter=A -- 'data/philosophers/*.json'",
      { cwd: rootDir, encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    return { changed, addedPhilosophers };
  } catch {
    return { changed: [], addedPhilosophers: [] };
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const args = process.argv.slice(2);
  const stagedMode = args.includes('--staged');
  const jsonMode = args.includes('--json');

  let stagedNewFiles = [];
  if (stagedMode) {
    const { changed, addedPhilosophers } = getStagedThinkerChanges(ROOT_DIR);
    if (changed.length === 0) {
      process.exit(0);
    }
    stagedNewFiles = addedPhilosophers;
  }

  const report = evaluateDiversity({ rootDir: ROOT_DIR, stagedNewFiles });

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.passed ? 0 : 1);
  }

  console.log(
    `[diversity-check] Thinkers: ${report.total} | Women: ${report.genderCounts.woman} (${report.womenPct}% / target ${report.policy.targetWomenPct}%, floor ${report.policy.minWomenPct}%) | Non-Western: ${report.nonWesternCount} (${report.nonWesternPct}% / target ${report.policy.targetNonWesternPct}%, floor ${report.policy.minNonWesternPct}%) | M:W ${report.menToWomenRatio}:1`
  );

  if (!report.passed) {
    console.error('\n❌ Diversity & Schema Guardrail Failed:');
    for (const v of report.violations) {
      console.error(`   • ${v}`);
    }
    process.exit(1);
  }

  console.log('✅ Diversity & schema guardrail passed.');
}
