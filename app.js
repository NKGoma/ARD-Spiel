/* ══════════════════════════════════════════
   ARD Life – RPG World Map Engine
   app.js
══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   World visual configs
───────────────────────────────────────── */
const WORLDS = {
  grundwissen: {
    bg:           'linear-gradient(155deg,#0d1f10,#1a3a1f)',
    accent:       '#81c784',
    accentGlow:   '#4caf50',
    nodeBg:       'rgba(46,125,50,0.55)',
    nodeGlow:     'rgba(76,175,80,0.6)',
    text:         '#e8f5e9',
    textMuted:    'rgba(232,245,233,0.52)',
    surface:      'rgba(255,255,255,0.08)',
    surfaceHov:   'rgba(255,255,255,0.14)',
    btnBg:        '#2e7d32',
    btnText:      '#e8f5e9',
    zoneFill:     'rgba(76,175,80,0.18)',
    zoneSize:     220,
  },
  sport: {
    bg:           'linear-gradient(155deg,#04080f,#071830)',
    accent:       '#64b5f6',
    accentGlow:   '#1976d2',
    nodeBg:       'rgba(21,101,192,0.55)',
    nodeGlow:     'rgba(100,181,246,0.65)',
    text:         '#e3f2fd',
    textMuted:    'rgba(227,242,253,0.48)',
    surface:      'rgba(255,255,255,0.06)',
    surfaceHov:   'rgba(255,255,255,0.12)',
    btnBg:        '#1565c0',
    btnText:      '#e3f2fd',
    zoneFill:     'rgba(25,118,210,0.16)',
    zoneSize:     200,
  },
  musik: {
    bg:           'linear-gradient(155deg,#06010f,#15063a)',
    accent:       '#ce93d8',
    accentGlow:   '#9c27b0',
    nodeBg:       'rgba(106,27,154,0.55)',
    nodeGlow:     'rgba(206,147,216,0.65)',
    text:         '#f3e5f5',
    textMuted:    'rgba(243,229,245,0.48)',
    surface:      'rgba(255,255,255,0.06)',
    surfaceHov:   'rgba(255,255,255,0.11)',
    btnBg:        '#6a1b9a',
    btnText:      '#f3e5f5',
    zoneFill:     'rgba(156,39,176,0.18)',
    zoneSize:     210,
  },
  humor: {
    bg:           'linear-gradient(155deg,#3f0f00,#9f2900)',
    accent:       '#ffcc02',
    accentGlow:   '#ff9800',
    nodeBg:       'rgba(191,54,12,0.55)',
    nodeGlow:     'rgba(255,204,2,0.6)',
    text:         '#fff8e1',
    textMuted:    'rgba(255,248,225,0.5)',
    surface:      'rgba(255,255,255,0.1)',
    surfaceHov:   'rgba(255,255,255,0.17)',
    btnBg:        '#bf360c',
    btnText:      '#fff8e1',
    zoneFill:     'rgba(230,74,25,0.17)',
    zoneSize:     195,
  },
  geschichte: {
    bg:           'linear-gradient(155deg,#080400,#1f1000)',
    accent:       '#d4a96a',
    accentGlow:   '#8d6e63',
    nodeBg:       'rgba(93,64,55,0.55)',
    nodeGlow:     'rgba(212,169,106,0.6)',
    text:         '#fdf0d5',
    textMuted:    'rgba(253,240,213,0.48)',
    surface:      'rgba(255,200,130,0.07)',
    surfaceHov:   'rgba(255,200,130,0.13)',
    btnBg:        '#5d4037',
    btnText:      '#fdf0d5',
    zoneFill:     'rgba(141,110,99,0.18)',
    zoneSize:     200,
  },
  kultur: {
    bg:           'linear-gradient(155deg,#020204,#0a0a14)',
    accent:       '#90a4ae',
    accentGlow:   '#607d8b',
    nodeBg:       'rgba(55,71,79,0.55)',
    nodeGlow:     'rgba(144,164,174,0.6)',
    text:         '#eceff1',
    textMuted:    'rgba(236,239,241,0.45)',
    surface:      'rgba(255,255,255,0.05)',
    surfaceHov:   'rgba(255,255,255,0.09)',
    btnBg:        '#37474f',
    btnText:      '#eceff1',
    zoneFill:     'rgba(96,125,139,0.16)',
    zoneSize:     190,
  },
};

