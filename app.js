/* ══════════════════════════════════════════
   ARD Life – Medien als Lebensspiel
   app.js  – game logic + immersive world engine
══════════════════════════════════════════ */

/* ─── World visual configs ─── */
const WORLDS = {
  grundwissen: {
    bg:          'linear-gradient(155deg, #1a3a1f 0%, #2a5230 55%, #1f4228 100%)',
    accent:      '#81c784',
    accentGlow:  '#4caf50',
    text:        '#e8f5e9',
    textMuted:   'rgba(232,245,233,0.55)',
    surface:     'rgba(255,255,255,0.08)',
    surfaceHov:  'rgba(255,255,255,0.14)',
    decorColor:  'rgba(129,199,132,0.22)',
    decor:       'dots',
    quizBg:      'linear-gradient(155deg, #0d1f10, #1a3a1f)',
    btnBg:       '#2e7d32',
    btnText:     '#e8f5e9',
  },
  sport: {
    bg:          'linear-gradient(155deg, #07111f 0%, #0d1e3a 55%, #0b2860 100%)',
    accent:      '#64b5f6',
    accentGlow:  '#1976d2',
    text:        '#e3f2fd',
    textMuted:   'rgba(227,242,253,0.5)',
    surface:     'rgba(255,255,255,0.06)',
    surfaceHov:  'rgba(255,255,255,0.12)',
    decorColor:  'rgba(100,181,246,0.2)',
    decor:       'lines',
    quizBg:      'linear-gradient(155deg, #04080f, #071830)',
    btnBg:       '#1565c0',
    btnText:     '#e3f2fd',
  },
  musik: {
    bg:          'linear-gradient(155deg, #0d0320 0%, #1c0840 55%, #2a1060 100%)',
    accent:      '#ce93d8',
    accentGlow:  '#9c27b0',
    text:        '#f3e5f5',
    textMuted:   'rgba(243,229,245,0.5)',
    surface:     'rgba(255,255,255,0.06)',
    surfaceHov:  'rgba(255,255,255,0.11)',
    decorColor:  'rgba(206,147,216,0.25)',
    decor:       'notes',
    quizBg:      'linear-gradient(155deg, #06010f, #15063a)',
    btnBg:       '#6a1b9a',
    btnText:     '#f3e5f5',
  },
  humor: {
    bg:          'linear-gradient(155deg, #7f1f00 0%, #c0360c 55%, #e64a19 100%)',
    accent:      '#ffcc02',
    accentGlow:  '#ff9800',
    text:        '#fff8e1',
    textMuted:   'rgba(255,248,225,0.55)',
    surface:     'rgba(255,255,255,0.1)',
    surfaceHov:  'rgba(255,255,255,0.17)',
    decorColor:  'rgba(255,204,2,0.3)',
    decor:       'stars',
    quizBg:      'linear-gradient(155deg, #3f0f00, #9f2900)',
    btnBg:       '#bf360c',
    btnText:     '#fff8e1',
  },
  geschichte: {
    bg:          'linear-gradient(155deg, #100800 0%, #2e1800 55%, #4a2800 100%)',
    accent:      '#d4a96a',
    accentGlow:  '#8d6e63',
    text:        '#fdf0d5',
    textMuted:   'rgba(253,240,213,0.5)',
    surface:     'rgba(255,200,130,0.07)',
    surfaceHov:  'rgba(255,200,130,0.13)',
    decorColor:  'rgba(212,169,106,0.14)',
    decor:       'grid',
    quizBg:      'linear-gradient(155deg, #080400, #1f1000)',
    btnBg:       '#5d4037',
    btnText:     '#fdf0d5',
  },
  kultur: {
    bg:          'linear-gradient(155deg, #040408 0%, #0b0b16 55%, #14142a 100%)',
    accent:      '#90a4ae',
    accentGlow:  '#607d8b',
    text:        '#eceff1',
    textMuted:   'rgba(236,239,241,0.45)',
    surface:     'rgba(255,255,255,0.04)',
    surfaceHov:  'rgba(255,255,255,0.09)',
    decorColor:  'rgba(144,164,174,0.18)',
    decor:       'dots-fine',
    quizBg:      'linear-gradient(155deg, #020204, #0a0a14)',
    btnBg:       '#37474f',
    btnText:     '#eceff1',
  },
};

