'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { forceCollide, forceManyBody, forceLink } from 'd3-force';
import { ZoomIn, ZoomOut, Maximize2, Layers, HelpCircle, Expand, Shrink } from 'lucide-react';
import { VisualNode, VisualLink, Branch } from '../../lib/types';
import { useTheme } from '../../lib/theme-context';
import { HoverNodeCard } from './HoverNodeCard';

// Dynamically import ForceGraph2D with ssr disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] font-serif">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--gold-accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm tracking-wide">Drawing the Constellation of Thought...</span>
      </div>
    </div>
  ),
});

interface ForceGraphViewProps {
  nodes: VisualNode[];
  links: VisualLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  highlightedPathNodes: string[];
  onClearPath: () => void;
  selectedBranch: Branch | 'all';
  onSelectBranch: (branch: Branch | 'all') => void;
  showConcepts: boolean;
  onToggleConcepts: () => void;
  onOpenLegend: () => void;
}

function getNodeMonogram(node: VisualNode): string {
  if (node.type === 'concept') return '✦';
  const name = node.name.replace(/^(von|de|du|of|the)\s+/i, '').trim();
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ForceGraphView({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  highlightedPathNodes,
  onClearPath,
  selectedBranch,
  onSelectBranch,
  showConcepts,
  onToggleConcepts,
  onOpenLegend,
}: ForceGraphViewProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [spacingMultiplier, setSpacingMultiplier] = useState<number>(1.4); // 1.4x default generous spacing to prevent overlap

  // Memoize graphData so ForceGraph2D does not re-trigger physics simulation on component re-renders
  const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

  // Resize listener
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Configure D3 anti-collision forces and generous repulsion to prevent node overlap
  useEffect(() => {
    if (fgRef.current) {
      // 1. Anti-collision barrier: collision radius calculated with node radius + label padding
      const collisionRadius = (node: any) => {
        const size = Math.max(8, (node.val || 8) * 0.9);
        return size + 36 * spacingMultiplier;
      };

      fgRef.current.d3Force('collide', forceCollide().radius(collisionRadius).iterations(4));

      // 2. Strong repulsion charge
      fgRef.current.d3Force(
        'charge',
        forceManyBody().strength(-550 * spacingMultiplier).distanceMax(900)
      );

      // 3. Link distance
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
        linkForce.distance(110 * spacingMultiplier);
      }
    }
  }, [graphData, spacingMultiplier]);

  // When selectedNodeId changes, center camera on it
  useEffect(() => {
    if (selectedNodeId && fgRef.current) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.0, 800);
      }
    }
  }, [selectedNodeId, nodes]);

  const pathNodeSet = useMemo(() => new Set(highlightedPathNodes), [highlightedPathNodes]);
  const isPathActive = pathNodeSet.size > 0;
  const isLight = resolvedTheme === 'light';

  // Zoom and Spacing controls
  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };
  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
  };
  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(600, 60);
  };
  const toggleSpacing = () => {
    setSpacingMultiplier((prev) => (prev >= 1.8 ? 1.0 : prev + 0.4));
  };

  // Node drawing on Canvas with Distinct Shapes, Monograms, and Anti-Overlap Aesthetics
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = node.id === selectedNodeId;
    const isHovered = hoveredNode?.id === node.id;
    const isOnPath = pathNodeSet.has(node.id);

    // Dimming logic
    let alpha = 1;
    if (isPathActive && !isOnPath) {
      alpha = 0.12;
    } else if (hoveredNode && !isSelected && !isHovered) {
      alpha = 0.35;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    const size = Math.max(7, (node.val || 8) * 0.95);
    const isPrimaryThinker = node.importanceScore && node.importanceScore >= 95;

    // 1. Outer halo for selected, path, or high-centrality foundational thinkers
    if (isSelected || isOnPath || isPrimaryThinker) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = isLight
        ? isSelected || isOnPath
          ? 'rgba(154, 111, 20, 0.4)'
          : 'rgba(215, 185, 130, 0.25)'
        : isSelected || isOnPath
        ? 'rgba(229, 185, 76, 0.45)'
        : 'rgba(197, 155, 39, 0.25)';
      ctx.fill();
    }

    // 2. Node Shape: Distinct geometry for Thinker (Circle) vs Concept (Diamond)
    if (node.type === 'concept') {
      const boxSize = size * 1.45;
      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(Math.PI / 4); // 45-degree diamond lozenge

      ctx.beginPath();
      ctx.roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, 4);
      ctx.fillStyle = node.color || '#2a9d8f';
      ctx.fill();

      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeStyle = isSelected
        ? isLight ? '#9a6f14' : '#fef08a'
        : isLight ? '#3d3328' : '#ffffff';
      ctx.stroke();

      ctx.restore();

      // Draw concept emblem '✦' in center
      const iconSize = Math.max(9 / globalScale, 6);
      ctx.font = `bold ${iconSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('✦', node.x, node.y);
    } else {
      // Circle for philosophers
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color || '#f4a261';
      ctx.fill();

      // Double ring for major thinkers
      ctx.lineWidth = isSelected ? 2.5 : isPrimaryThinker ? 2 : 1.2;
      ctx.strokeStyle = isSelected
        ? isLight ? '#9a6f14' : '#fef08a'
        : isLight ? 'rgba(50, 40, 30, 0.7)' : 'rgba(255, 245, 230, 0.75)';
      ctx.stroke();

      // Inner medallion contrast circle for initial monogram
      if (size >= 8) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 0.65, 0, 2 * Math.PI, false);
        ctx.fillStyle = isLight ? 'rgba(255, 253, 250, 0.85)' : 'rgba(18, 16, 13, 0.85)';
        ctx.fill();

        // Monogram initial
        const monogram = getNodeMonogram(node);
        const monogramSize = Math.max(size * 0.6, 6);
        ctx.font = `bold ${monogramSize}px "Cinzel", Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isLight ? '#1f1b15' : '#f5f0e6';
        ctx.fillText(monogram, node.x, node.y);
      }
    }

    // 3. Node Label: Clear high-contrast text pill with year or branch tag
    const shouldDrawLabel = globalScale > 1.0 || isSelected || isOnPath || isHovered || isPrimaryThinker;
    if (shouldDrawLabel) {
      const fontSize = Math.max(10.5 / globalScale, 3.8);
      ctx.font = `${isSelected || isOnPath ? 'bold' : 'normal'} ${fontSize}px "EB Garamond", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelText = node.name;
      const textWidth = ctx.measureText(labelText).width;
      const paddingX = 4;
      const paddingY = 2;

      // Label background pill
      ctx.fillStyle = isLight ? 'rgba(255, 253, 250, 0.94)' : 'rgba(18, 16, 13, 0.92)';
      ctx.strokeStyle = isLight ? 'rgba(215, 205, 190, 0.8)' : 'rgba(60, 50, 40, 0.8)';
      ctx.lineWidth = 0.8;

      const rectX = node.x - textWidth / 2 - paddingX;
      const rectY = node.y + size + 3;
      const rectW = textWidth + paddingX * 2;
      const rectH = fontSize + paddingY * 2;

      ctx.beginPath();
      ctx.roundRect(rectX, rectY, rectW, rectH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSelected || isOnPath
        ? isLight ? '#9a6f14' : '#fef08a'
        : isLight ? '#1f1b15' : '#f5f0e6';
      ctx.fillText(labelText, node.x, node.y + size + 4);
    }

    ctx.restore();
  };

  const branches: Array<{ id: Branch | 'all'; label: string }> = [
    { id: 'all', label: 'All Branches' },
    { id: 'epistemology', label: 'Epistemology' },
    { id: 'metaphysics', label: 'Metaphysics' },
    { id: 'ethics', label: 'Ethics' },
    { id: 'political', label: 'Political' },
    { id: 'mind', label: 'Mind' },
    { id: 'logic', label: 'Logic' },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[var(--bg-main)] font-serif"
    >
      {/* Top Floating Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-180px)]">
        {/* Concepts Toggle */}
        <button
          onClick={onToggleConcepts}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition ${
            showConcepts
              ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] border-[var(--gold-border)] shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-main)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showConcepts ? 'Concepts Visible' : 'Philosophers Only'}</span>
        </button>

        {/* Branch Filter Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-main)] backdrop-blur-md">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBranch(b.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                selectedBranch === b.id
                  ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Map Legend Trigger Button */}
        <button
          onClick={onOpenLegend}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-main)] backdrop-blur-md transition shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
          <span>Folio Key (Legend)</span>
        </button>

        {/* Spacing Spreader Toggle */}
        <button
          onClick={toggleSpacing}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-main)] backdrop-blur-md transition shadow-sm"
          title="Adjust spreading distance between nodes"
        >
          {spacingMultiplier >= 1.4 ? <Shrink className="w-3.5 h-3.5 text-[var(--gold-accent)]" /> : <Expand className="w-3.5 h-3.5 text-[var(--gold-accent)]" />}
          <span>Spread: {spacingMultiplier.toFixed(1)}x</span>
        </button>

        {/* Active Path Alert */}
        {isPathActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--gold-bg)] border border-[var(--gold-border)] rounded-xl text-[var(--gold-accent)] text-xs backdrop-blur-md shadow-lg">
            <span>
              Lineage Isolated ({highlightedPathNodes.length} nodes)
            </span>
            <button
              onClick={onClearPath}
              className="text-[var(--gold-accent)] hover:text-[var(--text-main)] font-bold ml-1 text-xs"
              title="Clear Highlight"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls (Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] p-1.5 rounded-xl backdrop-blur-md shadow-xl text-[var(--text-main)]">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 hover:text-[var(--gold-accent)] hover:bg-[var(--bg-hover)] rounded-lg transition"
          title="Fit Constellation to View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2D Force Directed Graph Canvas */}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={isLight ? '#f7f3ea' : '#0e0d0b'}
        graphData={graphData}
        nodeId="id"
        nodeLabel={() => ''} /* Disable default HTML title tooltip so our custom card handles hover */
        nodeCanvasObject={paintNode}
        linkDirectionalArrowLength={4.5}
        linkDirectionalArrowRelPos={0.9}
        linkCurvature={0.12}
        linkColor={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

          if (isPathActive) {
            const inPath = pathNodeSet.has(srcId) && pathNodeSet.has(tgtId);
            return inPath
              ? isLight ? '#9a6f14' : '#e5b94c'
              : isLight ? 'rgba(215, 205, 190, 0.25)' : 'rgba(42, 36, 30, 0.2)';
          }

          if (isLight) {
            switch (link.type) {
              case 'CRITIQUED':
                return 'rgba(220, 38, 38, 0.7)';
              case 'SYNTHESIZED':
                return 'rgba(147, 51, 234, 0.7)';
              case 'DEVELOPED':
                return 'rgba(13, 148, 136, 0.7)';
              case 'INFLUENCED':
              default:
                return 'rgba(37, 99, 235, 0.65)';
            }
          } else {
            switch (link.type) {
              case 'CRITIQUED':
                return 'rgba(248, 113, 113, 0.65)';
              case 'SYNTHESIZED':
                return 'rgba(192, 132, 252, 0.65)';
              case 'DEVELOPED':
                return 'rgba(45, 212, 191, 0.65)';
              case 'INFLUENCED':
              default:
                return 'rgba(96, 165, 250, 0.55)';
            }
          }
        }}
        linkWidth={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
          if (isPathActive && pathNodeSet.has(srcId) && pathNodeSet.has(tgtId)) {
            return 2.5;
          }
          return 1.3;
        }}
        onNodeClick={(node: any) => {
          onSelectNode(node.id);
        }}
        onBackgroundClick={() => {
          onSelectNode(null);
        }}
        onNodeHover={(node: any) => {
          setHoveredNode(node || null);
          if (node && fgRef.current && typeof node.x === 'number' && typeof node.y === 'number') {
            const coords = fgRef.current.graph2ScreenCoords(node.x, node.y);
            setHoverPosition(coords);
          } else {
            setHoverPosition(null);
          }
        }}
        warmupTicks={150}
        cooldownTicks={120}
        cooldownTime={2500}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.35}
        enableNodeDrag={true}
      />

      {/* Floating Hover Card */}
      {hoveredNode && hoverPosition && (
        <HoverNodeCard node={hoveredNode} position={hoverPosition} />
      )}
    </div>
  );
}
