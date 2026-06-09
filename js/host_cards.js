const CARDS = [
  {
    flag: '🇰🇷', country: 'South Korea', year: '2002',
    elo: '16th of 32', finish: '4th Place', delta: '+12', tournament: '2002 WC',
    results: [
      { text: 'KOR 2–1 ITA  ·  Round of 16', upset: true },
      { text: 'KOR 0–0 ESP, won 5–3p  ·  Quarter-final', upset: true },
      { text: 'KOR 0–1 GER  ·  Semi-final', upset: false },
    ],
    note: 'Ranked 16th of 32, yet eliminated both Italy and Spain on home soil. Placed 12 positions above their Elo prediction.',
  },
  {
    flag: '🇦🇷', country: 'Argentina', year: '1978',
    elo: '8th of 16', finish: 'Champion', delta: '+7', tournament: '1978 WC',
    results: [
      { text: 'ARG 6–0 PER  ·  2nd Round', upset: false },
      { text: 'ARG 3–1 NED  ·  Final (AET)', upset: true },
    ],
    note: 'Ranked 8th of 16 before the tournament. Won the whole thing.',
  },
  {
    flag: '🇸🇪', country: 'Sweden', year: '1958',
    elo: '11th of 16', finish: 'Runner-up', delta: '+9', tournament: '1958 WC',
    results: [
      { text: 'SWE 3–1 FRG  ·  Semi-final', upset: true },
      { text: 'SWE 2–5 BRA  ·  Final', upset: false },
    ],
    note: "Sweden's best World Cup finish, far above their pre-tournament prediction.",
  },
  {
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', year: '1966',
    elo: '5th of 16', finish: 'Champion', delta: '+4', tournament: '1966 WC',
    results: [
      { text: 'ENG 1–0 ARG  ·  Quarter-final', upset: false },
      { text: 'ENG 4–2 GER  ·  Final (AET)', upset: false },
    ],
    note: 'England have never won the World Cup except the one time they hosted it.',
  },
  {
    flag: '🇷🇺', country: 'Russia', year: '2018',
    elo: '27th of 32', finish: 'Quarterfinal', delta: '+19', tournament: '2018 WC',
    results: [
      { text: 'RUS 1–1 ESP, won 4–3p  ·  Round of 16', upset: true },
      { text: 'RUS 2–2 CRO, lost 3–4p  ·  Quarterfinal', upset: false },
    ],
    note: 'Ranked nearly dead last and reached the quarterfinal. The largest host premium ever recorded.',
  },
  {
    flag: '🇨🇱', country: 'Chile', year: '1962',
    elo: '13th of 16', finish: '3rd Place', delta: '+10', tournament: '1962 WC',
    results: [
      { text: 'CHI 2–1 USSR  ·  Quarterfinal', upset: true },
      { text: 'CHI 1–0 YUG  ·  3rd Place Match', upset: false },
    ],
    note: 'Reached the third-place match at home, ten positions above what their Elo predicted.',
  },
];

const TOTAL = CARDS.length;
let current = 0;
let isFlipping = false;

const section   = document.getElementById('host-cards-section');
const card      = document.getElementById('host-card');
const flipBtn   = document.getElementById('card-flip-btn');
const dotsEl    = document.getElementById('card-dots');

// ── BUILD DOTS ─────────────────────────────────────────
const dots = Array.from({ length: TOTAL }, (_, i) => {
  const d = document.createElement('div');
  d.className = 'card-dot' + (i === 0 ? ' active' : '');
  dotsEl.appendChild(d);
  return d;
});