/* ─── State ─── */
const STATE_KEY = 'ard_state';
let DATA = null;
let state = null;
let currentQuestion = null;
let currentCatId = null;
let currentWorldIndex = 0;

function defaultState(cats) {
  const scores = {};
  cats.forEach(c => { scores[c.id] = 0; });
  return { scores, points: 0, seen: [] };
}

function loadState(cats) {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      cats.forEach(c => { if (p.scores[c.id] === undefined) p.scores[c.id] = 0; });
      return p;
    }
  } catch (e) { /* ignore */ }
  return defaultState(cats);
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/* ─── Unlock logic ─── */
function isUnlocked(catId) {
  const cat = DATA.categories.find(c => c.id === catId);
  if (!cat || !cat.unlockRequirement) return true;
  return (state.scores[cat.unlockRequirement.category] || 0) >= cat.unlockRequirement.minLevel;
}

function unlockHintText(catId) {
  const cat = DATA.categories.find(c => c.id === catId);
  if (!cat || !cat.unlockRequirement) return '';
  const { category, minLevel } = cat.unlockRequirement;
  const dep = DATA.categories.find(c => c.id === category);
  const current = state.scores[category] || 0;
  return `🔒 ${dep ? dep.label : category} Level ${current}/${minLevel}`;
}

/* ─── Screen management ─── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ─── Apply world theme to quiz/feedback screens ─── */
function applyWorldTheme(w) {
  const quizEl = document.getElementById('screen-quiz');
  const fbEl = document.getElementById('screen-feedback');

  [quizEl, fbEl].forEach(el => {
    el.style.background = w.quizBg;
    el.style.setProperty('--quiz-bg', w.quizBg);
    el.style.setProperty('--quiz-text', w.text);
    el.style.setProperty('--quiz-muted', w.textMuted);
    el.style.setProperty('--quiz-accent', w.accent);
    el.style.setProperty('--quiz-surface', w.surface);
    el.style.setProperty('--quiz-surface-hover', w.surfaceHov);
    el.style.setProperty('--quiz-opt-border', w.surface);
    el.style.setProperty('--quiz-btn-bg', w.btnBg);
    el.style.setProperty('--quiz-btn-text', w.btnText);
  });

  // Insight bar color
  const bar = document.getElementById('insight-bar');
  if (bar) bar.style.background = w.accent;
}

/* ─── World carousel ─── */
function renderWorlds() {
  const track = document.getElementById('worlds-track');
  const dotsEl = document.getElementById('world-dots');
  track.innerHTML = '';
  dotsEl.innerHTML = '';

  document.getElementById('total-points').textContent = state.points;

  DATA.categories.forEach((cat, i) => {
    const panel = buildWorldPanel(cat, i);
    track.appendChild(panel);

    const dot = document.createElement('div');
    dot.className = 'world-dot' + (i === currentWorldIndex ? ' active' : '');
    dot.onclick = () => navigateWorld(i);
    dotsEl.appendChild(dot);
  });

  applyTrackTransform(false);
  updateNavArrows();

  // Swipe support
  initSwipe();
}