/* ─────────────────────────────────────────
   World story / narrative
───────────────────────────────────────── */
const WORLD_STORY = {
  grundwissen: {
    subtitle:  'Neon Archive',
    text:      'Die Basis-KI ist instabil. Stabilisiere die Kernfakten und aktiviere das erste Datennetz.',
    objective: '🎯 Ziel: 3 Richtige → Sport-Portal öffnet sich',
    bonus:     '⚡ Bonus: 3er-Combo gibt +1 Punkt',
  },
  sport:       {
    subtitle:  'Velocity Arena',
    text:      'In dieser Arena zählen Fokus, Rhythmus und Ausdauer. Jeder Treffer lädt den Boost-Reaktor.',
    objective: '🎯 Ziel: Level 5 in Sport erreichen',
    bonus:     '⚡ Bonus: Jede 3er-Serie = +1 Bonuspunkt',
  },
  musik:       {
    subtitle:  'Echo District',
    text:      'Resonanzfelder reagieren auf richtige Antworten. Spiele im Takt und halte den Flow.',
    objective: '🎯 Ziel: Level 3 → Humor-Tor öffnet sich',
    bonus:     '⚡ Bonus: Kombos verlängern den Flow',
  },
  humor:       {
    subtitle:  'Glitch Comedy Club',
    text:      'Satire-Bots prüfen deine Reaktionsfähigkeit. Lachen ist hier ein Schild gegen Rauschen.',
    objective: '🎯 Ziel: Level 3 → Geschichte-Sektor frei',
    bonus:     '⚡ Bonus: Kein Fehlklick = Combo aktiv',
  },
  geschichte:  {
    subtitle:  'Chronicle Vault',
    text:      'Zeitfragmente sind verstreut. Rekonstruiere die Vergangenheit, um den Endsektor zu öffnen.',
    objective: '🎯 Ziel: Level 3 → Kultur-Galerie entsperrt',
    bonus:     '⚡ Bonus: Bonuspunkte beschleunigen den Run',
  },
  kultur:      {
    subtitle:  'Finale Galerie',
    text:      'Du bist im Endgame. Vervollständige das Wissensrad und maxe alle Welten auf Level 5.',
    objective: '🎯 Ziel: 6 Welten × Level 5 = Maxout',
    bonus:     '⚡ Bonus: Breche deinen Combo-Rekord',
  },
};

/* ─────────────────────────────────────────
   Map layout: node positions + connections
   (% of map-world container width/height)
───────────────────────────────────────── */
const NODE_POS = {
  grundwissen: { x: 50, y: 82 },
  sport:       { x: 83, y: 60 },
  musik:       { x: 78, y: 23 },
  humor:       { x: 48, y: 10 },
  geschichte:  { x: 17, y: 26 },
  kultur:      { x: 14, y: 63 },
};

// Linear unlock chain – path the player walks
const PATH = ['grundwissen','sport','musik','humor','geschichte','kultur'];
// Adjacency for keyboard nav (prev/next in PATH)
const CONNECTIONS = PATH.map((id, i) =>
  i < PATH.length - 1 ? [id, PATH[i + 1]] : null
).filter(Boolean);

/* ─────────────────────────────────────────
   State
───────────────────────────────────────── */
const STATE_KEY = 'ard_state';
let DATA  = null;
let state = null;
let currentQuestion = null;
let currentCatId    = null;
let currentMapNode  = 'grundwissen';

function defaultState(cats) {
  const scores = {};
  cats.forEach(c => { scores[c.id] = 0; });
  return { scores, points: 0, seen: [], streak: 0, maxStreak: 0 };
}

function loadState(cats) {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      cats.forEach(c => { if (p.scores[c.id] === undefined) p.scores[c.id] = 0; });
      if (!p.streak)    p.streak    = 0;
      if (!p.maxStreak) p.maxStreak = 0;
      return p;
    }
  } catch (e) { /* ignore */ }
  return defaultState(cats);
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/* ─────────────────────────────────────────
   Unlock logic
───────────────────────────────────────── */
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
  const cur = state.scores[category] || 0;
  return `🔒 ${dep ? dep.label : category} Level ${cur}/${minLevel}`;
}

