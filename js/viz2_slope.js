export const HOSTS = [
  { year:1930, country:'Uruguay',     abbr:'URU',  elo:2,  n:13, finLevel:0, fin_rank:1,  delta:1   },
  { year:1934, country:'Italy',       abbr:'ITA',  elo:2,  n:16, finLevel:0, fin_rank:1,  delta:1   },
  { year:1938, country:'France',      abbr:'FRA',  elo:9,  n:15, finLevel:4, fin_rank:8,  delta:1   },
  { year:1950, country:'Brazil',      abbr:'BRA',  elo:3,  n:13, finLevel:1, fin_rank:2,  delta:1   },
  { year:1954, country:'Switzerland', abbr:'SUI',  elo:14, n:16, finLevel:4, fin_rank:8,  delta:6   },
  { year:1958, country:'Sweden',      abbr:'SWE',  elo:11, n:16, finLevel:1, fin_rank:2,  delta:9   },
  { year:1962, country:'Chile',       abbr:'CHI',  elo:13, n:16, finLevel:2, fin_rank:3,  delta:10  },
  { year:1966, country:'England',     abbr:'ENG',  elo:5,  n:16, finLevel:0, fin_rank:1,  delta:4   },
  { year:1970, country:'Mexico',      abbr:'MEX',  elo:13, n:16, finLevel:4, fin_rank:8,  delta:5   },
  { year:1974, country:'W. Germany',  abbr:'GER',  elo:2,  n:16, finLevel:0, fin_rank:1,  delta:1   },
  { year:1978, country:'Argentina',   abbr:'ARG',  elo:8,  n:16, finLevel:0, fin_rank:1,  delta:7   },
  { year:1982, country:'Spain',       abbr:'ESP',  elo:12, n:24, finLevel:5, fin_rank:12, delta:0   },
  { year:1986, country:'Mexico',      abbr:'MEX',  elo:14, n:24, finLevel:4, fin_rank:8,  delta:6   },
  { year:1990, country:'Italy',       abbr:'ITA',  elo:3,  n:24, finLevel:2, fin_rank:3,  delta:0   },
  { year:1994, country:'USA',         abbr:'USA',  elo:23, n:24, finLevel:5, fin_rank:16, delta:7   },
  { year:1998, country:'France',      abbr:'FRA',  elo:4,  n:32, finLevel:0, fin_rank:1,  delta:3   },
  { year:2002, country:'S. Korea',    abbr:'KOR',  elo:16, n:32, finLevel:3, fin_rank:4,  delta:12, xOff:8  },
  { year:2002, country:'Japan',       abbr:'JPN',  elo:10, n:32, finLevel:5, fin_rank:16, delta:-6, xOff:-8 },
  { year:2006, country:'Germany',     abbr:'GER',  elo:10, n:32, finLevel:2, fin_rank:3,  delta:7   },
  { year:2010, country:'S. Africa',   abbr:'ZAF',  elo:32, n:32, finLevel:6, fin_rank:25, delta:7   },
  { year:2014, country:'Brazil',      abbr:'BRA',  elo:1,  n:32, finLevel:3, fin_rank:4,  delta:-3  },
  { year:2018, country:'Russia',      abbr:'RUS',  elo:27, n:32, finLevel:4, fin_rank:8,  delta:19  },
  { year:2022, country:'Qatar',       abbr:'QAT',  elo:27, n:32, finLevel:6, fin_rank:25, delta:2   },
];

const LABELLED = new Set(['ARG-1978','KOR-2002','SWE-1958','CHI-1962','ENG-1966','BRA-2014','JPN-2002','ESP-1982','ITA-1990','RUS-2018']);

const HIGHLIGHT = {
  '5.2': new Set(['SWE-1958','CHI-1962','KOR-2002','RUS-2018']),
  '5.3': new Set(['BRA-2014','JPN-2002','ESP-1982','ITA-1990']),
};