function buildWorldPanel(cat) {
  const w = WORLDS[cat.id];
  const unlocked = isUnlocked(cat.id);
  const score = Math.min(state.scores[cat.id] || 0, 5);
  const pct = (score / 5) * 100;

  const panel = document.createElement('div');
  panel.className = 'world-panel';
  panel.style.background = w.bg;

  // Decor layer
  const decor = document.createElement('div');
  decor.className = 'world-decor';
  buildDecorElements(decor, w);
  panel.appendChild(decor);

  // Content
  const content = document.createElement('div');
  content.className = 'world-content';

  const enterBtn = unlocked
    ? `<button class="btn-enter" style="background:${w.btnBg};color:${w.btnText}" onclick="App.startQuiz('${cat.id}')">Betreten →</button>`
    : `<div class="lock-badge" style="color:${w.textMuted}">${unlockHintText(cat.id)}</div>`;

  content.innerHTML = `
    <div class="world-emoji">${cat.emoji}</div>
    <h2 class="world-name" style="color:${w.text}">${cat.label}</h2>
    <div class="world-level" style="color:${w.textMuted}">◆ Level ${score} / 5</div>
    <div class="world-bar">
      <div class="world-bar-track">
        <div class="world-bar-fill" style="width:${pct}%;background:${w.accent};box-shadow:0 0 10px ${w.accentGlow}"></div>
      </div>
    </div>
    ${enterBtn}
  `;
  panel.appendChild(content);

  // Locked overlay
  if (!unlocked) {
    const overlay = document.createElement('div');
    overlay.className = 'world-locked-overlay';
    panel.appendChild(overlay);
  }

  return panel;
}

function buildDecorElements(container, w) {
  const type = w.decor;
  const color = w.decorColor;

  if (type === 'grid') {
    container.classList.add('decor-grid');
    return;
  }
  if (type === 'dots-fine') {
    container.classList.add('decor-dots-fine');
    return;
  }

  if (type === 'dots') {
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('div');
      d.className = 'decor-dot';
      const size = 12 + Math.random() * 38;
      d.style.cssText = `
        width:${size}px; height:${size}px; border-radius:50%;
        left:${Math.random() * 95}%; top:${Math.random() * 90}%;
        background:${color};
        animation-delay:${(Math.random() * 6).toFixed(2)}s;
        animation-duration:${(7 + Math.random() * 7).toFixed(2)}s;
      `;
      container.appendChild(d);
    }
  } else if (type === 'notes') {
    ['♪','♫','♩','♬','♪','♫','♩','♬'].forEach((note, i) => {
      const d = document.createElement('span');
      d.className = 'decor-note';
      const size = 18 + Math.random() * 36;
      d.textContent = note;
      d.style.cssText = `
        font-size:${size}px; position:absolute;
        left:${8 + Math.random() * 80}%; top:${5 + Math.random() * 82}%;
        color:${color};
        animation-delay:${(Math.random() * 5).toFixed(2)}s;
        animation-duration:${(4 + Math.random() * 5).toFixed(2)}s;
      `;
      container.appendChild(d);
    });
  } else if (type === 'stars') {
    for (let i = 0; i < 11; i++) {
      const d = document.createElement('span');
      d.className = 'decor-star';
      const size = 14 + Math.random() * 26;
      d.textContent = '★';
      d.style.cssText = `
        font-size:${size}px; position:absolute;
        left:${Math.random() * 92}%; top:${Math.random() * 88}%;
        color:${color};
        animation-delay:${(Math.random() * 4).toFixed(2)}s;
        animation-duration:${(3 + Math.random() * 4).toFixed(2)}s;
      `;
      container.appendChild(d);
    }
  } else if (type === 'lines') {
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('div');
      d.className = 'decor-line';
      d.style.cssText = `
        top:${8 + i * 16}%;
        left:-5%;
        background:${color};
        animation-delay:${(i * 0.35).toFixed(2)}s;
      `;
      container.appendChild(d);
    }
    for (let i = 0; i < 8; i++) {
      const d = document.createElement('div');
      d.className = 'decor-dot';
      d.style.cssText = `
        width:5px; height:5px; border-radius:50%;
        left:${Math.random() * 95}%; top:${Math.random() * 90}%;
        background:${color};
        animation-delay:${(Math.random() * 5).toFixed(2)}s;
        animation-duration:${(4 + Math.random() * 4).toFixed(2)}s;
      `;
      container.appendChild(d);
    }
  }
}

