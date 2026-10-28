'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ZoomIn, ZoomOut, Maximize2, Layers, HelpCircle } from 'lucide-react';
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
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // When selectedNodeId changes, center camera on it
  useEffect(() => {
    if (selectedNodeId && fgRef.current) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.2, 800);
      }
    }
  }, [selectedNodeId, nodes]);

  const pathNodeSet = useMemo(() => new Set(highlightedPathNodes), [highlightedPathNodes]);
  const isPathActive = pathNodeSet.size > 0;
  const isLight = resolvedTheme === 'light';

  // Zoom controls
  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };
  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
  };
  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(600, 50);
  };

  // Node drawing on Canvas with Classical Aesthetic & Theme Awareness
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

    const size = Math.max(5, (node.val || 8) * 0.9);

    // Outer glow for selected or path nodes
    if (isSelected || isOnPath) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = isLight
        ? isOnPath
          ? 'rgba(180, 130, 24, 0.35)'
          : 'rgba(154, 111, 20, 0.4)'
        : isOnPath
        ? 'rgba(229, 185, 76, 0.4)'
        : 'rgba(197, 155, 39, 0.45)';
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    if (node.type === 'concept') {
      // Rounded diamond for conceptual breakthroughs
      const boxSize = size * 1.4;
      ctx.roundRect(node.x - boxSize / 2, node.y - boxSize / 2, boxSize, boxSize, 3);
    } else {
      // Circle for thinkers
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    }

    ctx.fillStyle = node.color || '#f4a261';
    ctx.fill();

    // Metallic rim border
    ctx.lineWidth = isSelected ? 2.5 : 1.2;
    ctx.strokeStyle = isSelected
      ? isLight
        ? '#9a6f14'
        : '#fef08a'
      : isLight
      ? 'rgba(60, 45, 30, 0.5)'
      : 'rgba(255, 245, 230, 0.65)';
    ctx.stroke();

    // Node label (Classical serif typography)
    const shouldDrawLabel = globalScale > 1.2 || isSelected || isOnPath || isHovered;
    if (shouldDrawLabel) {
      const fontSize = Math.max(10 / globalScale, 3.5);
      ctx.font = `${isSelected || isOnPath ? 'bold' : 'normal'} ${fontSize}px "EB Garamond", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const text = node.name;
      const textWidth = ctx.measureText(text).width;
      const padding = 2.5;

      ctx.fillStyle = isLight ? 'rgba(255, 253, 250, 0.92)' : 'rgba(14, 13, 11, 0.9)';
      ctx.fillRect(
        node.x - textWidth / 2 - padding,
        node.y + size + 2,
        textWidth + padding * 2,
        fontSize + padding * 2
      );

      ctx.fillStyle = isSelected || isOnPath
        ? isLight
          ? '#9a6f14'
          : '#fef08a'
        : isLight
        ? '#1d1813'
        : '#f5f0e6';
      ctx.fillText(text, node.x, node.y + size + 3);
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
      onMouseMove={(e) => setMouseCoords({ x: e.clientX, y: e.clientY })}
      className="relative w-full h-full overflow-hidden bg-[var(--bg-main)] font-serif"
    >
      {/* Top Floating Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-140px)]">
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
        graphData={{ nodes, links }}
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
        }}
        cooldownTicks={120}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Floating Hover Card */}
      {hoveredNode && (
        <HoverNodeCard node={hoveredNode} position={mouseCoords} />
      )}
    </div>
  );
}