/* ─────────────────────────────────────────
   Screen management
───────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ─────────────────────────────────────────
   World theme → quiz + feedback screens
───────────────────────────────────────── */
function applyWorldTheme(w) {
  ['screen-quiz','screen-feedback'].forEach(id => {
    const el = document.getElementById(id);
    el.style.background = w.bg;
    el.style.setProperty('--quiz-bg',           w.bg);
    el.style.setProperty('--quiz-text',         w.text);
    el.style.setProperty('--quiz-muted',        w.textMuted);
    el.style.setProperty('--quiz-accent',       w.accent);
    el.style.setProperty('--quiz-surface',      w.surface);
    el.style.setProperty('--quiz-surface-hover',w.surfaceHov);
    el.style.setProperty('--quiz-opt-border',   w.surface);
    el.style.setProperty('--quiz-btn-bg',       w.btnBg);
    el.style.setProperty('--quiz-btn-text',     w.btnText);
  });
  const bar = document.getElementById('insight-bar');
  if (bar) bar.style.background = w.accent;
}

/* ═════════════════════════════════════════
   MAP ENGINE
═════════════════════════════════════════ */
function renderMap() {
  updateHUD();
  generateStars();
  renderZoneGlows();
  renderPaths();
  renderNodes();
  positionPlayer(false);
  renderMissionHUD();
  setupKeyboard();
  setupSwipe();
}