// Addition 4: story notes for annotated glyphs
const STORY_NOTES = {
  'ARG-1978': 'Ranked 8th of 16 — won it on home soil.',
  'KOR-2002': 'Beat Italy and Spain on the way to the semis.',
  'SWE-1958': "Ranked 11th of 16 — reached the final on home soil.",
  'CHI-1962': 'Ranked 13th of 16 — finished 3rd on home soil.',
  'RUS-2018': 'Ranked 27th of 32 — reached the quarterfinal on home soil.',
  'ENG-1966': 'The only World Cup England have ever won.',
  'BRA-2014': 'Lost 7–1 to Germany in their own stadium.',
  'JPN-2002': 'Ranked 10th of 32 as co-host — exited in the Round of 16.',
  'ITA-1990': 'Ranked 3rd — finished 3rd. Met expectations exactly.',
  'ESP-1982': 'Ranked 12th — failed to score in two second-round games.',
};

const C_WIN  = '#2d6a4f';
const C_LOSS = '#c1440e';
const C_NEU  = '#8d8d8d';

export const SLOPE_M = { top: 50, bottom: 80, left: 60, right: 60 };

export function initSlope(svg, _unusedData) {
  const VW = 680, VH = 420;
  const M  = SLOPE_M;
  const W  = VW - M.left - M.right;
  const H  = VH - M.top  - M.bottom;

  svg.attr('viewBox', `0 0 ${VW} ${VH}`);

  const g = svg.append('g')
    .attr('class', 'viz2-group')
    .attr('transform', `translate(${M.left},${M.top})`)
    .attr('opacity', 0);

  const xScale = d3.scaleLinear().domain([1926, 2026]).range([0, W]);
  const yScale = d3.scaleLinear().domain([0, 1.1]).range([0, H]);

  // Precompute norms and color for each host
  HOSTS.forEach(d => {
    d.eloNorm = (d.elo - 1) / 31;
    d.finNorm = (d.fin_rank - 1) / 31;
    d.color   = d.delta > 0 ? C_WIN : d.delta < 0 ? C_LOSS : C_NEU;
    d.key     = `${d.abbr}-${d.year}`;
    d.cx      = xScale(d.year) + (d.xOff || 0);
    d.yElo    = yScale(d.eloNorm);
    d.yFin    = yScale(d.finNorm);
    d.strokeW = 1.5 + Math.abs(d.delta) / 31 * 9;
  });

  // ── Y-AXIS LABELS ──────────────────────────────────────
  const yLabels = [
    { label: 'Champion',     v: 0.000 },
    { label: 'Quarterfinal', v: 0.226 },
    { label: 'R16',          v: 0.484 },
    { label: 'Group Stage',  v: 0.774 },
  ];
  yLabels.forEach(({ label, v }) => {
    g.append('text')
      .attr('class', 'viz2-yaxis')
      .attr('x', -6).attr('y', yScale(v)).attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-family', 'var(--font-sans)').attr('font-size', '0.65rem')
      .attr('fill', '#bbb').text(label);
    g.append('line')
      .attr('class', 'viz2-yaxis')
      .attr('x1', 0).attr('y1', yScale(v)).attr('x2', W).attr('y2', yScale(v))
      .attr('stroke', '#1e1e1e').attr('stroke-width', 1);
  });

  // ── WWII GAP — dashed break on x-axis baseline ────────
  const gapX1 = xScale(1938) + 10;
  const gapX2 = xScale(1950) - 10;
  g.append('line')
    .attr('class', 'viz2-struct')
    .attr('x1', gapX1).attr('y1', H).attr('x2', gapX2).attr('y2', H)
    .attr('stroke', '#555').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3');

  // ── LEGEND ───────────────────────────────────────────────
  const leg = g.append('g').attr('class', 'viz2-legend').attr('transform', `translate(${W - 182}, -32)`);
  leg.append('circle').attr('cx', 6).attr('cy', 6).attr('r', 5)
    .attr('stroke', '#888').attr('fill', 'none').attr('stroke-width', 1.5);
  leg.append('text').attr('x', 16).attr('y', 10)
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.62rem').attr('fill', '#aaa')
    .text('Elo prediction');
  leg.append('circle').attr('cx', 108).attr('cy', 6).attr('r', 5).attr('fill', '#888');
  leg.append('text').attr('x', 118).attr('y', 10)
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.62rem').attr('fill', '#aaa')
    .text('Actual finish');

  // ── GLYPHS (lines + circles) ────────────────────────────
  const glyphG = g.append('g').attr('class', 'glyphs');

  const glyphData = glyphG.selectAll('.glyph')
    .data(HOSTS)
    .join('g')
    .attr('class', 'glyph')
    .attr('opacity', 0)
    .style('cursor', 'pointer');

  // connecting line
  glyphData.append('line')
    .attr('class', 'glyph-line')
    .attr('x1', d => d.cx).attr('y1', d => d.yElo)
    .attr('x2', d => d.cx).attr('y2', d => d.yFin)
    .attr('stroke', d => d.color)
    .attr('stroke-width', d => d.strokeW)
    .attr('stroke-linecap', 'round');

  // hollow Elo circle
  glyphData.append('circle')
    .attr('class', 'glyph-elo')
    .attr('cx', d => d.cx).attr('cy', d => d.yElo).attr('r', 5)
    .attr('stroke', d => d.color).attr('fill', 'transparent').attr('stroke-width', 1.5);

  // filled finish circle
  glyphData.append('circle')
    .attr('class', 'glyph-fin')
    .attr('cx', d => d.cx).attr('cy', d => d.yFin).attr('r', 5)
    .attr('fill', d => d.color);

  // lock ring — accent circle around finish dot, visible only when glyph is locked
  glyphData.append('circle')
    .attr('class', 'lock-ring')
    .attr('cx', d => d.cx).attr('cy', d => d.yFin).attr('r', 11)
    .attr('stroke', 'var(--color-accent)').attr('stroke-width', 1.5)
    .attr('fill', 'none').attr('opacity', 0);

  // invisible wider hit area
  glyphData.append('rect')
    .attr('x', d => d.cx - 10)
    .attr('y', d => Math.min(d.yElo, d.yFin) - 8)
    .attr('width', 20)
    .attr('height', d => Math.abs(d.yElo - d.yFin) + 16)
    .attr('fill', 'transparent');

  // ── PERMANENT LABELS (above glyph) ─────────────────────
  glyphData.append('text')
    .attr('class', 'glyph-label')
    .attr('x', d => d.cx)
    .attr('y', d => Math.min(d.yElo, d.yFin) - 10)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.65rem').attr('font-weight', 1000)
    .attr('fill', d => d.color)
    .attr('visibility', d => LABELLED.has(d.key) ? 'visible' : 'hidden')
    .text(d => d.abbr);

  // ── X-AXIS YEAR LABELS ─────────────────────────────────
  g.append('g').attr('class', 'year-labels')
    .selectAll('text')
    .data(HOSTS)
    .join('text')
    .attr('x', d => d.cx)
    .attr('y', H + 3.5)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '0.62rem').attr('fill', '#aaa')
    .text(d => `'${String(d.year).slice(2)}`);

  // ── TOOLTIP ────────────────────────────────────────────
  let tip = document.getElementById('delta-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'delta-tooltip';
    tip.style.cssText = [
      'position:absolute', 'background:#111', 'padding:0.4rem 0.6rem',
      'font-family:var(--font-sans)', 'font-size:0.65rem', 'color:#ccc',
      'line-height:1.6', 'pointer-events:none', 'opacity:0',
      'transition:opacity 0.1s', 'max-width:200px', 'z-index:20',
      'border-radius:0',
    ].join(';');
    document.getElementById('viz-panel').appendChild(tip);
  }

  // ── ERA FILTER (Addition 3) ─────────────────────────────
  let eraFilter = document.getElementById('era-filter');
  if (!eraFilter) {
    eraFilter = document.createElement('div');
    eraFilter.id = 'era-filter';
    const vizPanel = document.getElementById('viz-panel');
    const vizWrap  = document.getElementById('viz-wrap');
    vizPanel.insertBefore(eraFilter, vizWrap);

    const ERA_BTNS = [
      { label: 'All eras',   era: 'all'       },
      { label: 'Pre-1974',   era: 'pre1974'   },
      { label: '1974–2002', era: '1974-2002' },
      { label: '2006–2022', era: '2006-2022' },
    ];
    const ERA_NOTES = {
      'pre1974':   '13–16 team fields, pre-professional rosters, and limited global competition defined this period.',
      '1974-2002': 'The transitional era — the field expanded from 16 to 32 teams as the sport went fully professional.',
      '2006-2022': 'The stable modern format: 32 teams, unchanged since 1998, under full commercial globalization.',
    };

    const eraNote = document.createElement('p');
    eraNote.id = 'era-note';

    ERA_BTNS.forEach(({ label, era }) => {
      const btn = document.createElement('button');
      btn.className = 'era-btn' + (era === 'all' ? ' active' : '');
      btn.dataset.era = era;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.era-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeEra = era;
        eraNote.textContent = ERA_NOTES[era] || '';
        eraNote.style.display = era === 'all' ? 'none' : 'block';
        applyAllOpacities(200);
      });
      eraFilter.appendChild(btn);
    });

    eraFilter.appendChild(eraNote);
  }

  // ── STATE ──────────────────────────────────────────────
  const finLabels = ['Champion','Runner-up','3rd Place','4th Place','Quarterfinal','Round of 16','Group Stage'];
  function sign(v) { return v > 0 ? '+' : ''; }

  let lockedKey   = null;
  let activeEra   = 'all';
  let currentKeys = null;
  let initialised = false;
  let currentStep = null;

  function isInEra(year, era) {
    if (era === 'all')       return true;
    if (era === 'pre1974')   return year <= 1970;
    if (era === '1974-2002') return year >= 1974 && year <= 2002;
    if (era === '2006-2022') return year >= 2006;
    return true;
  }

  function applyAllOpacities(dur) {
    glyphData.transition('state').duration(dur)
      .attr('opacity', d => {
        if (lockedKey !== null) return d.key === lockedKey ? 1 : 0.08;
        if (activeEra !== 'all' && !isInEra(d.year, activeEra)) return 0.06;
        return (!currentKeys || currentKeys.has(d.key)) ? 0.9 : 0.08;
      });
    glyphData.select('.glyph-elo').transition('state').duration(dur)
      .attr('r', d => {
        if (lockedKey !== null) return d.key === lockedKey ? 7 : 5;
        if (activeEra !== 'all' && !isInEra(d.year, activeEra)) return 5;
        return (!currentKeys || currentKeys.has(d.key)) ? 7 : 5;
      });
    glyphData.select('.glyph-fin').transition('state').duration(dur)
      .attr('r', d => {
        if (lockedKey !== null) return d.key === lockedKey ? 7 : 5;
        if (activeEra !== 'all' && !isInEra(d.year, activeEra)) return 5;
        return (!currentKeys || currentKeys.has(d.key)) ? 7 : 5;
      });
    glyphData.select('.glyph-line').transition('state').duration(dur)
      .attr('stroke-width', d => {
        if (lockedKey !== null) return d.key === lockedKey ? d.strokeW + 1.5 : d.strokeW;
        if (activeEra !== 'all' && !isInEra(d.year, activeEra)) return d.strokeW;
        return (!currentKeys || currentKeys.has(d.key)) ? d.strokeW + 1.5 : d.strokeW;
      });
  }

  function buildTipHTML(d) {
    const note = STORY_NOTES[d.key];
    tip.style.maxWidth = note ? '220px' : '200px';
    const noteLine = note
      ? `<div style="margin-top:4px;padding-top:4px;border-top:1px solid #222;font-style:italic;font-size:0.6rem;color:#666">${note}</div>`
      : '';
    return `<strong>${d.country} · ${d.year}</strong><br/>Elo ${d.elo} &rarr; ${finLabels[d.finLevel]} &nbsp; Δ${d.delta > 0 ? '+' : ''}${d.delta}${noteLine}`;
  }

  function unlock() {
    lockedKey = null;
    glyphData.select('.lock-ring').attr('opacity', 0);
    tip.style.opacity = '0';
    applyAllOpacities(200);
  }

  // ── GLYPH INTERACTIONS ─────────────────────────────────
  glyphData
    .on('mouseover', function(event, d) {
      if (lockedKey !== null) return;
      glyphData.interrupt('state');
      glyphData.select('.glyph-elo').interrupt('state');
      glyphData.select('.glyph-fin').interrupt('state');
      glyphData.select('.glyph-line').interrupt('state');
      glyphData.attr('opacity', 0.08);
      d3.select(this).attr('opacity', 1);
      d3.select(this).select('.glyph-elo').attr('r', 7);
      d3.select(this).select('.glyph-fin').attr('r', 7);
      tip.innerHTML = buildTipHTML(d);
      tip.style.opacity = '1';
    })
    .on('mousemove', function(event) {
      if (lockedKey !== null) return;
      const panel = document.getElementById('viz-panel').getBoundingClientRect();
      const nearRight = event.clientX - panel.left > panel.width * 0.7;
      tip.style.left = nearRight
        ? (event.clientX - panel.left - tip.offsetWidth - 12) + 'px'
        : (event.clientX - panel.left + 12) + 'px';
      tip.style.top  = (event.clientY - panel.top - 30) + 'px';
    })
    .on('mouseleave', function() {
      if (lockedKey !== null) return;
      tip.style.opacity = '0';
      applyAllOpacities(400);
    })
    .on('click', function(event, d) {
      event.stopPropagation();
      if (lockedKey === d.key) {
        unlock();
      } else {
        lockedKey = d.key;
        // Move lock ring to this glyph
        glyphData.select('.lock-ring').attr('opacity', 0);
        d3.select(this).select('.lock-ring').attr('opacity', 1);
        // Show fixed tooltip at bottom-left of viz panel
        tip.innerHTML = buildTipHTML(d);
        const panel = document.getElementById('viz-panel');
        tip.style.left = '8px';
        tip.style.top  = Math.max(0, panel.offsetHeight - 90) + 'px';
        tip.style.opacity = '1';
        applyAllOpacities(200);
      }
    });

  // Click on viz background to unlock
  g.on('click', function() {
    if (lockedKey !== null) unlock();
  });

  // ── CALLOUT STRIP ──────────────────────────────────────
  const P_STYLE = 'font-family:var(--font-serif);font-size:0.95rem;font-style:italic;font-weight:400;color:var(--color-text);line-height:1.5;max-width:480px;margin:0;';
  const N_STYLE = 'font-family:var(--font-serif);font-size:2rem;font-weight:700;color:var(--color-accent);line-height:1;';
  const L_STYLE = 'font-family:var(--font-sans);font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-muted);margin-top:0.35rem;';

  let calloutTimer = null;

  function updateCallout(stepId) {
    const strip = document.getElementById('callout-strip');
    strip.classList.remove('is-visible');
    clearTimeout(calloutTimer);
    if (stepId === '5.1') return;
    calloutTimer = setTimeout(() => {
      if (stepId === '5.2') {
        strip.innerHTML = `<p style="${P_STYLE}">Four hosts gained nine or more finishing positions on home soil.</p>`;
      } else if (stepId === '5.3') {
        strip.innerHTML = `<p style="${P_STYLE}">But the effect isn't universal.</p>`;
      } else if (stepId === '5.4') {
        strip.innerHTML = `<div style="display:flex;gap:3rem;align-items:flex-start;">
          <div>
            <div style="${N_STYLE}">21 / 23</div>
            <div style="${L_STYLE}">hosts met or exceeded<br>Elo expectation</div>
          </div>
          <div>
            <div style="${N_STYLE}">+4.35</div>
            <div style="${L_STYLE}">avg. finishing<br>positions gained</div>
          </div>
        </div>`;
      }
      strip.classList.add('is-visible');
    }, 250);
  }

  // ── UPDATE ─────────────────────────────────────────────
  return function updateSlope(step) {
    if (!['5.1','5.2','5.3','5.4','4'].includes(step)) return;

    // Release lock on step change
    if (lockedKey !== null) {
      lockedKey = null;
      glyphData.select('.lock-ring').attr('opacity', 0);
      tip.style.opacity = '0';
    }

    currentStep = step;

    // Show/hide era filter
    eraFilter.classList.toggle('visible', step !== '4');

    if (step === '4') {
      if (!initialised) glyphData.attr('opacity', 0);
      return;
    }

    if (step === '5.1') {
      currentKeys = null;
      if (!initialised) {
        initialised = true;
        glyphData.transition().duration(600).attr('opacity', 0.75);
      } else {
        applyAllOpacities(400);
      }
      updateCallout('5.1');
      return;
    }

    if (step === '5.2') {
      if (!initialised) { initialised = true; glyphData.attr('opacity', 0.75); }
      currentKeys = HIGHLIGHT['5.2'];
      applyAllOpacities(400);
      updateCallout('5.2');
      return;
    }

    if (step === '5.3') {
      if (!initialised) { initialised = true; glyphData.attr('opacity', 0.75); }
      currentKeys = HIGHLIGHT['5.3'];
      applyAllOpacities(400);
      updateCallout('5.3');
      return;
    }

    if (step === '5.4') {
      if (!initialised) { initialised = true; }
      currentKeys = null;
      applyAllOpacities(400);
      updateCallout('5.4');
      return;
    }
  };
}