/* ─── Carousel navigation ─── */
function navigateWorld(index) {
  const n = DATA.categories.length;
  currentWorldIndex = Math.max(0, Math.min(index, n - 1));
  applyTrackTransform(true);
  updateDots();
  updateNavArrows();
}

function applyTrackTransform(animate) {
  const track = document.getElementById('worlds-track');
  const vp = document.getElementById('worlds-viewport');
  const w = vp.offsetWidth;
  track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
  track.style.transform = `translateX(${-currentWorldIndex * w}px)`;

  // Set panel widths to match viewport
  Array.from(track.children).forEach(panel => {
    panel.style.minWidth = w + 'px';
  });
}

function updateDots() {
  document.querySelectorAll('.world-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentWorldIndex);
  });
}

function updateNavArrows() {
  const n = DATA.categories.length;
  const prev = document.getElementById('btn-prev');
  const next = document.getElementById('btn-next');
  if (prev) prev.disabled = currentWorldIndex === 0;
  if (next) next.disabled = currentWorldIndex === n - 1;
}

/* ─── Swipe / drag ─── */
function initSwipe() {
  const vp = document.getElementById('worlds-viewport');
  let startX = 0, isDrag = false;

  vp.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  vp.addEventListener('touchend', e => {
    const delta = startX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 45) delta > 0 ? App.nextWorld() : App.prevWorld();
  }, { passive: true });

  vp.addEventListener('mousedown', e => { isDrag = true; startX = e.clientX; });
  document.addEventListener('mouseup', e => {
    if (!isDrag) return;
    isDrag = false;
    const delta = startX - e.clientX;
    if (Math.abs(delta) > 45) delta > 0 ? App.nextWorld() : App.prevWorld();
  });
}

/* ─── Quiz ─── */
function startQuiz(catId) {
  currentCatId = catId;
  const w = WORLDS[catId];
  applyWorldTheme(w);

  const allForCat = DATA.questions.filter(q => q.category === catId);
  let pool = allForCat.filter(q => !state.seen.includes(q.id));
  if (pool.length === 0) {
    state.seen = state.seen.filter(id => !allForCat.map(q => q.id).includes(id));
    saveState();
    pool = allForCat;
  }

  currentQuestion = pool[Math.floor(Math.random() * pool.length)];
  const cat = DATA.categories.find(c => c.id === catId);

  document.getElementById('quiz-cat-name').textContent = `${cat.emoji} ${cat.label}`;
  document.getElementById('quiz-points').textContent = state.points;
  document.getElementById('quiz-source').textContent = currentQuestion.title;
  document.getElementById('quiz-question').textContent = currentQuestion.question;

  // Reset animation
  const qEl = document.getElementById('quiz-question');
  qEl.style.animation = 'none';
  void qEl.offsetWidth;
  qEl.style.animation = '';

  const opts = document.getElementById('quiz-options');
  opts.innerHTML = '';
  currentQuestion.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.style.animationDelay = `${i * 80}ms`;
    btn.addEventListener('click', () => submitAnswer(i, btn));
    opts.appendChild(btn);
  });

  showScreen('screen-quiz');
}

function submitAnswer(selectedIndex, clickedBtn) {
  const correct = selectedIndex === currentQuestion.correctIndex;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => (b.disabled = true));

  buttons[currentQuestion.correctIndex].classList.add('correct');
  if (!correct) clickedBtn.classList.add('wrong');

  if (correct) {
    state.points += 1;
    if (state.scores[currentCatId] < 5) state.scores[currentCatId] += 1;
    createSparkles(clickedBtn);
  } else {
    shakeScreen();
  }

  if (!state.seen.includes(currentQuestion.id)) state.seen.push(currentQuestion.id);
  saveState();

  setTimeout(() => showFeedback(correct), 700);
}