/* ── Stars ── */
function generateStars() {
  const container = document.getElementById('map-stars');
  if (container.childElementCount > 0) return; // only once
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'map-star';
    const size = 1 + Math.random() * 2.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${(Math.random()*98).toFixed(1)}%;
      top:${(Math.random()*98).toFixed(1)}%;
      animation-delay:${(Math.random()*6).toFixed(2)}s;
      animation-duration:${(2+Math.random()*4).toFixed(2)}s;
    `;
    container.appendChild(s);
  }
}

/* ── Zone glows ── */
function renderZoneGlows() {
  const container = document.getElementById('map-glows');
  container.innerHTML = '';
  DATA.categories.forEach(cat => {
    const pos = NODE_POS[cat.id];
    const w   = WORLDS[cat.id];
    const div = document.createElement('div');
    div.className = 'zone-glow';
    const sz = w.zoneSize;
    div.style.cssText = `
      left:${pos.x}%; top:${pos.y}%;
      width:${sz}px; height:${sz}px;
      background: radial-gradient(circle, ${w.zoneFill} 0%, transparent 70%);
      animation-delay:${Math.random()*4}s;
    `;
    container.appendChild(div);
  });
}

/* ── Paths ── */
function renderPaths() {
  const svg = document.getElementById('map-paths');
  svg.innerHTML = '';
  const mw  = document.getElementById('map-world');
  const W   = mw.offsetWidth;
  const H   = mw.offsetHeight;

  CONNECTIONS.forEach(([a, b]) => {
    const pa = NODE_POS[a], pb = NODE_POS[b];
    const x1 = (pa.x/100)*W, y1 = (pa.y/100)*H;
    const x2 = (pb.x/100)*W, y2 = (pb.y/100)*H;
    const unlocked = isUnlocked(b);
    const wa = WORLDS[a];

    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1); line.setAttribute('y1',y1);
    line.setAttribute('x2',x2); line.setAttribute('y2',y2);
    line.setAttribute('stroke', unlocked ? wa.accent : 'rgba(255,255,255,0.15)');
    line.setAttribute('stroke-width','2');
    line.classList.add('map-path', ...(unlocked ? [] : ['locked']));
    svg.appendChild(line);
  });
}

/* ── Nodes ── */
function renderNodes() {
  const container = document.getElementById('map-nodes');
  container.innerHTML = '';

  DATA.categories.forEach(cat => {
    const pos      = NODE_POS[cat.id];
    const w        = WORLDS[cat.id];
    const unlocked = isUnlocked(cat.id);
    const score    = Math.min(state.scores[cat.id] || 0, 5);
    const isCur    = cat.id === currentMapNode;

    // Progress ring calc (r=26 → circumference ≈ 163.4)
    const r = 26, circ = 2 * Math.PI * r;
    const filled = (score / 5) * circ;
    const gap    = circ - filled;

    const node = document.createElement('div');
    node.className = `map-node${!unlocked ? ' node-locked' : ''}${isCur ? ' node-current' : ''}`;
    node.style.left = pos.x + '%';
    node.style.top  = pos.y + '%';
    node.style.setProperty('--node-glow', w.nodeGlow);

    node.innerHTML = `
      <div class="node-ring">
        <svg class="node-ring-svg" viewBox="0 0 62 62" fill="none">
          <circle cx="31" cy="31" r="27"
            fill="${w.nodeBg}"
            stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
          <circle cx="31" cy="31" r="${r}"
            fill="none"
            stroke="${unlocked ? w.accent : 'rgba(255,255,255,0.1)'}"
            stroke-width="3"
            stroke-dasharray="${filled.toFixed(1)} ${gap.toFixed(1)}"
            transform="rotate(-90 31 31)"
            stroke-linecap="round"/>
        </svg>
        <div class="node-fill" style="--node-bg:${w.nodeBg}"></div>
        <div class="node-emoji">${unlocked ? cat.emoji : '🔒'}</div>
      </div>
      <div class="node-label">${cat.label}</div>
    `;

    node.addEventListener('click', () => movePlayerTo(cat.id));
    container.appendChild(node);
  });
}

/* ── Player positioning ── */
function positionPlayer(animate) {
  const player = document.getElementById('player');
  const mw     = document.getElementById('map-world');
  const pos    = NODE_POS[currentMapNode];
  const W = mw.offsetWidth, H = mw.offsetHeight;
  const x = (pos.x / 100) * W;
  const y = (pos.y / 100) * H - 42; // above node center

  player.style.transition = animate
    ? 'left 0.55s cubic-bezier(0.25,0.46,0.45,0.94), top 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
    : 'none';
  player.style.left = x + 'px';
  player.style.top  = y + 'px';
}

/* ── Move player to node ── */
function movePlayerTo(catId) {
  if (catId === currentMapNode) {
    // Double-tap / click on current = try to enter
    if (isUnlocked(catId)) startQuiz(catId);
    return;
  }
  currentMapNode = catId;
  renderNodes();
  positionPlayer(true);
  renderMissionHUD();
  renderPaths();
}

/* ── Mission HUD ── */
function renderMissionHUD() {
  const cat      = DATA.categories.find(c => c.id === currentMapNode);
  const story    = WORLD_STORY[currentMapNode];
  const w        = WORLDS[currentMapNode];
  const unlocked = isUnlocked(currentMapNode);
  const hud      = document.getElementById('mission-hud');

  document.getElementById('mission-title').textContent =
    `${cat.emoji} ${cat.label} — ${story.subtitle}`;
  document.getElementById('mission-text').textContent      = story.text;
  document.getElementById('mission-objective').textContent = story.objective;
  document.getElementById('mission-bonus').textContent     = story.bonus;

  const btn = document.getElementById('btn-enter-world');
  if (unlocked) {
    btn.textContent         = 'Betreten →';
    btn.disabled            = false;
    btn.style.background    = w.btnBg;
    btn.style.color         = w.btnText;
    btn.style.boxShadow     = `0 4px 20px ${w.accentGlow}55`;
  } else {
    btn.textContent         = unlockHintText(currentMapNode);
    btn.disabled            = true;
    btn.style.background    = 'rgba(255,255,255,0.06)';
    btn.style.color         = 'rgba(255,255,255,0.3)';
    btn.style.boxShadow     = 'none';
  }

  hud.classList.add('visible');
  updateComboTag();
}

function updateComboTag() {
  const el = document.getElementById('mission-combo');
  if (!el) return;
  if (state.streak >= 3) {
    el.textContent = `🔥 Combo ×${state.streak}`;
    el.style.display = 'block';
  } else if (state.streak > 0) {
    el.textContent = `× ${state.streak}`;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

/* ── HUD + topbar update ── */
function updateHUD() {
  const mp = document.getElementById('map-points');
  const ms = document.getElementById('map-streak');
  const sb = document.getElementById('streak-badge');
  if (mp) mp.textContent = state.points;
  if (ms) ms.textContent = state.streak;
  if (sb) sb.classList.toggle('hidden', state.streak === 0);
}

/* ── Keyboard ── */
function setupKeyboard() {
  document.onkeydown = e => {
    if (!document.getElementById('screen-map').classList.contains('active')) return;
    const idx = PATH.indexOf(currentMapNode);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const next = PATH[idx + 1];
      if (next) movePlayerTo(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const prev = PATH[idx - 1];
      if (prev) movePlayerTo(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      App.enterCurrentWorld();
    }
  };
}

/* ── Swipe on map ── */
function setupSwipe() {
  const mw = document.getElementById('map-world');
  let startX = 0, startY = 0;
  mw.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  mw.addEventListener('touchend', e => {
    const dx = startX - e.changedTouches[0].clientX;
    const dy = startY - e.changedTouches[0].clientY;
    const idx = PATH.indexOf(currentMapNode);
    if (Math.abs(dx) > Math.abs(dy)) {
      // horizontal
      if (dx > 45 && PATH[idx + 1]) movePlayerTo(PATH[idx + 1]);
      if (dx < -45 && PATH[idx - 1]) movePlayerTo(PATH[idx - 1]);
    } else {
      // vertical
      if (dy > 45 && PATH[idx + 1]) movePlayerTo(PATH[idx + 1]);
      if (dy < -45 && PATH[idx - 1]) movePlayerTo(PATH[idx - 1]);
    }
  }, { passive: true });
}

/* ═════════════════════════════════════════
   QUIZ ENGINE
═════════════════════════════════════════ */
function startQuiz(catId) {
  currentCatId = catId;
  const w   = WORLDS[catId];
  const cat = DATA.categories.find(c => c.id === catId);
  applyWorldTheme(w);

  // Pick unseen question
  const all  = DATA.questions.filter(q => q.category === catId);
  let pool   = all.filter(q => !state.seen.includes(q.id));
  if (pool.length === 0) {
    state.seen = state.seen.filter(id => !all.map(q => q.id).includes(id));
    saveState();
    pool = all;
  }
  currentQuestion = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById('quiz-cat-name').textContent = `${cat.emoji} ${cat.label}`;
  document.getElementById('quiz-points').textContent   = state.points;
  document.getElementById('quiz-source').textContent   = currentQuestion.title;

  // Animate question in fresh
  const qEl = document.getElementById('quiz-question');
  qEl.textContent = currentQuestion.question;
  qEl.style.animation = 'none';
  void qEl.offsetWidth;
  qEl.style.animation = '';

  // Build options
  const optsEl = document.getElementById('quiz-options');
  optsEl.innerHTML = '';
  currentQuestion.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.style.animationDelay = `${i * 80}ms`;
    btn.addEventListener('click', () => submitAnswer(i, btn));
    optsEl.appendChild(btn);
  });

  showScreen('screen-quiz');
}

function submitAnswer(selectedIndex, clickedBtn) {
  const correct = selectedIndex === currentQuestion.correctIndex;
  document.querySelectorAll('.option-btn').forEach(b => (b.disabled = true));
  document.querySelectorAll('.option-btn')[currentQuestion.correctIndex].classList.add('correct');
  if (!correct) clickedBtn.classList.add('wrong');

  if (correct) {
    state.points   += 1;
    state.streak   += 1;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    // Bonus point every 3-combo
    if (state.streak % 3 === 0) state.points += 1;
    if (state.scores[currentCatId] < 5) state.scores[currentCatId] += 1;
    createSparkles(clickedBtn);
  } else {
    state.streak = 0;
    shakeScreen();
  }

  if (!state.seen.includes(currentQuestion.id)) state.seen.push(currentQuestion.id);
  saveState();

  setTimeout(() => showFeedback(correct), 680);
}

function showFeedback(correct) {
  const w    = WORLDS[currentCatId];
  const streak = state.streak;
  const combo  = correct && streak >= 2  ? ` · Combo ×${streak}` : '';
  const bonus  = correct && streak > 0 && streak % 3 === 0 ? ' (+1 Bonus ⭐)' : '';

  document.getElementById('fb-icon').textContent = correct ? '🎉' : '😌';

  const result = document.getElementById('fb-result');
  result.textContent = correct ? `Richtig!${combo}${bonus}` : 'Leider falsch.';

  const cl = document.getElementById('fb-correct-label');
  if (!correct) {
    cl.textContent = `Richtige Antwort: ${currentQuestion.options[currentQuestion.correctIndex]}`;
    cl.style.display = 'block';
  } else {
    cl.style.display = 'none';
  }

  document.getElementById('fb-insight').textContent = currentQuestion.insight;
  document.getElementById('insight-bar').style.background = w.accent;

  const link = document.getElementById('fb-link');
  link.href        = currentQuestion.url;
  link.textContent = `${currentQuestion.title} →`;

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

/* ─────────────────────────────────────────
   Animation helpers
───────────────────────────────────────── */
function createSparkles(btn) {
  const rect  = btn.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  const w     = WORLDS[currentCatId];
  const count = 8;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const dist  = 50 + Math.random() * 30;
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.cssText = `
      left:${cx}px; top:${cy}px;
      background:${w.accent};
      --dx:${(Math.cos(angle)*dist).toFixed(1)}px;
      --dy:${(Math.sin(angle)*dist).toFixed(1)}px;
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

/* ═════════════════════════════════════════
   WHEEL OF LIFE
═════════════════════════════════════════ */
function renderWheel() {
  document.getElementById('wheel-points').textContent = state.points;
  const svg = document.getElementById('wheel-svg');
  svg.innerHTML = '';

  const cx = 200, cy = 200, outerR = 152, innerR = 46;
  const n = DATA.categories.length;
  const anglePer = (2 * Math.PI) / n;
  const startOff = -Math.PI / 2;

  // Glow filter
  const defs = makeSVGEl('defs',{});
  defs.innerHTML = `
    <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  svg.appendChild(defs);

  const bg = makeSVGEl('circle',{cx,cy,r:outerR,fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.06)','stroke-width':1});
  svg.appendChild(bg);

  const segs = [];
  DATA.categories.forEach((cat, i) => {
    const w          = WORLDS[cat.id];
    const sa         = startOff + i * anglePer;
    const ea         = sa + anglePer;
    const score      = Math.min(state.scores[cat.id] || 0, 5);
    const fillPct    = score / 5;

    // bg segment
    const bg = makeSector(cx,cy,innerR,outerR,sa,ea);
    bg.setAttribute('fill', w.accentGlow); bg.setAttribute('fill-opacity','0.1');
    bg.classList.add('wheel-seg'); svg.appendChild(bg); segs.push(bg);

    // filled
    if (fillPct > 0) {
      const fr   = innerR + (outerR - innerR) * fillPct;
      const fill = makeSector(cx,cy,innerR,fr,sa,ea);
      fill.setAttribute('fill', w.accent);
      fill.setAttribute('fill-opacity','0.88');
      fill.setAttribute('filter','url(#glow)');
      fill.classList.add('wheel-seg'); svg.appendChild(fill); segs.push(fill);
    }

    // divider
    const p1 = polar(cx,cy,innerR,sa), p2 = polar(cx,cy,outerR,sa);
    svg.appendChild(makeSVGEl('line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,stroke:'rgba(0,0,0,0.5)','stroke-width':1.5}));

    // emoji label
    const mp = polar(cx,cy,outerR+18,(sa+ea)/2);
    const t  = makeSVGEl('text',{x:mp.x,y:mp.y,'text-anchor':'middle','dominant-baseline':'middle','font-size':16});
    t.textContent = cat.emoji; svg.appendChild(t);
  });

  // Center cap
  svg.appendChild(makeSVGEl('circle',{cx,cy,r:innerR,fill:'#080812',stroke:'rgba(255,255,255,0.08)','stroke-width':1.5}));
  const cPts = makeSVGEl('text',{x:cx,y:cy-6,'text-anchor':'middle','font-size':20,'font-weight':700,fill:'#ffd700'});
  cPts.textContent = state.points; svg.appendChild(cPts);
  const cLbl = makeSVGEl('text',{x:cx,y:cy+11,'text-anchor':'middle','font-size':10,fill:'rgba(255,255,255,0.3)'});
  cLbl.textContent = 'Punkte'; svg.appendChild(cLbl);

  // Stagger reveal
  setTimeout(() => {
    segs.forEach((s,i) => setTimeout(() => s.classList.add('visible'), i*65));
  }, 80);

  // Legend
  const leg = document.getElementById('wheel-legend');
  leg.innerHTML = '';
  DATA.categories.forEach(cat => {
    const w = WORLDS[cat.id];
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${w.accent}"></span>
      <span>${cat.label}: ${Math.min(state.scores[cat.id]||0,5)}/5</span>`;
    leg.appendChild(item);
  });
}

