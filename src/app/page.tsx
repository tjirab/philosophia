'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  GitFork,
  Search,
  Headphones,
  BookOpen,
  Info,
  Layers,
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
import { EraScrubber } from '../components/timeline/EraScrubber';
import { DossierDrawer } from '../components/drawer/DossierDrawer';
import { LineagePathModal } from '../components/pathfinding/LineagePathModal';
import { SearchPalette } from '../components/search/SearchPalette';

export default function HomePage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('plato');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedEraId, setSelectedEraId] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'all'>('all');
  const [showConcepts, setShowConcepts] = useState<boolean>(true);
  const [highlightedPathNodes, setHighlightedPathNodes] = useState<string[]>([]);

  // Modals state
  const [isPathModalOpen, setIsPathModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute visual graph based on current filters
  const { nodes, links } = useMemo(() => {
    return getVisualGraph({
      maxYear: currentYear,
      eraId: selectedEraId as EraId | 'all',
      branch: selectedBranch,
      includeConcepts: showConcepts,
    });
  }, [currentYear, selectedEraId, selectedBranch, showConcepts]);

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
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <header className="absolute top-0 inset-x-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-50">
                PHILOSOPHY GRAPH
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                Interactive Lineage
              </span>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
              Explore how ideas evolved from Plato & Aristotle to Kant & Schopenhauer
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search Thinkers & Ideas</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Trace Lineage Path Button */}
          <button
            onClick={() => handleOpenPathModal(selectedNodeId || 'plato')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition shadow-md shadow-indigo-600/30"
          >
            <GitFork className="w-3.5 h-3.5" />
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
        />
      </main>

      {/* Floating Bottom Era Scrubber */}
      <div className="absolute bottom-5 inset-x-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-4xl">
          <EraScrubber
            eras={eras}
            currentYear={currentYear}
            onYearChange={setCurrentYear}
            selectedEraId={selectedEraId}
            onSelectEra={setSelectedEraId}
          />
        </div>
      </div>

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
    </div>
  );
}