function showFeedback(correct) {
  const w = WORLDS[currentCatId];

  document.getElementById('fb-icon').textContent = correct ? '🎉' : '😌';
  document.getElementById('fb-result').textContent = correct ? 'Richtig!' : 'Leider falsch.';

  const correctLabel = document.getElementById('fb-correct-label');
  if (!correct) {
    correctLabel.textContent = `Richtige Antwort: ${currentQuestion.options[currentQuestion.correctIndex]}`;
    correctLabel.style.display = 'block';
  } else {
    correctLabel.style.display = 'none';
  }

  document.getElementById('fb-insight').textContent = currentQuestion.insight;
  document.getElementById('insight-bar').style.background = w.accent;

  const link = document.getElementById('fb-link');
  link.href = currentQuestion.url;
  link.textContent = `${currentQuestion.title} →`;

  document.getElementById('quiz-points').textContent = state.points;

  // Reset icon animation
  const icon = document.getElementById('fb-icon');
  icon.style.animation = 'none';
  void icon.offsetWidth;
  icon.style.animation = '';

  if (correct) {
    const pf = document.getElementById('point-float');
    pf.classList.remove('floating');
    void pf.offsetWidth;
    pf.classList.add('floating');
    setTimeout(() => pf.classList.remove('floating'), 1200);
  }

  showScreen('screen-feedback');
}

/* ─── Animation helpers ─── */
function createSparkles(btn) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const w = WORLDS[currentCatId];
  const count = 8;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const dist = 50 + Math.random() * 30;
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.cssText = `
      left:${cx}px; top:${cy}px;
      background:${w.accent};
      --dx:${(Math.cos(angle) * dist).toFixed(1)}px;
      --dy:${(Math.sin(angle) * dist).toFixed(1)}px;
    `;
    document.body.appendChild(spark);
    requestAnimationFrame(() => spark.classList.add('burst'));
    setTimeout(() => spark.remove(), 600);
  }
}

