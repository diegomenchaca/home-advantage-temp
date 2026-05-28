export function initBars(svg, data) {
  const VW = 700, VH = 500;
  const margin = { top: 60, right: 160, bottom: 50, left: 160 };
  const W = VW - margin.left - margin.right;
  const H = VH - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('class', 'viz1-group')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const rows = [
    { key: 'neutral', label: 'Neutral venue',  ...data[0] },
    { key: 'home',    label: 'Home venue',      ...data[1] },
    { key: 'host',    label: 'World Cup host',  ...data[2] },
  ];

  const y = d3.scaleBand()
    .domain(rows.map(r => r.key))
    .range([0, H])
    .padding(0.38);

  const x = d3.scaleLinear().domain([0, 1]).range([0, W]);

  const colorWin  = getComputedStyle(document.documentElement).getPropertyValue('--color-win').trim()  || '#2d6a4f';
  const colorDraw = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral').trim() || '#8d8d8d';
  const colorLoss = getComputedStyle(document.documentElement).getPropertyValue('--color-loss').trim() || '#c1440e';

  function barOpacity(rowKey, step) {
    if (step === '1') return rowKey === 'neutral' ? 1 : 0;
    if (step === '2') return rowKey === 'host' ? 0 : 1;
    if (step === '3' || step === '4') return 1;
    return 1;
  }

  function groupOpacity(step) {
    return step === '4' ? 0.2 : 1;
  }

  // ── ROW GROUPS ──────────────────────────────────────────
  const rowGroups = g.selectAll('.bar-row')
    .data(rows)
    .join('g')
    .attr('class', 'bar-row')
    .attr('transform', d => `translate(0,${y(d.key)})`)
    .attr('opacity', 0);

  // stacked segments: win | draw | loss
  function buildSegments(grp) {
    const seg = [
      { field: 'win',  color: colorWin },
      { field: 'draw', color: colorDraw },
      { field: 'loss', color: colorLoss },
    ];
    seg.forEach(({ field, color }) => {
      grp.append('rect')
        .attr('class', `seg-${field}`)
        .attr('x', function(d) {
          const prev = field === 'win' ? 0 : field === 'draw' ? d.win : d.win + d.draw;
          return x(prev);
        })
        .attr('y', 0)
        .attr('height', y.bandwidth())
        .attr('width', 0)
        .attr('fill', color);
    });
  }
  buildSegments(rowGroups);

  // row labels (left)
  rowGroups.append('text')
    .attr('x', -8)
    .attr('y', y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('font-family', 'var(--font-sans)')
    .attr('font-size', '0.78rem')
    .attr('fill', 'var(--color-text)')
    .text(d => d.label);

  // win-rate labels (right)
  rowGroups.append('text')
    .attr('class', 'win-label')
    .attr('x', d => x(d.win) + 6)
    .attr('y', y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-family', 'var(--font-sans)')
    .attr('font-size', '0.78rem')
    .attr('fill', colorWin)
    .attr('font-weight', 500)
    .attr('opacity', 0)
    .text(d => `${(d.win * 100).toFixed(1)}% wins`);

  // ── LEGEND ──────────────────────────────────────────────
  const legendData = [
    { label: 'Win',  color: colorWin },
    { label: 'Draw', color: colorDraw },
    { label: 'Loss', color: colorLoss },
  ];
  const legend = g.append('g').attr('transform', `translate(0,${H + 28})`);
  legendData.forEach((d, i) => {
    const lx = i * 90;
    legend.append('rect').attr('x', lx).attr('y', 0).attr('width', 12).attr('height', 12).attr('fill', d.color);
    legend.append('text').attr('x', lx + 16).attr('y', 9)
      .attr('font-family', 'var(--font-sans)').attr('font-size', '0.72rem').attr('fill', 'var(--color-muted)')
      .text(d.label);
  });

  // ── ANNOTATION LAYER ────────────────────────────────────
  const ann = g.append('g').attr('class', 'annotations').attr('opacity', 0);

  // +6.4pp annotation (step 2)
  const homeRow = rows.find(r => r.key === 'home');
  const neutralRow = rows.find(r => r.key === 'neutral');
  const ann2 = ann.append('g').attr('class', 'ann-step2');
  const nyc = y('neutral') + y.bandwidth() / 2;
  const hyc = y('home') + y.bandwidth() / 2;
  ann2.append('line')
    .attr('x1', x(neutralRow.win)).attr('y1', nyc)
    .attr('x2', x(homeRow.win)).attr('y2', hyc)
    .attr('stroke', 'var(--color-muted)').attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3');
  ann2.append('text')
    .attr('x', x(homeRow.win) + 10).attr('y', (nyc + hyc) / 2)
    .attr('dy', '0.35em').attr('font-family', 'var(--font-sans)')
    .attr('font-size', '0.72rem').attr('fill', 'var(--color-muted)')
    .text('+6.4pp over neutral');

  // +16.9pp gold annotation (step 3)
  const hostRow = rows.find(r => r.key === 'host');
  const ann3 = ann.append('g').attr('class', 'ann-step3').attr('opacity', 0);
  const nycB = y('neutral') + y.bandwidth() / 2;
  const hycB = y('host') + y.bandwidth() / 2;
  ann3.append('line')
    .attr('x1', x(neutralRow.win) + 4).attr('y1', nycB)
    .attr('x2', x(hostRow.win) + 4).attr('y2', hycB)
    .attr('stroke', 'var(--color-accent)').attr('stroke-width', 1.5);
  ann3.append('text')
    .attr('x', x(hostRow.win) + 12).attr('y', (nycB + hycB) / 2)
    .attr('dy', '0.35em').attr('font-family', 'var(--font-sans)')
    .attr('font-size', '0.78rem').attr('fill', 'var(--color-accent)')
    .attr('font-weight', 500).text('+16.9pp');

  // ── UPDATE FUNCTION ──────────────────────────────────────
  let currentStep = null;

  function animateBarsIn(rowKey) {
    const grp = rowGroups.filter(d => d.key === rowKey);
    grp.transition().duration(300).attr('opacity', 1);
    ['win', 'draw', 'loss'].forEach(field => {
      grp.select(`.seg-${field}`)
        .transition().duration(600).ease(d3.easeCubicOut)
        .attr('width', d => {
          const w = field === 'win' ? d.win : field === 'draw' ? d.draw : d.loss;
          return x(w);
        });
    });
    grp.select('.win-label').transition().delay(700).duration(200).attr('opacity', 1);
  }

  return function updateBars(step) {
    if (step === currentStep) return;
    const prev = currentStep;
    currentStep = step;

    const gOpacity = step === '4' ? 0.2 : 1;
    g.transition().duration(400).attr('opacity', gOpacity);

    if (step === '1') {
      if (prev === null) animateBarsIn('neutral');
    }
    if (step === '2' && prev !== '3') {
      animateBarsIn('home');
      ann.transition().duration(300).attr('opacity', 1);
      ann.select('.ann-step3').transition().duration(200).attr('opacity', 0);
    }
    if (step === '3') {
      animateBarsIn('neutral');
      animateBarsIn('home');
      animateBarsIn('host');
      ann.transition().duration(300).attr('opacity', 1);
      ann.select('.ann-step3').transition().delay(700).duration(400).attr('opacity', 1);
    }
    if (step === '4') {
      ann.transition().duration(300).attr('opacity', 0);
    }
    // going backward
    if (step === '1' && prev !== null) {
      rowGroups.filter(d => d.key !== 'neutral').transition().duration(300).attr('opacity', 0);
      rowGroups.filter(d => d.key !== 'neutral').selectAll('rect').transition().duration(300).attr('width', 0);
      rowGroups.filter(d => d.key !== 'neutral').select('.win-label').attr('opacity', 0);
      ann.transition().duration(200).attr('opacity', 0);
    }
  };
}
