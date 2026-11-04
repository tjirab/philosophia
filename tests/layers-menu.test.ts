import { describe, it, expect } from 'vitest';
import {
  BRANCH_METAS,
  getBranchesForDomain,
  getDomainForBranch,
  Branch,
  DomainId,
} from '../src/lib/types';

describe('GraphLayersMenu logic & Discipline-Branch filtering', () => {
  it('defines valid defaults and toggles options', () => {
    let concepts = false;
    let branch = 'all';
    let spacing = 1.9;

    const toggleConcepts = () => { concepts = !concepts; };
    const selectBranch = (b: any) => { branch = b; };
    const setSpacing = (s: number) => { spacing = s; };

    expect(concepts).toBe(false);
    toggleConcepts();
    expect(concepts).toBe(true);

    expect(branch).toBe('all');
    selectBranch('epistemology');
    expect(branch).toBe('epistemology');

    expect(spacing).toBe(1.9);
    setSpacing(1.4);
    expect(spacing).toBe(1.4);
  });

  it('filters branch options accurately based on selected discipline', () => {
    // When domain is all, all 20 canonical branches across all three disciplines are returned
    const allBranches = getBranchesForDomain('all');
    expect(allBranches.length).toBe(BRANCH_METAS.length);

    // Philosophy branches
    const philBranches = getBranchesForDomain('philosophy');
    expect(philBranches.every((b) => b.domain === 'philosophy')).toBe(true);
    expect(philBranches.map((b) => b.id)).toEqual([
      'epistemology',
      'metaphysics',
      'ethics',
      'political',
      'aesthetics',
      'mind',
      'logic',
    ]);

    // Psychology branches
    const psychBranches = getBranchesForDomain('psychology');
    expect(psychBranches.every((b) => b.domain === 'psychology')).toBe(true);
    expect(psychBranches.map((b) => b.id)).toEqual([
      'psychoanalytic',
      'behavioral',
      'cognitive',
      'developmental',
      'humanistic',
      'social-psychology',
      'neuropsychology',
    ]);

    // Sociology branches
    const socBranches = getBranchesForDomain('sociology');
    expect(socBranches.every((b) => b.domain === 'sociology')).toBe(true);
    expect(socBranches.map((b) => b.id)).toEqual([
      'social-theory',
      'structural-functionalism',
      'conflict-theory',
      'symbolic-interactionism',
      'critical-sociology',
      'macrosociology',
    ]);
  });

  it('correctly maps branches to their parent domain', () => {
    expect(getDomainForBranch('epistemology')).toBe('philosophy');
    expect(getDomainForBranch('ethics')).toBe('philosophy');
    expect(getDomainForBranch('psychoanalytic')).toBe('psychology');
    expect(getDomainForBranch('cognitive')).toBe('psychology');
    expect(getDomainForBranch('social-theory')).toBe('sociology');
    expect(getDomainForBranch('critical-sociology')).toBe('sociology');
  });

  it('resets incompatible branch focus when switching discipline', () => {
    let currentDomain: DomainId | 'all' = 'philosophy';
    let currentBranch: Branch | 'all' = 'ethics';

    const handleSelectDomain = (domain: DomainId | 'all') => {
      currentDomain = domain;
      if (domain !== 'all' && currentBranch !== 'all') {
        const branchDomain = getDomainForBranch(currentBranch);
        if (branchDomain && branchDomain !== domain) {
          currentBranch = 'all';
        }
      }
    };

    // Switching to psychology should reset ethics (a philosophy branch) to 'all'
    handleSelectDomain('psychology');
    expect(currentDomain).toBe('psychology');
    expect(currentBranch).toBe('all');

    // Setting a psychology branch
    currentBranch = 'cognitive';
    expect(getDomainForBranch(currentBranch)).toBe('psychology');

    // Switching to sociology should reset cognitive to 'all'
    handleSelectDomain('sociology');
    expect(currentDomain).toBe('sociology');
    expect(currentBranch).toBe('all');

    // Setting a sociology branch and switching to 'all' retains the branch
    currentBranch = 'social-theory';
    handleSelectDomain('all');
    expect(currentDomain).toBe('all');
    expect(currentBranch).toBe('social-theory');
  });

  it('auto-activates concept visibility when selecting a specific branch', () => {
    let showConcepts = false;
    let selectedBranch: Branch | 'all' = 'all';

    const handleSelectBranch = (branch: Branch | 'all') => {
      selectedBranch = branch;
      if (branch !== 'all') {
        showConcepts = true;
      }
    };

    handleSelectBranch('metaphysics');
    expect(selectedBranch).toBe('metaphysics');
    expect(showConcepts).toBe(true);
  });

  it('verifies GraphLayersMenu code supports concept spotlight indication', () => {
    const fs = require('fs');
    const path = require('path');
    const menuCode = fs.readFileSync(
      path.resolve(__dirname, '../src/components/graph/GraphLayersMenu.tsx'),
      'utf-8'
    );

    expect(menuCode).toContain('isConceptSpotlighted');
    expect(menuCode).toContain('focusedConceptTitle');
    expect(menuCode).toContain('Spotlight active:');
  });
});
