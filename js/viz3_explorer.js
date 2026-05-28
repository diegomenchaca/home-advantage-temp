export function initExplorer(svg, data) {
  const VW = 700, VH = 500;
  const margin = { top: 50, right: 30, bottom: 70, left: 70 };
  const W = VW - margin.left - margin.right;
  const H = VH - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('class', 'viz3-group')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('opacity', 0);

  const colorWin  = '#2d6a4f';
  const colorLoss = '#c1440e';
  const colorNeu  = '#8d8d8d';

  const maxRank = d3.max(data, d => Math.max(d.elo_rank, d.finish_rank));

  const x = d3.scaleLinear().domain([1, maxRank]).range([0, W]);
  const y = d3.scaleLinear().domain([1, maxRank]).range([0, H]);

  // ── AXES ───────────────────────────────────────────────
  const xAxis = d3.axisBottom(x).ticks(6).tickSize(-H).tickPadding(8);
  const yAxis = d3.axisLeft(y).ticks(6).tickSize(-W).tickPadding(8);

  const gx = g.append('g').attr('class', 'axis').attr('transform', `translate(0,${H})`).call(xAxis);
  gx.select('.domain').remove();
  gx.selectAll('line').attr('stroke', 'var(--color-border)').attr('stroke-dasharray', '2,3');
  gx.selectAll('text').attr('font-family', 'var(--font-sans)').attr('font-size', '0.65rem').attr('fill', 'var(--color-muted)');

  const gy = g.append('g').attr('class', 'axis').call(yAxis);
  gy.select('.domain').remove();
  gy.selectAll('line').attr('stroke', 'var(--color-border)').attr('stroke-dasharray', '2,3');
  gy.selectAll('text').attr('font-family', 'var(--font-sans)').attr('font-size', '0.65rem').attr('fill', 'var(--color-muted)');

  // axis labels
  g.append('text')
    .attr('x', W / 2).attr('y', H + 48).attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem').attr('fill', 'var(--color-muted)')
    .text('Elo rank before tournament (1 = best)');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -H / 2).attr('y', -52).attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem').attr('fill', 'var(--color-muted)')
    .text('Actual finish rank (1 = best)');

  // ── DIAGONAL REFERENCE LINE ─────────────────────────────
  g.append('line')
    .attr('x1', x(1)).attr('y1', y(1))
    .attr('x2', x(maxRank)).attr('y2', y(maxRank))
    .attr('stroke', 'var(--color-border)').attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '5,4');

  g.append('text')
    .attr('x', x(maxRank) - 8).attr('y', y(maxRank) - 6)
    .attr('text-anchor', 'end')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.62rem').attr('fill', 'var(--color-muted)')
    .text('performed as expected');

  // ── DOTS ───────────────────────────────────────────────
  const tooltip = d3.select('#tooltip');

  const dots = g.selectAll('.dot')
    .data(data)
    .join('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.elo_rank))
    .attr('cy', d => y(d.finish_rank))
    .attr('r', 6)
    .attr('fill', d => d.delta > 0 ? colorWin : d.delta < 0 ? colorLoss : colorNeu)
    .attr('opacity', 0.85)
    .attr('stroke', 'var(--color-bg)')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer');

  // ── ANNOTATE OUTLIERS ──────────────────────────────────
  const annotated = [
    { country: 'South Korea', year: 2002, dx: 6, dy: -12 },
    { country: 'Argentina',   year: 1978, dx: 6, dy: -12 },
    { country: 'South Africa',year: 2010, dx: 6, dy:  14 },
    { country: 'USA',         year: 1994, dx: 6, dy:  14 },
  ];

  annotated.forEach(({ country, year, dx, dy }) => {
    const d = data.find(d => d.country === country && d.year === year);
    if (!d) return;
    g.append('text')
      .attr('x', x(d.elo_rank) + dx)
      .attr('y', y(d.finish_rank) + dy)
      .attr('font-family', 'var(--font-sans)')
      .attr('font-size', '0.65rem')
      .attr('fill', 'var(--color-text)')
      .text(`${d.country} '${String(d.year).slice(2)}`);
  });

  // ── HOVER ──────────────────────────────────────────────
  dots
    .on('mouseover', function(event, d) {
      dots.attr('opacity', 0.2);
      d3.select(this).attr('opacity', 1).attr('r', 8);
      const sign = d.delta > 0 ? '+' : '';
      tooltip.classed('visible', true)
        .html(`<strong>${d.country} ${d.year}</strong><br/>Elo rank: ${d.elo_rank}<br/>Finish: ${d.finish_label}<br/>Δ ${sign}${d.delta}`);
    })
    .on('mousemove', function(event) {
      const panel = document.getElementById('viz-panel').getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - panel.left + 12) + 'px')
        .style('top',  (event.clientY - panel.top  - 30) + 'px');
    })
    .on('mouseleave', function() {
      dots.attr('opacity', 0.85).attr('r', 6);
      tooltip.classed('visible', false);
    });

  // ── LEGEND ──────────────────────────────────────────────
  const legendData = [
    { label: 'Exceeded expectations', color: colorWin },
    { label: 'Met expectations',      color: colorNeu },
    { label: 'Underperformed',        color: colorLoss },
  ];
  const legend = g.append('g').attr('transform', `translate(${W - 185}, 4)`);
  legendData.forEach((d, i) => {
    legend.append('circle').attr('cx', 6).attr('cy', i * 18).attr('r', 5).attr('fill', d.color);
    legend.append('text').attr('x', 16).attr('y', i * 18 + 4)
      .attr('font-family', 'var(--font-sans)').attr('font-size', '0.65rem')
      .attr('fill', 'var(--color-muted)').text(d.label);
  });

  // ── UPDATE ─────────────────────────────────────────────
  return function updateExplorer() {
    g.transition().duration(600).attr('opacity', 1);
  };
}
