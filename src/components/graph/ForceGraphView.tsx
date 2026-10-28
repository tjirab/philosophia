'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ZoomIn, ZoomOut, Maximize2, Layers, HelpCircle, Compass } from 'lucide-react';
import { VisualNode, VisualLink, Branch } from '../../lib/types';

// Dynamically import ForceGraph2D with ssr disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0e0d0b] text-[#a89b88] font-serif">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c59b27] border-t-transparent rounded-full animate-spin" />
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
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [hoveredNode, setHoveredNode] = useState<VisualNode | null>(null);

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

  // Node drawing on Canvas with Classical Aesthetic
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
      ctx.fillStyle = isOnPath ? 'rgba(229, 185, 76, 0.4)' : 'rgba(197, 155, 39, 0.45)';
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

    // Classical metallic rim border
    ctx.lineWidth = isSelected ? 2.5 : 1.2;
    ctx.strokeStyle = isSelected ? '#fef08a' : 'rgba(255, 245, 230, 0.65)';
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

      ctx.fillStyle = 'rgba(14, 13, 11, 0.9)';
      ctx.fillRect(
        node.x - textWidth / 2 - padding,
        node.y + size + 2,
        textWidth + padding * 2,
        fontSize + padding * 2
      );

      ctx.fillStyle = isSelected || isOnPath ? '#fef08a' : '#f5f0e6';
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
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0e0d0b] font-serif">
      {/* Top Floating Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
        {/* Concepts Toggle */}
        <button
          onClick={onToggleConcepts}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition ${
            showConcepts
              ? 'bg-[#2a2318] text-[#e5b94c] border-[#4a3b25] shadow-md'
              : 'bg-[#14120f]/80 text-[#a89b88] border-[#2a241e] hover:text-[#f5f0e6]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showConcepts ? 'Concepts Visible' : 'Philosophers Only'}</span>
        </button>

        {/* Branch Filter Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-[#14120f]/80 p-1 rounded-xl border border-[#2a241e] backdrop-blur-md">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBranch(b.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                selectedBranch === b.id
                  ? 'bg-[#2a2318] text-[#e5b94c] border border-[#4a3b25]'
                  : 'text-[#a89b88] hover:text-[#f5f0e6] hover:bg-[#1a1714]'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Map Legend Trigger Button */}
        <button
          onClick={onOpenLegend}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#14120f]/80 hover:bg-[#1a1714] text-[#d8cfc0] hover:text-[#e5b94c] border border-[#2a241e] hover:border-[#3d3328] backdrop-blur-md transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#c59b27]" />
          <span>Folio Key (Colors & Symbols)</span>
        </button>

        {/* Active Path Alert */}
        {isPathActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2318] border border-[#4a3b25] rounded-xl text-[#e5b94c] text-xs backdrop-blur-md shadow-lg">
            <span>
              Lineage Isolated ({highlightedPathNodes.length} nodes)
            </span>
            <button
              onClick={onClearPath}
              className="text-[#e5b94c] hover:text-white font-bold ml-1 text-xs"
              title="Clear Highlight"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls (Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#14120f]/85 border border-[#2a241e] p-1.5 rounded-xl backdrop-blur-md shadow-xl text-[#d8cfc0]">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:text-[#e5b94c] hover:bg-[#1a1714] rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:text-[#e5b94c] hover:bg-[#1a1714] rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 hover:text-[#e5b94c] hover:bg-[#1a1714] rounded-lg transition"
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
        graphData={{ nodes, links }}
        nodeId="id"
        nodeLabel={(node: any) => `${node.name}\n${node.summary}`}
        nodeCanvasObject={paintNode}
        linkDirectionalArrowLength={4.5}
        linkDirectionalArrowRelPos={0.9}
        linkCurvature={0.12}
        linkColor={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

          if (isPathActive) {
            const inPath = pathNodeSet.has(srcId) && pathNodeSet.has(tgtId);
            return inPath ? '#e5b94c' : 'rgba(42, 36, 30, 0.2)';
          }

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
        }}
        linkWidth={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
          if (isPathActive && pathNodeSet.has(srcId) && pathNodeSet.has(tgtId)) {
            return 2.5;
          }
          return 1.2;
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
    </div>
  );
}
