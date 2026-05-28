export function initSlope(svg, data) {
  const VW = 700, VH = 500;
  const margin = { top: 50, right: 130, bottom: 50, left: 130 };
  const W = VW - margin.left - margin.right;
  const H = VH - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('class', 'viz2-group')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('opacity', 0);

  const colorWin  = '#2d6a4f';
  const colorLoss = '#c1440e';
  const colorNeu  = '#8d8d8d';

  // rank scale: 1 (best) at top
  const maxRank = d3.max(data, d => Math.max(d.elo_rank, d.finish_rank));
  const yScale = d3.scaleLinear().domain([1, maxRank]).range([0, H]);

  // jitter duplicate rank values on each side for readability
  function spreadRanks(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const positions = {};
    const minGap = H / (maxRank * 1.4);
    let lastY = -999;
    sorted.forEach(v => {
      let y = yScale(v);
      if (y - lastY < minGap) y = lastY + minGap;
      positions[v] = positions[v] || [];
      positions[v].push(y);
      lastY = y;
    });
    // return a flat map: index → y
    const result = new Map();
    const counts = {};
    values.forEach((v, i) => {
      counts[v] = (counts[v] || 0);
      const arr = positions[v];
      result.set(i, arr[counts[v]]);
      counts[v]++;
    });
    return result;
  }

  const elo_ranks    = data.map(d => d.elo_rank);
  const finish_ranks = data.map(d => d.finish_rank);
  const leftY  = spreadRanks(elo_ranks);
  const rightY = spreadRanks(finish_ranks);

  // ── AXES ───────────────────────────────────────────────
  const axisGroup = g.append('g').attr('class', 'slope-axes');

  // left axis line
  axisGroup.append('line')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', H)
    .attr('stroke', 'var(--color-border)').attr('stroke-width', 1);
  axisGroup.append('text')
    .attr('x', 0).attr('y', -14).attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem')
    .attr('fill', 'var(--color-muted)').text('Elo rank before tournament');

  // right axis line
  axisGroup.append('line')
    .attr('x1', W).attr('y1', 0).attr('x2', W).attr('y2', H)
    .attr('stroke', 'var(--color-border)').attr('stroke-width', 1);
  axisGroup.append('text')
    .attr('x', W).attr('y', -14).attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem')
    .attr('fill', 'var(--color-muted)').text('Actual finish');

  // rank=1 labels
  ['left','right'].forEach(side => {
    const x = side === 'left' ? -10 : W + 10;
    const anchor = side === 'left' ? 'end' : 'start';
    axisGroup.append('text')
      .attr('x', x).attr('y', yScale(1)).attr('dy', '0.35em')
      .attr('text-anchor', anchor)
      .attr('font-family', 'var(--font-sans)').attr('font-size', '0.65rem')
      .attr('fill', 'var(--color-muted)').text('1st (best)');
  });

  // ── LINES ──────────────────────────────────────────────
  const lineGroup = g.append('g').attr('class', 'slope-lines');

  const tooltip = d3.select('#tooltip');

  function lineColor(d) {
    return d.delta > 0 ? colorWin : d.delta < 0 ? colorLoss : colorNeu;
  }

  const lineEls = lineGroup.selectAll('.slope-line')
    .data(data)
    .join('line')
    .attr('class', 'slope-line')
    .attr('x1', 0)
    .attr('y1', (d, i) => leftY.get(i))
    .attr('x2', W)
    .attr('y2', (d, i) => rightY.get(i))
    .attr('stroke', lineColor)
    .attr('stroke-width', d => 1.2 + Math.abs(d.delta) / 11)
    .attr('opacity', 0)
    .attr('stroke-dasharray', function() { return this.getTotalLength(); })
    .attr('stroke-dashoffset', function() { return this.getTotalLength(); })
    .style('cursor', 'pointer');

  // left labels
  const leftLabels = g.append('g').attr('class', 'slope-labels-left');
  leftLabels.selectAll('text')
    .data(data)
    .join('text')
    .attr('x', -14)
    .attr('y', (d, i) => leftY.get(i))
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'var(--font-sans)')
    .attr('font-size', '0.6rem')
    .attr('fill', 'var(--color-muted)')
    .attr('opacity', 0)
    .text(d => `${d.country} '${String(d.year).slice(2)}`);

  // right labels
  const rightLabels = g.append('g').attr('class', 'slope-labels-right');
  rightLabels.selectAll('text')
    .data(data)
    .join('text')
    .attr('x', W + 14)
    .attr('y', (d, i) => rightY.get(i))
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start')
    .attr('font-family', 'var(--font-sans)')
    .attr('font-size', '0.6rem')
    .attr('fill', d => lineColor(d))
    .attr('opacity', 0)
    .text(d => d.finish_label);

  // ── CALLOUT BOX ────────────────────────────────────────
  const callout = g.append('g').attr('class', 'callout').attr('opacity', 0);
  callout.append('rect').attr('class', 'callout-box')
    .attr('x', W / 2 - 130).attr('y', H - 68)
    .attr('width', 260).attr('height', 58).attr('rx', 2);
  callout.append('text')
    .attr('x', W / 2).attr('y', H - 44).attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem')
    .attr('fill', 'var(--color-text)').attr('font-weight', 500)
    .text('20 of 23 hosts exceeded Elo expectations.');
  callout.append('text')
    .attr('x', W / 2).attr('y', H - 26).attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem')
    .attr('fill', 'var(--color-accent)').attr('font-weight', 500)
    .text('Average boost: +4.35 finishing positions.');

  // ── HOVER ──────────────────────────────────────────────
  lineEls
    .on('mouseover', function(event, d) {
      lineEls.attr('opacity', 0.08);
      d3.select(this).attr('opacity', 1).attr('stroke-width', d => 3 + Math.abs(d.delta) / 8);
      const sign = d.delta > 0 ? '+' : '';
      tooltip.classed('visible', true)
        .html(`<strong>${d.country} ${d.year}</strong><br/>Expected: ${d.elo_rank}${ordinal(d.elo_rank)}<br/>Actual: ${d.finish_rank}${ordinal(d.finish_rank)}<br/>Δ ${sign}${d.delta}`);
    })
    .on('mousemove', function(event) {
      const panel = document.getElementById('viz-panel').getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - panel.left + 12) + 'px')
        .style('top',  (event.clientY - panel.top  - 30) + 'px');
    })
    .on('mouseleave', function() {
      lineEls.attr('opacity', 1).attr('stroke-width', d => 1.2 + Math.abs(d.delta) / 11);
      tooltip.classed('visible', false);
    });

  // ── UPDATE ─────────────────────────────────────────────
  let animated = false;

  return function updateSlope(step) {
    if (step === '4') {
      g.transition().duration(400).attr('opacity', 1);
      lineEls.attr('opacity', 0);
      leftLabels.selectAll('text').attr('opacity', 0);
      rightLabels.selectAll('text').attr('opacity', 0);
      callout.attr('opacity', 0);
      animated = false;
      return;
    }

    if (step === '5') {
      g.transition().duration(400).attr('opacity', 1);
      if (!animated) {
        animated = true;
        lineEls
          .attr('opacity', 1)
          .transition()
          .duration(800)
          .delay((d, i) => i * 20)
          .ease(d3.easeCubicInOut)
          .attr('stroke-dashoffset', 0);
        leftLabels.selectAll('text')
          .transition().delay((d, i) => i * 20 + 820).duration(200).attr('opacity', 1);
        rightLabels.selectAll('text')
          .transition().delay((d, i) => i * 20 + 820).duration(200).attr('opacity', 1);
        callout.transition().delay(1200).duration(500).attr('opacity', 1);
      }
    }
  };
}

function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}
