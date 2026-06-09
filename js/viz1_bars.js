export function initBars(svg, _data) {
  const VW = 620, VH = 230;
  svg.attr('viewBox', `0 0 ${VW} ${VH}`);

  const g = svg.append('g').attr('class', 'viz1-group');

  // ── DATA ────────────────────────────────────────────────
  const ROWS = [
    { key: 'neutral', label: 'Neutral venue',  rowY: 60,  winRate: '44.3%',
      winW: 168.3, drawW:  85.1, lossW: 126.6, dotX: 302.3,
      tip: 'Win 44.3%  ·  Draw 22.4%  ·  Loss 33.3%' },
    { key: 'home',    label: 'Home venue',      rowY: 115, winRate: '50.7%',
      winW: 192.7, drawW:  87.0, lossW: 100.3, dotX: 326.7,
      tip: 'Win 50.7%  ·  Draw 22.9%  ·  Loss 26.4%' },
    { key: 'host',    label: 'World Cup host',  rowY: 170, winRate: '61.2%',
      winW: 232.6, drawW:  69.2, lossW:  78.2, dotX: 366.6,
      tip: 'Win 61.2%  ·  Draw 18.2%  ·  Loss 20.6%' },
  ];
  const TRACK_X = 134;

  // ── ROW GROUPS ──────────────────────────────────────────
  const rowGs = g.selectAll('.row-g')
    .data(ROWS)
    .join('g')
    .attr('class', 'row-g')
    .attr('opacity', 0);

  // Labels
  rowGs.append('text')
    .attr('x', 126).attr('y', d => d.rowY + 4)
    .attr('text-anchor', 'end')
    .attr('font-family', "var(--font-serif), 'Playfair Display', serif")
    .attr('font-size', '13.5px').attr('font-weight', 700)
    .attr('fill', 'var(--color-text)')
    .text(d => d.label);

  // Track — win segment
  rowGs.append('rect')
    .attr('x', TRACK_X).attr('y', d => d.rowY - 6)
    .attr('width', d => d.winW).attr('height', 12)
    .attr('fill', 'var(--color-win)').attr('opacity', 0.75);

  // Track — draw segment
  rowGs.append('rect')
    .attr('x', d => TRACK_X + d.winW).attr('y', d => d.rowY - 6)
    .attr('width', d => d.drawW).attr('height', 12)
    .attr('fill', 'var(--color-neutral)').attr('opacity', 0.65);

  // Track — loss segment
  rowGs.append('rect')
    .attr('x', d => TRACK_X + d.winW + d.drawW).attr('y', d => d.rowY - 6)
    .attr('width', d => d.lossW).attr('height', 12)
    .attr('fill', 'var(--color-loss)').attr('opacity', 0.75);

  // Win-rate dot — outer fill
  rowGs.append('circle')
    .attr('cx', d => d.dotX).attr('cy', d => d.rowY)
    .attr('r', 8).attr('fill', 'var(--color-win)');

  // Win-rate dot — hollow centre
  rowGs.append('circle')
    .attr('cx', d => d.dotX).attr('cy', d => d.rowY)
    .attr('r', 4.5).attr('fill', 'var(--color-bg)');

  // Win-rate labels (right of tracks)
  rowGs.append('text')
    .attr('x', 522).attr('y', d => d.rowY + 5)
    .attr('text-anchor', 'start')
    .attr('font-family', "var(--font-serif), 'Playfair Display', serif")
    .attr('font-size', '14px').attr('font-weight', 700)
    .attr('fill', 'var(--color-win)')
    .text(d => d.winRate);

  // ── CONNECTOR LINES ──────────────────────────────────────
  const L1 = { x1: 302.3, y1:  60, x2: 326.7, y2: 115 };
  const L2 = { x1: 326.7, y1: 115, x2: 366.6, y2: 170 };
  L1.len = Math.hypot(L1.x2 - L1.x1, L1.y2 - L1.y1);
  L2.len = Math.hypot(L2.x2 - L2.x1, L2.y2 - L2.y1);

  const line1 = g.append('line')
    .attr('x1', L1.x1).attr('y1', L1.y1).attr('x2', L1.x2).attr('y2', L1.y2)
    .attr('stroke', '#d0c9bb').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', L1.len).attr('stroke-dashoffset', L1.len)
    .attr('opacity', 0);

  const line2 = g.append('line')
    .attr('x1', L2.x1).attr('y1', L2.y1).attr('x2', L2.x2).attr('y2', L2.y2)
    .attr('stroke', 'var(--color-accent)').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', L2.len).attr('stroke-dashoffset', L2.len)
    .attr('opacity', 0);

  // ── DELTA LABELS ─────────────────────────────────────────
  const delta1 = g.append('text')
    .attr('x', 332).attr('y', 92)
    .attr('font-family', 'var(--font-sans)').attr('font-size', '10.5px')
    .attr('fill', 'var(--color-muted)')
    .attr('opacity', 0).text('+6.4');

  const delta2 = g.append('text')
    .attr('x', 356).attr('y', 147)
    .attr('font-family', 'var(--font-sans)').attr('font-size', '10.5px')
    .attr('font-weight', 500).attr('fill', 'var(--color-accent)')
    .attr('opacity', 0).text('+16.9');

  // ── LEGEND ───────────────────────────────────────────────
  const LEG = [
    { label: 'Win',  color: 'var(--color-win)',     lx: 221 },
    { label: 'Draw', color: 'var(--color-neutral)',  lx: 284 },
    { label: 'Loss', color: 'var(--color-loss)',     lx: 354 },
  ];
  const legG = g.append('g').attr('transform', 'translate(0, 208)');
  LEG.forEach(({ label, color, lx }) => {
    legG.append('rect')
      .attr('x', lx).attr('y', 0)
      .attr('width', 14).attr('height', 8)
      .attr('fill', color);
    legG.append('text')
      .attr('x', lx + 18).attr('y', 7)
      .attr('font-family', 'var(--font-sans)').attr('font-size', '10px')
      .attr('fill', 'var(--color-muted)')
      .text(label);
  });

  // ── ROW HOVER + TOOLTIP ─────────────────────────────────
  let hoverEnabled = false;

  let barTip = document.getElementById('bars-tooltip');
  if (!barTip) {
    barTip = document.createElement('div');
    barTip.id = 'bars-tooltip';
    barTip.style.cssText = [
      'position:fixed', 'background:#111', 'color:#ccc',
      'font-family:var(--font-sans)', 'font-size:0.65rem',
      'letter-spacing:0.06em', 'padding:0.35rem 0.65rem',
      'pointer-events:none', 'opacity:0', 'transition:opacity 0.1s',
      'z-index:30', 'white-space:nowrap',
    ].join(';');
    document.getElementById('viz-panel').appendChild(barTip);
  }

  // Returns true when a given row key is visible at numeric step sn
  function isRowVisible(key, sn) {
    if (key === 'neutral') return sn >= 1;
    if (key === 'home')    return sn >= 2;
    if (key === 'host')    return sn >= 3;
    return false;
  }

  // Full-width hit-area rects (appended last so they sit on top within each rowG)
  rowGs.append('rect')
    .attr('class', 'row-hit')
    .attr('x', 0)
    .attr('y', d => d.rowY - 25)
    .attr('width', VW)
    .attr('height', 50)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      if (!hoverEnabled) return;
      const sn = SN[currentStep] || 0;
      if (!isRowVisible(d.key, sn)) return; // invisible row — ignore
      rowGs.filter(r => r.key !== d.key && isRowVisible(r.key, sn))
        .transition('hover').duration(150).ease(d3.easeQuadOut)
        .attr('opacity', 0.4);
      barTip.textContent = d.tip;
      barTip.style.opacity = '1';
    })
    .on('mousemove', function(event) {
      if (!hoverEnabled) return;
      const nearRight = event.clientX > window.innerWidth * 0.75;
      barTip.style.left = nearRight
        ? (event.clientX - barTip.offsetWidth - 12) + 'px'
        : (event.clientX + 12) + 'px';
      barTip.style.top = (event.clientY - 30) + 'px';
    })
    .on('mouseleave', function() {
      if (!hoverEnabled) return;
      const sn = SN[currentStep] || 0;
      rowGs.filter(r => isRowVisible(r.key, sn))
        .transition('hover').duration(150).ease(d3.easeQuadOut)
        .attr('opacity', 1);
      barTip.style.opacity = '0';
    });

  // ── HELPERS ──────────────────────────────────────────────
  const row = key => rowGs.filter(d => d.key === key);

  function drawConnector(line, len) {
    line.attr('stroke-dashoffset', len).attr('opacity', 1)
      .transition().duration(400).ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);
  }

  function resetConnector(line, len) {
    line.interrupt().attr('stroke-dashoffset', len).attr('opacity', 0);
  }

  // ── UPDATE ────────────────────────────────────────────────
  let currentStep = null;
  const SN = { '1': 1, '2': 2, '3': 3, '4': 4 };

  return function updateBars(step) {
    if (step === currentStep) return;
    const prev = currentStep;
    currentStep = step;

    // Hover active for all bar-chart steps (1–4); guards inside handlers
    // prevent interaction with rows that aren't visible yet
    hoverEnabled = (SN[step] || 0) >= 1;
    if (!hoverEnabled) barTip.style.opacity = '0';

    const sn   = SN[step] || 0;
    const snPr = SN[prev] || 0;
    const fwd  = sn > snPr;

    g.transition().duration(400).attr('opacity', step === '4' ? 0.2 : 1);

    // Row 1 — neutral (step 1+)
    if (sn >= 1) {
      if (fwd && snPr < 1) row('neutral').transition().duration(500).attr('opacity', 1);
      else                  row('neutral').interrupt().attr('opacity', 1);
    } else {
      row('neutral').transition().duration(300).attr('opacity', 0);
    }

    // Row 2 — home (step 2+)
    if (sn >= 2) {
      if (fwd && snPr < 2) row('home').transition().duration(500).attr('opacity', 1);
      else                  row('home').interrupt().attr('opacity', 1);
    } else {
      row('home').transition().duration(300).attr('opacity', 0);
    }

    // Row 3 — host (step 3+)
    if (sn >= 3) {
      if (fwd && snPr < 3) row('host').transition().duration(500).attr('opacity', 1);
      else                  row('host').interrupt().attr('opacity', 1);
    } else {
      row('host').transition().duration(300).attr('opacity', 0);
    }

    // Connector 1 + delta1 (step 2+)
    if (sn >= 2) {
      if (fwd && snPr < 2) {
        drawConnector(line1, L1.len);
        delta1.interrupt().transition().delay(550).duration(200).attr('opacity', 1);
      } else {
        line1.interrupt().attr('stroke-dashoffset', 0).attr('opacity', 1);
        delta1.interrupt().attr('opacity', 1);
      }
    } else {
      resetConnector(line1, L1.len);
      delta1.interrupt().transition().duration(200).attr('opacity', 0);
    }

    // Connector 2 + delta2 (step 3+)
    if (sn >= 3) {
      if (fwd && snPr < 3) {
        drawConnector(line2, L2.len);
        delta2.interrupt().transition().delay(550).duration(200).attr('opacity', 1);
      } else {
        line2.interrupt().attr('stroke-dashoffset', 0).attr('opacity', 1);
        delta2.interrupt().attr('opacity', 1);
      }
    } else {
      resetConnector(line2, L2.len);
      delta2.interrupt().transition().duration(200).attr('opacity', 0);
    }
  };
}