// ── RENDER CARD CONTENT ────────────────────────────────
function renderCard(idx) {
  const c = CARDS[idx];
  document.getElementById('card-flag').textContent      = c.flag;
  document.getElementById('card-country').textContent   = c.country;
  document.getElementById('card-year').textContent      = c.year;
  document.getElementById('card-elo').textContent       = c.elo;
  document.getElementById('card-finish').textContent    = c.finish;
  document.getElementById('card-tournament').textContent = c.tournament;

  const deltaEl = document.getElementById('card-delta');
  deltaEl.textContent = c.delta;
  const isNeg = c.delta.startsWith('−') || c.delta.startsWith('-');
  const isPos = c.delta.startsWith('+');
  deltaEl.className = 'card-stat-value card-delta-value' + (isPos ? ' positive' : isNeg ? ' negative' : '');

  const resultsEl = document.getElementById('card-results');
  resultsEl.innerHTML = c.results.map(r => {
    if (r.upset) {
      const parts = r.text.split('UPSET');
      return `<div>${parts[0]}<span class="upset">UPSET</span>${parts[1] || ''}</div>`;
    }
    return `<div>${r.text}</div>`;
  }).join('');

  document.getElementById('card-note').textContent = c.note;

  // flip button: hide on last card or show spread icon
  if (idx === TOTAL - 1) {
    flipBtn.innerHTML = '&#8596;';
    flipBtn.setAttribute('aria-label', 'Spread all cards');
  } else {
    flipBtn.innerHTML = '&#8594;';
    flipBtn.setAttribute('aria-label', 'Next card');
  }

  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

// ── FLIP ANIMATION ─────────────────────────────────────
function flipTo(nextIdx, onComplete) {
  if (isFlipping) return;
  isFlipping = true;

  // Phase 1: rotate to edge (90deg)
  card.style.transition = 'transform 0.2s ease-in';
  card.style.transform  = 'rotateY(90deg)';

  setTimeout(() => {
    // Swap content while invisible
    renderCard(nextIdx);

    // Start from -90deg so it comes in from opposite side
    card.style.transition = 'none';
    card.style.transform  = 'rotateY(-90deg)';

    // Force reflow
    card.getBoundingClientRect();

    // Phase 2: rotate back to face (0deg)
    card.style.transition = 'transform 0.25s ease-out';
    card.style.transform  = 'rotateY(0deg)';

    card.addEventListener('transitionend', function handler() {
      card.removeEventListener('transitionend', handler);
      isFlipping = false;
      if (onComplete) onComplete();
    });
  }, 200);
}

// ── SPREAD ANIMATION ───────────────────────────────────
function triggerSpread() {
  if (section.classList.contains('spread-mode')) return;

  const rightCol = section.querySelector('.host-cards-right');

  // 1. Fade out right column
  rightCol.style.transition = 'opacity 0.3s';
  rightCol.style.opacity = '0';

  // 2. Scale down current card slightly
  setTimeout(() => {
    card.style.transition = 'transform 0.2s ease';
    card.style.transform = 'scale(0.9)';
  }, 100);

  // 3. After 600ms, build spread layout
  setTimeout(() => {
    card.style.transition = '';
    card.style.transform  = '';

    // Rebuild grid into spread layout:
    // Create 5 extra card wrappers for the other cards
    const grid = section.querySelector('.host-cards-grid');

    // Make copies for each card (current left col already holds card 0 rendered)
    // First re-render card 0 in the existing left col slot
    renderCard(0);

    // Create remaining left-col containers for cards 1–5
    const extras = CARDS.slice(1).map((_, i) => {
      const idx = i + 1;
      const col = document.createElement('div');
      col.className = 'host-cards-left';
      col.style.opacity = '0';
      col.style.transform = 'translateX(-40px)';

      const flipper = document.createElement('div');
      flipper.className = 'card-flipper';

      const clone = document.createElement('div');
      clone.className = 'host-card';

      // Build card HTML inline
      const c = CARDS[idx];
      const isNeg = c.delta.startsWith('−') || c.delta.startsWith('-');
      const isPos = c.delta.startsWith('+');
      const deltaClass = isPos ? 'positive' : isNeg ? 'negative' : '';
      clone.innerHTML = `
        <div class="card-header">
          <div class="hd-text">
            <span class="card-country">${c.country}</span>
            <span class="card-year">${c.year}</span>
          </div>
          <span class="card-flag">${c.flag}</span>
        </div>
        <div class="card-body">
          <div class="card-stats">
            <div class="card-stat-cell">
              <div class="card-stat-label">ELO RANK</div>
              <div class="card-stat-value">${c.elo}</div>
            </div>
            <div class="card-stat-cell">
              <div class="card-stat-label">FINISHED</div>
              <div class="card-stat-value">${c.finish}</div>
            </div>
            <div class="card-stat-cell">
              <div class="card-stat-label">DELTA</div>
              <div class="card-stat-value card-delta-value ${deltaClass}">${c.delta}</div>
            </div>
            <div class="card-stat-cell">
              <div class="card-stat-label">TOURNAMENT</div>
              <div class="card-stat-value">${c.tournament}</div>
            </div>
          </div>
          <hr class="card-divider"/>
          <div class="card-results">${c.results.map(r => {
            if (r.upset) {
              const parts = r.text.split('UPSET');
              return `<div>${parts[0]}<span class="upset">UPSET</span>${parts[1] || ''}</div>`;
            }
            return `<div>${r.text}</div>`;
          }).join('')}</div>
          <p class="card-note">${c.note}</p>
        </div>
      `;

      flipper.appendChild(clone);
      col.appendChild(flipper);
      grid.appendChild(col);
      return col;
    });

    // Fade dots
    dotsEl.style.transition = 'opacity 0.3s';
    dotsEl.style.opacity = '0';

    // Activate spread mode (triggers CSS overrides)
    section.classList.add('spread-mode');

    // Animate card 0 (existing)
    const leftCol0 = grid.querySelector('.host-cards-left');
    leftCol0.style.transition = 'none';
    leftCol0.style.opacity = '0';
    leftCol0.style.transform = 'translateX(-40px)';
    leftCol0.getBoundingClientRect();
    leftCol0.style.transition = 'opacity 0.38s ease-out, transform 0.38s ease-out';
    leftCol0.style.opacity = '1';
    leftCol0.style.transform = 'translateX(0)';

    // Stagger the other 5
    extras.forEach((col, i) => {
      setTimeout(() => {
        col.style.transition = 'opacity 0.38s ease-out, transform 0.38s ease-out';
        col.style.opacity = '1';
        col.style.transform = 'translateX(0)';
      }, (i + 1) * 60);
    });
  }, 600);
}

// ── CLICK HANDLERS ─────────────────────────────────────
function advance() {
  if (isFlipping) return;
  if (current === TOTAL - 1) {
    triggerSpread();
    return;
  }
  const next = current + 1;
  flipTo(next, () => { current = next; });
}

card.addEventListener('click', advance);
flipBtn.addEventListener('click', e => { e.stopPropagation(); advance(); });

// Arrow key support when section is in view
document.addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight') return;
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) advance();
});