/* SVG helpers */
function polar(cx,cy,r,a) { return { x: cx+r*Math.cos(a), y: cy+r*Math.sin(a) }; }
function makeSector(cx,cy,r1,r2,sa,ea) {
  const p1=polar(cx,cy,r2,sa),p2=polar(cx,cy,r2,ea),
        p3=polar(cx,cy,r1,ea),p4=polar(cx,cy,r1,sa);
  const la=(ea-sa>Math.PI)?1:0;
  const d=[`M ${p4.x} ${p4.y}`,`L ${p1.x} ${p1.y}`,
           `A ${r2} ${r2} 0 ${la} 1 ${p2.x} ${p2.y}`,
           `L ${p3.x} ${p3.y}`,`A ${r1} ${r1} 0 ${la} 0 ${p4.x} ${p4.y}`,'Z'].join(' ');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',d); return path;
}
function makeSVGEl(tag,attrs) {
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); return el;
}

/* ─────────────────────────────────────────
   Start screen particles
───────────────────────────────────────── */
function createParticles() {
  const c = document.getElementById('particles');
  for (let i=0; i<18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const sz = 2 + Math.random()*5;
    p.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${(Math.random()*100).toFixed(1)}%;
      bottom:${(Math.random()*40).toFixed(1)}%;
      animation-delay:${(Math.random()*10).toFixed(2)}s;
      animation-duration:${(7+Math.random()*9).toFixed(2)}s;
    `;
    c.appendChild(p);
  }
}

/* ═════════════════════════════════════════
   Public App interface
═════════════════════════════════════════ */
const App = {
  goMap() {
    updateHUD();
    renderMap();
    showScreen('screen-map');
    // Re-render paths after layout settles
    requestAnimationFrame(() => { renderPaths(); positionPlayer(false); });
  },
  goWheel() {
    renderWheel();
    showScreen('screen-wheel');
  },
  enterCurrentWorld() {
    if (isUnlocked(currentMapNode)) startQuiz(currentMapNode);
  },
  resetGame() {
    if (confirm('Wirklich zurücksetzen? Alle Punkte und Fortschritte werden gelöscht.')) {
      state = defaultState(DATA.categories);
      currentMapNode = 'grundwissen';
      saveState();
      App.goMap();
    }
  },
};

/* ═════════════════════════════════════════
   Boot
═════════════════════════════════════════ */
async function init() {
  try {
    const res = await fetch('data.json');
    DATA  = await res.json();
    state = loadState(DATA.categories);
    createParticles();
    showScreen('screen-start');

    window.addEventListener('resize', () => {
      if (document.getElementById('screen-map').classList.contains('active')) {
        renderPaths(); positionPlayer(false);
      }
    });
  } catch (err) {
    document.body.innerHTML = `
      <div style="padding:40px;color:#ff6b6b;font-family:sans-serif;line-height:1.6">
        <strong>Ladefehler:</strong> ${err.message}<br><br>
        Öffne die App über einen lokalen Server, z.B.:<br>
        <code style="background:#111;padding:4px 8px;border-radius:4px">npx serve .</code>
      </div>`;
  }
}

init();
