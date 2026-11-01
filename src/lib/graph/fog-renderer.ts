/**
 * Cartographic Fog of War & Atmospheric Exploration Canvas Renderer
 * Renders atmospheric citadel illumination halos, ambient parchment mists,
 * dynamic lantern dispel fields, and ancient cartographic beacons.
 */

import { VisualNode } from '../types';
import { getExplorationStateConfig } from './exploration-service';

export interface WorldPoint {
  x: number;
  y: number;
}

export interface FogAtmosphereOptions {
  nodes: VisualNode[];
  globalScale: number;
  isLight: boolean;
  mouseWorldPos?: WorldPoint | null;
  hoveredNodeId?: string | null;
  fogIntensity?: number; // 0.0 to 1.0 (default 0.75)
}

/**
 * Draws the exploration atmosphere: warm radiant citadel illumination halos,
 * frontier auras, and ambient parchment fog fields.
 * Called in onRenderFramePre before nodes and links are drawn.
 */
export function drawExplorationAtmosphere(
  ctx: CanvasRenderingContext2D,
  options: FogAtmosphereOptions
): void {
  const {
    nodes,
    globalScale,
    isLight,
    mouseWorldPos,
    hoveredNodeId,
    fogIntensity = 0.75,
  } = options;

  if (nodes.length === 0) return;

  ctx.save();

  // 1. Radiant Citadel & Frontier Luminescence Halos
  // Group nodes by exploration state to render halos in batches
  for (const node of nodes) {
    if (typeof node.x !== 'number' || typeof node.y !== 'number') continue;

    const state = node.exploration?.state || 'citadel';
    const baseRadius = Math.max(8, (node.val || 8) * 0.9);
    const isHovered = node.id === hoveredNodeId;

    if (state === 'citadel') {
      // Golden / Amber Citadel Hearth Halo
      const haloRadius = baseRadius * (isHovered ? 5.5 : 4.0);
      const grad = ctx.createRadialGradient(node.x, node.y, baseRadius * 0.8, node.x, node.y, haloRadius);
      const innerAlpha = isLight ? (isHovered ? 0.32 : 0.22) : (isHovered ? 0.28 : 0.18);
      grad.addColorStop(0, isLight ? `rgba(212, 175, 55, ${innerAlpha})` : `rgba(229, 185, 76, ${innerAlpha})`);
      grad.addColorStop(0.5, isLight ? 'rgba(212, 175, 55, 0.08)' : 'rgba(229, 185, 76, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } else if (state === 'frontier') {
      // Disputed Frontier Rose/Crimson Aura
      const haloRadius = baseRadius * (isHovered ? 4.8 : 3.4);
      const grad = ctx.createRadialGradient(node.x, node.y, baseRadius * 0.8, node.x, node.y, haloRadius);
      const innerAlpha = isLight ? (isHovered ? 0.26 : 0.16) : (isHovered ? 0.24 : 0.14);
      grad.addColorStop(0, isLight ? `rgba(225, 29, 72, ${innerAlpha})` : `rgba(244, 63, 94, ${innerAlpha})`);
      grad.addColorStop(0.5, isLight ? 'rgba(225, 29, 72, 0.06)' : 'rgba(244, 63, 94, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } else if (state === 'emerging') {
      // Pioneer Outpost Teal Aura
      const haloRadius = baseRadius * (isHovered ? 4.2 : 3.0);
      const grad = ctx.createRadialGradient(node.x, node.y, baseRadius * 0.8, node.x, node.y, haloRadius);
      const innerAlpha = isLight ? (isHovered ? 0.24 : 0.14) : (isHovered ? 0.22 : 0.12);
      grad.addColorStop(0, isLight ? `rgba(13, 148, 136, ${innerAlpha})` : `rgba(45, 212, 191, ${innerAlpha})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } else if (state === 'uncharted') {
      // Uncharted Indigo Beacon Haze
      const haloRadius = baseRadius * (isHovered ? 4.5 : 3.2);
      const grad = ctx.createRadialGradient(node.x, node.y, baseRadius * 0.8, node.x, node.y, haloRadius);
      const innerAlpha = isLight ? (isHovered ? 0.22 : 0.14) : (isHovered ? 0.22 : 0.12);
      grad.addColorStop(0, isLight ? `rgba(99, 102, 241, ${innerAlpha})` : `rgba(129, 140, 248, ${innerAlpha})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // 2. Dynamic Lantern Dispel Spotlight
  // If the user's cursor or hovered node is present, cast an active torchlight ring
  if (mouseWorldPos && Number.isFinite(mouseWorldPos.x) && Number.isFinite(mouseWorldPos.y)) {
    const lanternRadius = 240 / Math.max(0.7, Math.min(1.4, globalScale));
    const lanternGrad = ctx.createRadialGradient(
      mouseWorldPos.x,
      mouseWorldPos.y,
      20,
      mouseWorldPos.x,
      mouseWorldPos.y,
      lanternRadius
    );
    const alpha = isLight ? 0.15 * fogIntensity : 0.12 * fogIntensity;
    lanternGrad.addColorStop(0, isLight ? `rgba(255, 248, 220, ${alpha})` : `rgba(254, 240, 138, ${alpha})`);
    lanternGrad.addColorStop(0.6, isLight ? `rgba(255, 248, 220, ${alpha * 0.4})` : `rgba(254, 240, 138, ${alpha * 0.3})`);
    lanternGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(mouseWorldPos.x, mouseWorldPos.y, lanternRadius, 0, Math.PI * 2);
    ctx.fillStyle = lanternGrad;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws cartographic beacon rings, fortified citadel ramparts, and compass indicators.
 * Called in paintNode to enhance individual node medallions.
 */
export function drawCartographicBeacon(
  ctx: CanvasRenderingContext2D,
  node: VisualNode,
  size: number,
  isLight: boolean,
  globalScale: number
): void {
  const state = node.exploration?.state || 'citadel';

  ctx.save();

  if (state === 'citadel') {
    // Fortified Citadel Double Rim & Classical Crenellation Ticks
    const outerRadius = size + 4;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isLight ? 'rgba(154, 111, 20, 0.7)' : 'rgba(254, 240, 138, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 8 Cardinal/Intercardinal Citadel Crenellations if zoomed in enough
    if (globalScale >= 0.75) {
      const tickLength = 2.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = node.x! + Math.cos(angle) * (outerRadius - 0.5);
        const y1 = node.y! + Math.sin(angle) * (outerRadius - 0.5);
        const x2 = node.x! + Math.cos(angle) * (outerRadius + tickLength);
        const y2 = node.y! + Math.sin(angle) * (outerRadius + tickLength);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isLight ? 'rgba(154, 111, 20, 0.8)' : 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
    }
  } else if (state === 'uncharted') {
    // Terra Incognita Dashed Compass Ring & North Star Glyph
    const outerRadius = size + 4.5;
    ctx.beginPath();
    ctx.setLineDash([3, 2.5]);
    ctx.arc(node.x!, node.y!, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.85)' : 'rgba(165, 180, 252, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 4 Cardinal Ticks (Compass Rose)
    const tickLen = 3.5;
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    for (const ang of angles) {
      const x1 = node.x! + Math.cos(ang) * outerRadius;
      const y1 = node.y! + Math.sin(ang) * outerRadius;
      const x2 = node.x! + Math.cos(ang) * (outerRadius + tickLen);
      const y2 = node.y! + Math.sin(ang) * (outerRadius + tickLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.9)' : 'rgba(165, 180, 252, 0.95)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Top-right beacon star glyph
    if (globalScale >= 0.8) {
      const starX = node.x! + size * 0.85;
      const starY = node.y! - size * 0.85;
      ctx.font = 'bold 9px "Cinzel", Georgia, serif';
      ctx.fillStyle = isLight ? '#4f46e5' : '#c7d2fe';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', starX, starY);
    }
  } else if (state === 'frontier') {
    // Disputed Frontier Dual Dialectic Ring
    const outerRadius = size + 3.5;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isLight ? 'rgba(225, 29, 72, 0.75)' : 'rgba(251, 113, 133, 0.8)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  } else if (state === 'emerging') {
    // Pioneer Outpost Diamond Ring
    const outerRadius = size + 3.5;
    ctx.beginPath();
    ctx.setLineDash([4, 3]);
    ctx.arc(node.x!, node.y!, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isLight ? 'rgba(13, 148, 136, 0.75)' : 'rgba(45, 212, 191, 0.8)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}
