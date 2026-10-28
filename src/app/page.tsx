'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  GitFork,
  Search,
  HelpCircle,
  Sparkles,
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
import { EpochNavigator } from '../components/timeline/EpochNavigator';
import { DossierDrawer } from '../components/drawer/DossierDrawer';
import { LineagePathModal } from '../components/pathfinding/LineagePathModal';
import { SearchPalette } from '../components/search/SearchPalette';
import { GraphLegendModal } from '../components/legend/GraphLegendModal';

export default function HomePage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEraId, setSelectedEraId] = useState<string>('all');
  const [isolateEra, setIsolateEra] = useState<boolean>(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'all'>('all');
  const [showConcepts, setShowConcepts] = useState<boolean>(true);
  const [highlightedPathNodes, setHighlightedPathNodes] = useState<string[]>([]);

  // Modals state
  const [isPathModalOpen, setIsPathModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
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
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#0e0d0b] text-[#f4efe6] font-serif">
      {/* Top Classical Navigation Bar */}
      <header className="absolute top-0 inset-x-0 z-30 h-16 bg-[#12100d]/90 backdrop-blur-md border-b border-[#2a241e] px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Logo & Classical Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#25201a] border border-[#3d3328] flex items-center justify-center text-[#e5b94c] shadow-sm">
            <Compass className="w-4 h-4 text-[#c59b27]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-wider text-[#f5f0e6]">
                PHILOSOPHIA
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#1e1b16] text-[#c59b27] border border-[#3d3328]">
                Lineage of Ideas
              </span>
            </div>
            <div className="text-[11px] text-[#a89b88] hidden sm:block">
              Mapping intellectual influence from Antiquity to Modernity
            </div>
          </div>
        </div>

        {/* Central Epoch Navigator */}
        <div className="flex items-center">
          <EpochNavigator
            eras={eras}
            selectedEraId={selectedEraId}
            onSelectEra={setSelectedEraId}
            isolateEra={isolateEra}
            onToggleIsolateEra={setIsolateEra}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Folio Key / Legend */}
          <button
            onClick={() => setIsLegendOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1714] hover:bg-[#25201a] text-[#d8cfc0] hover:text-[#e5b94c] border border-[#2a241e] hover:border-[#3d3328] rounded-xl text-xs transition font-serif"
            title="Folio Key (Colors, Nodes & Relations)"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Folio Key</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1714] hover:bg-[#25201a] text-[#d8cfc0] border border-[#2a241e] rounded-xl text-xs transition"
          >
            <Search className="w-3.5 h-3.5 text-[#c59b27]" />
            <span className="hidden md:inline">Search Folio</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono bg-[#25201a] px-1.5 py-0.5 rounded text-[#a89b88] border border-[#3d3328]">
              ⌘K
            </kbd>
          </button>

          {/* Trace Lineage Path Button */}
          <button
            onClick={() => handleOpenPathModal(selectedNodeId || 'plato')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2a2318] hover:bg-[#352c1e] text-[#e5b94c] border border-[#4a3b25] rounded-xl text-xs font-semibold tracking-wide transition shadow-sm"
          >
            <GitFork className="w-3.5 h-3.5 text-[#c59b27]" />
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
        />
      </main>

      {/* Slide-out Dossier Drawer */}
      <DossierDrawer
        selectedNodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={handleSelectNode}
        onTracePath={handleOpenPathModal}
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
    </div>
  );
}