// ── SPREAD HOVER (tilt + neighbour push) ───────────────
function resetAllCards(cols) {
  cols.forEach(col => {
    col.style.zIndex = '';
    const card = col.querySelector('.host-card');
    if (!card) return;
    card.style.transition = 'transform 0.45s ease-out, box-shadow 0.3s ease-out';
    card.style.transform  = '';
    card.style.boxShadow  = '';
  });
}

(function setupSpreadHover() {
  let lastHovIdx = -1;

  section.addEventListener('mousemove', e => {
    if (isFlipping) return;

    const isSingle = !section.classList.contains('spread-mode');
    const allCols  = [...section.querySelectorAll('.host-cards-left')];
    const cardEl   = e.target.closest('.host-card');

    if (!cardEl) {
      if (lastHovIdx !== -1) { resetAllCards(allCols); lastHovIdx = -1; }
      return;
    }

    const colEl  = cardEl.closest('.host-cards-left');
    const hovIdx = allCols.indexOf(colEl);
    if (hovIdx === -1) return;
    lastHovIdx = hovIdx;

    const rect = cardEl.getBoundingClientRect();
    const nx   = (e.clientX - rect.left) / rect.width  - 0.5;
    const ny   = (e.clientY - rect.top)  / rect.height - 0.5;
    const tiltY =  nx * 16;
    const tiltX = -ny * 16;

    allCols.forEach((col, i) => {
      const card    = col.querySelector('.host-card');
      if (!card) return;
      const dist    = i - hovIdx;
      const absDist = Math.abs(dist);

      if (dist === 0) {
        col.style.zIndex = '10';
        card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease-out';
        card.style.transform  = `perspective(800px) scale(${isSingle ? 1.03 : 1.07}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        card.style.boxShadow  = '0 14px 36px rgba(80,60,20,0.24), 0 32px 64px rgba(80,60,20,0.18)';
      } else {
        const push  = Math.sign(dist) * (absDist === 1 ? 14 : absDist === 2 ? 8 : 4);
        const scale = 1 - absDist * 0.015;
        col.style.zIndex = '1';
        card.style.transition = 'transform 0.25s ease-out, box-shadow 0.2s ease-out';
        card.style.transform  = `translateX(${push}px) scale(${scale})`;
        card.style.boxShadow  = '';
      }
    });
  });

  section.addEventListener('mouseleave', () => {
    lastHovIdx = -1;
    resetAllCards([...section.querySelectorAll('.host-cards-left')]);
  });
})();

// ── INIT ───────────────────────────────────────────────
renderCard(0);
