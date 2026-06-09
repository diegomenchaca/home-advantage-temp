import { HOSTS, SLOPE_M } from './viz2_slope.js';

const ML = SLOPE_M.left;  // 60
const MT = SLOPE_M.top;   // 50

// Selectors for viz2 structural elements (non-glyph)
const STRUCT_SELS = ['.viz2-yaxis', '.viz2-legend', '.year-labels', '.viz2-struct'];

function hideStructural(g2) {
  STRUCT_SELS.forEach(sel => g2.selectAll(sel).attr('opacity', 0));
}

function showStructural(g2) {
  STRUCT_SELS.forEach((sel, i) => {
    g2.selectAll(sel)
      .transition().delay(1150 + i * 60).duration(400)
      .attr('opacity', 1);
  });
}

function resetStructural(g2) {
  STRUCT_SELS.forEach(sel => g2.selectAll(sel).interrupt().attr('opacity', 1));
}

// ── Build piece data ─────────────────────────────────────
function buildPieces() {
  const green = HOSTS.filter(h => h.delta >  0).sort((a, b) => a.year - b.year);
  const grey  = HOSTS.filter(h => h.delta === 0).sort((a, b) => a.year - b.year);
  const red   = HOSTS.filter(h => h.delta <  0).sort((a, b) => a.year - b.year);

  function group(hosts, segX, segW) {
    return hosts.map((h, i) => {
      const w        = segW / hosts.length;
      const absX     = ML + h.cx;
      const absYElo  = MT + h.yElo;
      const absYFin  = MT + h.yFin;
      const lineH    = Math.max(Math.abs(absYFin - absYElo), 4);
      const midY     = (absYElo + absYFin) / 2;
      return {
        host:    h,
        color:   h.color,
        startX:  segX + i * w,
        startW:  w,
        targetX: absX,
        targetY: midY - lineH / 2,
        targetH: lineH,
      };
    });
  }

  return [
    ...group(green, 134,   232.6),
    ...group(grey,  366.6,  69.2),
    ...group(red,   435.8,  78.2),
  ];
}

// ── Forward morph ────────────────────────────────────────
function morphForward(svg, g1, g2) {
  const pieces = buildPieces();

  // Map each piece to its stagger rank (sorted by targetX, left → right)
  const byX    = [...pieces].sort((a, b) => a.targetX - b.targetX);
  const xRank  = new Map(byX.map((p, i) => [p, i]));

  // Reset to clean state — cancel any prior transitions
  g1.interrupt().attr('opacity', 1);
  g2.interrupt().attr('opacity', 0);
  g2.selectAll('.glyph').interrupt().attr('opacity', 0);  // clear retained opacity from prior cycle
  svg.selectAll('.morph-piece').remove();

  // Create N split rects exactly covering the WC host track
  const trackY = 164;  // rowY(170) − 6
  const trackH = 12;

  const rects = svg.selectAll('.morph-piece')
    .data(pieces)
    .join('rect')
    .attr('class', 'morph-piece')
    .attr('x', d => d.startX)
    .attr('y', trackY)
    .attr('width', d => d.startW)
    .attr('height', trackH)
    .attr('fill', d => d.color)
    .attr('opacity', 1);

  // ── PHASE 0 (t=0, 300ms): fade out g1 ──────────────────
  // Split rects cover the WC host segments, so the track visually
  // persists while all row labels, connectors, and legend fade out.
  g1.transition().duration(300).ease(d3.easeQuadOut).attr('opacity', 0);

  // ── PHASE 1 (t=200ms, 350ms): pinch to 3px ──────────────
  // Uses named transition 'morph' so Phase 2 can take it over mid-flight
  rects.transition('morph')
    .delay(200).duration(350).ease(d3.easeCubicOut)
    .attr('x', d => d.startX + d.startW / 2 - 1.5)
    .attr('width', 3);

  // ── PHASE 2 (t=400ms + stagger, 700ms): scatter ─────────
  // Same name 'morph' cancels Phase 1 cleanly when each piece's delay fires.
  // Separate name from Phase 3 so opacity fade runs in parallel with scatter.
  rects.each(function(d) {
    const delay = 400 + xRank.get(d) * 20;
    d3.select(this).transition('morph')
      .delay(delay).duration(700).ease(d3.easeCubicInOut)
      .attr('x', d.targetX - 1.5)
      .attr('y', d.targetY)
      .attr('height', d.targetH);
  });

  // ── PHASE 3 (t=950ms, 300ms): crossfade rects ↔ glyphs ──
  // Named 'fade' — independent of 'morph', so scatter can finish while
  // pieces are already fading out.
  hideStructural(g2);
  g2.attr('opacity', 1).attr('pointer-events', 'none');

  rects.transition('fade')
    .delay(950).duration(300)
    .attr('opacity', 0);

  g2.selectAll('.glyph').transition()
    .delay(950).duration(300)
    .attr('opacity', 0.75);

  // Remove spent rects after fade completes
  rects.transition('rm')
    .delay(1300).duration(0)
    .remove();

  // ── PHASE 4 (t=1150ms, staggered 400ms): axes & labels ──
  showStructural(g2);

  g2.transition().delay(1600).duration(0)
    .attr('pointer-events', 'all');
}

// ── Backward crossfade ───────────────────────────────────
function morphBackward(g1, g2) {
  // Interrupt any in-progress morph
  g2.selectAll('.glyph').interrupt();
  g2.interrupt();

  // Restore structural element opacities (may have been zeroed by morph)
  resetStructural(g2);

  g2.transition().duration(300).attr('opacity', 0).attr('pointer-events', 'none');
  g1.interrupt().transition().duration(300).attr('opacity', 1).attr('pointer-events', 'all');
  // Row groups visibility is already correct from updateBars('3') called in main.js
}

// ── Public API ───────────────────────────────────────────
const SLOPE_STEPS = new Set(['5.1', '5.2', '5.3', '5.4']);

export function splitBarsToGlyphs(svg, g1, g2, fromStep) {
  if (SLOPE_STEPS.has(fromStep)) {
    morphBackward(g1, g2);
  } else {
    morphForward(svg, g1, g2);
  }
}

// Hard-cancel any in-progress morph and snap to bar-chart state.
// Safe to call when g1/g2 may be mid-transition or mid-morph.
export function cancelMorph(svg, g1, g2) {
  svg.selectAll('.morph-piece').interrupt().remove();
  g1.interrupt().attr('opacity', 1).attr('pointer-events', 'all');
  g2.interrupt();
  g2.selectAll('.glyph').interrupt();
  resetStructural(g2);
  g2.attr('opacity', 0).attr('pointer-events', 'none');
}
