'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  GitFork,
  Search,
  HelpCircle,
  GitPullRequest,
} from 'lucide-react';
import {
  eras,
  traditions,
  philosophers,
  concepts,
  edges,
  media,
  getVisualGraph,
} from '../lib/graph/graph-service';
import { Branch, EraId } from '../lib/types';
import { ForceGraphView } from '../components/graph/ForceGraphView';
import { DossierDrawer } from '../components/drawer/DossierDrawer';
import { LineagePathModal } from '../components/pathfinding/LineagePathModal';
import { SearchPalette } from '../components/search/SearchPalette';
import { GraphLegendModal } from '../components/legend/GraphLegendModal';
import { AppearanceSettingsMenu } from '../components/settings/AppearanceSettingsModal';
import { SuggestionModal } from '../components/submission/SuggestionModal';

export default function HomePage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEraId, setSelectedEraId] = useState<string>('all');
  const [isolateEra, setIsolateEra] = useState<boolean>(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'all'>('all');
  const [showConcepts, setShowConcepts] = useState<boolean>(false);
  const [highlightedPathNodes, setHighlightedPathNodes] = useState<string[]>([]);

  // Modals state
  const [isPathModalOpen, setIsPathModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState<boolean>(false);
  const [suggestionTargetId, setSuggestionTargetId] = useState<string | null>(null);
  const [pathStartId, setPathStartId] = useState<string>('plato');

  // Keyboard shortcut listener for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsPathModalOpen(false);
        setIsLegendOpen(false);
        setIsSuggestionOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute visual graph based on current filters
  const { nodes, links } = useMemo(() => {
    let eraIdFilter: EraId | 'all' = 'all';
    let maxYearFilter: number | undefined = undefined;

    if (selectedEraId !== 'all') {
      const eraObj = eras.find((e) => e.id === selectedEraId);
      if (isolateEra) {
        eraIdFilter = selectedEraId as EraId;
      } else if (eraObj) {
        maxYearFilter = eraObj.endYear;
      }
    }

    return getVisualGraph({
      maxYear: maxYearFilter,
      eraId: eraIdFilter,
      branch: selectedBranch,
      includeConcepts: showConcepts,
    });
  }, [selectedEraId, isolateEra, selectedBranch, showConcepts]);

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleOpenPathModal = useCallback((startId?: string) => {
    if (startId) setPathStartId(startId);
    setIsPathModalOpen(true);
  }, []);

  const handleOpenSuggestion = useCallback((targetId?: string | null) => {
    setSuggestionTargetId(targetId || selectedNodeId || null);
    setIsSuggestionOpen(true);
  }, [selectedNodeId]);

  const handleHighlightPath = useCallback((pathNodes: string[]) => {
    setHighlightedPathNodes(pathNodes);
    if (pathNodes.length > 0) {
      setSelectedNodeId(pathNodes[0]);
    }
  }, []);

  const handleClearPath = useCallback(() => {
    setHighlightedPathNodes([]);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] font-serif">
      {/* Top Classical Navigation Bar */}
      <header className="absolute top-0 inset-x-0 z-30 h-16 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-main)] px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Logo & Classical Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-main)] flex items-center justify-center text-[var(--gold-accent)] shadow-sm">
            <Compass className="w-4 h-4 text-[var(--gold-accent)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-wider text-[var(--text-main)]">
                PHILOSOPHIA
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--gold-accent)] border border-[var(--border-main)]">
                Lineage of Ideas
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-dim)] hidden sm:block">
              Mapping intellectual influence from Antiquity to Modernity
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Appearance & Font Settings */}
          <AppearanceSettingsMenu />

          {/* Folio Key / Legend */}
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-[var(--border-strong)] rounded-xl text-xs transition font-serif"
            title="Folio Key (Colors, Nodes & Relations)"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
            <span className="hidden sm:inline">Folio Key</span>
          </button>

          {/* Contribute / Suggest Content */}
          <button
            onClick={() => handleOpenSuggestion(selectedNodeId)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-[var(--border-strong)] rounded-xl text-xs transition font-serif"
            title="Suggest an edit, book citation, or podcast link via GitHub"
          >
            <GitPullRequest className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
            <span>Contribute</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl text-xs transition"
          >
            <Search className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
            <span className="hidden md:inline">Search Folio</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono bg-[var(--bg-card)] px-1.5 py-0.5 rounded text-[var(--text-dim)] border border-[var(--border-main)]">
              ⌘K
            </kbd>
          </button>

          {/* Trace Lineage Path Button */}
          <button
            onClick={() => handleOpenPathModal(selectedNodeId || 'plato')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <GitFork className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
            <span>Trace Lineage</span>
          </button>
        </div>
      </header>

      {/* Main Graph Viewport */}
      <main className="flex-1 w-full h-full relative pt-16">
        <ForceGraphView
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          highlightedPathNodes={highlightedPathNodes}
          onClearPath={handleClearPath}
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          showConcepts={showConcepts}
          onToggleConcepts={() => setShowConcepts(!showConcepts)}
          onOpenLegend={() => setIsLegendOpen(true)}
          eras={eras}
          selectedEraId={selectedEraId}
          onSelectEra={setSelectedEraId}
          isolateEra={isolateEra}
          onToggleIsolateEra={setIsolateEra}
        />
      </main>

      {/* Slide-out Dossier Drawer */}
      <DossierDrawer
        selectedNodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={handleSelectNode}
        onTracePath={handleOpenPathModal}
        onOpenSuggestion={handleOpenSuggestion}
      />

      {/* Lineage Pathfinding Modal */}
      <LineagePathModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        philosophers={philosophers}
        edges={edges}
        initialStartId={pathStartId}
        onHighlightPath={handleHighlightPath}
      />

      {/* Search Palette */}
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        philosophers={philosophers}
        concepts={concepts}
        onSelectNode={handleSelectNode}
      />

      {/* Folio Key / Legend Modal */}
      <GraphLegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {/* Suggestion / Contribution Modal */}
      <SuggestionModal
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
        philosophers={philosophers}
        concepts={concepts}
        initialTargetNodeId={suggestionTargetId}
      />
    </div>
  );
}