function shakeScreen() {
  const el = document.getElementById('screen-quiz');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

/* ─── Wheel of Life ─── */
function renderWheel() {
  document.getElementById('wheel-points').textContent = state.points;
  const svg = document.getElementById('wheel-svg');
  svg.innerHTML = '';

  const cx = 200, cy = 200;
  const outerR = 158, innerR = 48;
  const n = DATA.categories.length;
  const anglePer = (2 * Math.PI) / n;
  const startOffset = -Math.PI / 2;

  // Glow filter
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="seg-glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  // Dark background circle
  const bgCircle = makeSVGEl('circle', { cx, cy, r: outerR, fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 });
  svg.appendChild(bgCircle);

  const segOrder = [];

  DATA.categories.forEach((cat, i) => {
    const w = WORLDS[cat.id];
    const startAngle = startOffset + i * anglePer;
    const endAngle = startAngle + anglePer;
    const score = Math.min(state.scores[cat.id] || 0, 5);
    const fillPct = score / 5;

    // Background segment (always visible)
    const bg = makeSector(cx, cy, innerR, outerR, startAngle, endAngle);
    bg.setAttribute('fill', w.accentGlow);
    bg.setAttribute('fill-opacity', '0.1');
    bg.classList.add('wheel-seg');
    svg.appendChild(bg);
    segOrder.push(bg);

    // Filled segment (score-based)
    if (fillPct > 0) {
      const fillR = innerR + (outerR - innerR) * fillPct;
      const fill = makeSector(cx, cy, innerR, fillR, startAngle, endAngle);
      fill.setAttribute('fill', w.accent);
      fill.setAttribute('fill-opacity', '0.85');
      fill.setAttribute('filter', 'url(#seg-glow)');
      fill.classList.add('wheel-seg');
      svg.appendChild(fill);
      segOrder.push(fill);
    }

    // Divider line
    const p1 = polarXY(cx, cy, innerR, startAngle);
    const p2 = polarXY(cx, cy, outerR, startAngle);
    const line = makeSVGEl('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: 'rgba(0,0,0,0.45)', 'stroke-width': 1.5 });
    svg.appendChild(line);

    // Emoji label
    const midAngle = startAngle + anglePer / 2;
    const lp = polarXY(cx, cy, outerR + 20);
    const emojiEl = makeSVGEl('text', {
      x: polarXY(cx, cy, outerR + 20, midAngle).x,
      y: polarXY(cx, cy, outerR + 20, midAngle).y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': 17,
    });
    emojiEl.textContent = cat.emoji;
    svg.appendChild(emojiEl);
  });

  // Center cap
  const cap = makeSVGEl('circle', { cx, cy, r: innerR, fill: '#0d0d1a', stroke: 'rgba(255,255,255,0.08)', 'stroke-width': 1.5 });
  svg.appendChild(cap);

  // Center points
  const pts = makeSVGEl('text', { x: cx, y: cy - 7, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#ffd700' });
  pts.textContent = state.points;
  svg.appendChild(pts);

  const ptsLabel = makeSVGEl('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', 'font-size': 10, fill: 'rgba(255,255,255,0.35)' });
  ptsLabel.textContent = 'Punkte';
  svg.appendChild(ptsLabel);

  // Animate segments in
  setTimeout(() => {
    segOrder.forEach((seg, i) => {
      setTimeout(() => seg.classList.add('visible'), i * 60);
    });
  }, 80);

  // Legend
  const legend = document.getElementById('wheel-legend');
  legend.innerHTML = '';
  DATA.categories.forEach(cat => {
    const w = WORLDS[cat.id];
    const score = Math.min(state.scores[cat.id] || 0, 5);
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${w.accent}"></span>
      <span>${cat.label}: ${score}/5</span>
    `;
    legend.appendChild(item);
  });
}

/* ─── SVG helpers ─── */
function polarXY(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function makeSector(cx, cy, r1, r2, startAngle, endAngle) {
  const p1 = polarXY(cx, cy, r2, startAngle);
  const p2 = polarXY(cx, cy, r2, endAngle);
  const p3 = polarXY(cx, cy, r1, endAngle);
  const p4 = polarXY(cx, cy, r1, startAngle);
  const large = (endAngle - startAngle > Math.PI) ? 1 : 0;
  const d = [
    `M ${p4.x} ${p4.y}`,
    `L ${p1.x} ${p1.y}`,
    `A ${r2} ${r2} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r1} ${r1} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path;
}

function makeSVGEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/* ─── Start screen particles ─── */
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 5;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 40}%;
      animation-delay:${(Math.random() * 10).toFixed(2)}s;
      animation-duration:${(7 + Math.random() * 9).toFixed(2)}s;
    `;
    container.appendChild(p);
  }
}

/* ─── App interface ─── */
const App = {
  goWorlds() {
    renderWorlds();
    showScreen('screen-worlds');
    // Re-apply track transform after DOM is ready
    requestAnimationFrame(() => applyTrackTransform(false));
  },
  goWheel() {
    renderWheel();
    showScreen('screen-wheel');
  },
  startQuiz(catId) {
    startQuiz(catId);
  },
  nextWorld() {
    navigateWorld(currentWorldIndex + 1);
  },
  prevWorld() {
    navigateWorld(currentWorldIndex - 1);
  },
  resetGame() {
    if (confirm('Wirklich zurücksetzen? Alle Punkte und Fortschritte werden gelöscht.')) {
      state = defaultState(DATA.categories);
      saveState();
      App.goWorlds();
    }
  },
};

/* ─── Boot ─── */
async function init() {
  try {
    const res = await fetch('data.json');
    DATA = await res.json();
    state = loadState(DATA.categories);
    createParticles();
    showScreen('screen-start');

    // Set panel widths on resize
    window.addEventListener('resize', () => {
      if (document.getElementById('screen-worlds').classList.contains('active')) {
        applyTrackTransform(false);
      }
    });
  } catch (err) {
    document.body.innerHTML = `
      <div style="padding:40px;color:#ff6b6b;font-family:sans-serif">
        <strong>Fehler:</strong> ${err.message}<br><br>
        Bitte öffne die App über einen lokalen Server (z.B. <code>npx serve .</code>)
      </div>`;
  }
}

init();
