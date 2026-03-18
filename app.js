/* ══════════════════════════════════════════
   ARD Life – Pokemon × ARD Mediathek
   app.js  v3  —  game engine
══════════════════════════════════════════ */

const LETTERS    = ['A', 'B', 'C'];
const RUN_LENGTH = 5; // questions per world run

/* ─────────────────────────────────────────
   World themes
───────────────────────────────────────── */
const WORLDS = {
  grundwissen: {
    bg: 'linear-gradient(155deg,#0d1f10,#1a3a1f)',
    accent: '#81c784', accentGlow: '#4caf50',
    nodeBg: 'rgba(46,125,50,0.55)', nodeGlow: 'rgba(76,175,80,0.6)',
    text: '#e8f5e9', textMuted: 'rgba(232,245,233,0.52)',
    surface: 'rgba(255,255,255,0.08)', surfaceHov: 'rgba(255,255,255,0.14)',
    btnBg: '#2e7d32', btnText: '#e8f5e9',
    zoneFill: 'rgba(76,175,80,0.2)', zoneSize: 230,
    ambientChars: ['?', '!', '💡', '📚'],
  },
  sport: {
    bg: 'linear-gradient(155deg,#04080f,#071830)',
    accent: '#64b5f6', accentGlow: '#1976d2',
    nodeBg: 'rgba(21,101,192,0.55)', nodeGlow: 'rgba(100,181,246,0.65)',
    text: '#e3f2fd', textMuted: 'rgba(227,242,253,0.48)',
    surface: 'rgba(255,255,255,0.06)', surfaceHov: 'rgba(255,255,255,0.12)',
    btnBg: '#1565c0', btnText: '#e3f2fd',
    zoneFill: 'rgba(25,118,210,0.18)', zoneSize: 210,
    ambientChars: ['⚡', '▶', '◆', '●'],
  },
  musik: {
    bg: 'linear-gradient(155deg,#06010f,#15063a)',
    accent: '#ce93d8', accentGlow: '#9c27b0',
    nodeBg: 'rgba(106,27,154,0.55)', nodeGlow: 'rgba(206,147,216,0.65)',
    text: '#f3e5f5', textMuted: 'rgba(243,229,245,0.48)',
    surface: 'rgba(255,255,255,0.06)', surfaceHov: 'rgba(255,255,255,0.11)',
    btnBg: '#6a1b9a', btnText: '#f3e5f5',
    zoneFill: 'rgba(156,39,176,0.2)', zoneSize: 215,
    ambientChars: ['♪', '♫', '♬', '🎵'],
  },
  humor: {
    bg: 'linear-gradient(155deg,#3f0f00,#9f2900)',
    accent: '#ffcc02', accentGlow: '#ff9800',
    nodeBg: 'rgba(191,54,12,0.55)', nodeGlow: 'rgba(255,204,2,0.6)',
    text: '#fff8e1', textMuted: 'rgba(255,248,225,0.5)',
    surface: 'rgba(255,255,255,0.1)', surfaceHov: 'rgba(255,255,255,0.17)',
    btnBg: '#bf360c', btnText: '#fff8e1',
    zoneFill: 'rgba(230,74,25,0.18)', zoneSize: 200,
    ambientChars: ['★', '✦', '✨', '•'],
  },
  geschichte: {
    bg: 'linear-gradient(155deg,#080400,#1f1000)',
    accent: '#d4a96a', accentGlow: '#8d6e63',
    nodeBg: 'rgba(93,64,55,0.55)', nodeGlow: 'rgba(212,169,106,0.6)',
    text: '#fdf0d5', textMuted: 'rgba(253,240,213,0.48)',
    surface: 'rgba(255,200,130,0.07)', surfaceHov: 'rgba(255,200,130,0.13)',
    btnBg: '#5d4037', btnText: '#fdf0d5',
    zoneFill: 'rgba(141,110,99,0.18)', zoneSize: 205,
    ambientChars: ['◎', '✦', '○', '△'],
  },
  kultur: {
    bg: 'linear-gradient(155deg,#020204,#0a0a14)',
    accent: '#90a4ae', accentGlow: '#607d8b',
    nodeBg: 'rgba(55,71,79,0.55)', nodeGlow: 'rgba(144,164,174,0.6)',
    text: '#eceff1', textMuted: 'rgba(236,239,241,0.45)',
    surface: 'rgba(255,255,255,0.05)', surfaceHov: 'rgba(255,255,255,0.09)',
    btnBg: '#37474f', btnText: '#eceff1',
    zoneFill: 'rgba(96,125,139,0.18)', zoneSize: 195,
    ambientChars: ['◇', '□', '○', '△'],
  },
};

/* ─────────────────────────────────────────
   World narrative (mission HUD)
───────────────────────────────────────── */
const WORLD_STORY = {
  grundwissen: {
    subtitle: 'Neon Archive',
    text:     'Die Basis-KI ist instabil. Stabilisiere die Kernfakten und aktiviere das erste Datennetz.',
    objective:'🎯 Ziel: Level 3 → Sport-Portal öffnet sich',
    bonus:    '⚡ Bonus: 3er-Combo gibt +1 Punkt',
  },
  sport: {
    subtitle: 'Velocity Arena',
    text:     'In dieser Arena zählen Fokus, Rhythmus und Ausdauer. Jeder Treffer lädt den Boost-Reaktor.',
    objective:'🎯 Ziel: Level 5 in Sport erreichen',
    bonus:    '⚡ Bonus: Jede 3er-Serie = +1 Bonuspunkt',
  },
  musik: {
    subtitle: 'Echo District',
    text:     'Resonanzfelder reagieren auf richtige Antworten. Spiele im Takt und halte den Flow.',
    objective:'🎯 Ziel: Level 3 → Humor-Tor öffnet sich',
    bonus:    '⚡ Bonus: Kombos verlängern den Flow',
  },
  humor: {
    subtitle: 'Glitch Comedy Club',
    text:     'Satire-Bots prüfen deine Reaktionsfähigkeit. Lachen ist hier ein Schild gegen Rauschen.',
    objective:'🎯 Ziel: Level 3 → Geschichte-Sektor frei',
    bonus:    '⚡ Bonus: Kein Fehlklick = Combo aktiv',
  },
  geschichte: {
    subtitle: 'Chronicle Vault',
    text:     'Zeitfragmente sind verstreut. Rekonstruiere die Vergangenheit, um den Endsektor zu öffnen.',
    objective:'🎯 Ziel: Level 3 → Kultur-Galerie entsperrt',
    bonus:    '⚡ Bonus: Bonuspunkte beschleunigen den Run',
  },
  kultur: {
    subtitle: 'Finale Galerie',
    text:     'Du bist im Endgame. Vervollständige das Wissensrad und maxe alle Welten auf Level 5.',
    objective:'🎯 Ziel: 6 Welten × Level 5 = Maxout',
    bonus:    '⚡ Bonus: Breche deinen Combo-Rekord',
  },
};

/* ─────────────────────────────────────────
   Map layout
───────────────────────────────────────── */
const NODE_POS = {
  grundwissen: { x: 50, y: 82 },
  sport:       { x: 83, y: 60 },
  musik:       { x: 78, y: 23 },
  humor:       { x: 48, y: 10 },
  geschichte:  { x: 17, y: 26 },
  kultur:      { x: 14, y: 63 },
};

const PATH        = ['grundwissen','sport','musik','humor','geschichte','kultur'];
const CONNECTIONS = PATH.slice(0,-1).map((id,i) => [id, PATH[i+1]]);

/* ─────────────────────────────────────────
   Game state
───────────────────────────────────────── */
const STATE_KEY = 'ard_state_v2';
let DATA = null;
let state = null;
let currentMapNode = 'grundwissen';
let currentRun     = null; // { catId, questions, levelIdx, results, correct }
let _typerInterval = null; // active typewriter interval ref

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
      p.streak    = p.streak    || 0;
      p.maxStreak = p.maxStreak || 0;
      return p;
    }
  } catch(e) {}
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
  return (state.scores[cat.unlockRequirement.category] || 0)
    >= cat.unlockRequirement.minLevel;
}

function unlockHintText(catId) {
  const cat = DATA.categories.find(c => c.id === catId);
  if (!cat || !cat.unlockRequirement) return '';
  const { category, minLevel } = cat.unlockRequirement;
  const dep = DATA.categories.find(c => c.id === category);
  return `🔒 ${dep ? dep.label : category} Level ${state.scores[category]||0}/${minLevel}`;
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
   World theme → quiz/feedback/complete
───────────────────────────────────────── */
function applyWorldTheme(w) {
  ['screen-quiz','screen-feedback','screen-complete'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.background = w.bg;
    el.style.setProperty('--quiz-bg',            w.bg);
    el.style.setProperty('--quiz-text',          w.text);
    el.style.setProperty('--quiz-muted',         w.textMuted);
    el.style.setProperty('--quiz-accent',        w.accent);
    el.style.setProperty('--quiz-surface',       w.surface);
    el.style.setProperty('--quiz-surface-hover', w.surfaceHov);
    el.style.setProperty('--quiz-btn-bg',        w.btnBg);
    el.style.setProperty('--quiz-btn-text',      w.btnText);
  });
  // HP bar color
  const hpFill = document.getElementById('hp-bar-fill');
  if (hpFill) hpFill.style.background = w.accent;
  // Insight bar color
  const bar = document.getElementById('insight-bar');
  if (bar) bar.style.background = w.accent;
}

/* ─────────────────────────────────────────
   BATTLE INTRO ANIMATION
   Pokemon encounter flash effect
───────────────────────────────────────── */
function battleIntro(catId, callback) {
  const w   = WORLDS[catId];
  const cat = DATA.categories.find(c => c.id === catId);
  const bi  = document.getElementById('battle-intro');

  if (!bi) { callback(); return; }

  // Style the overlay background to match world
  bi.style.background = w.bg;

  // Inject world name
  const nameEl  = document.getElementById('bi-world-name');
  const eyeEl   = bi.querySelector('.bi-eyebrow');
  if (nameEl) {
    nameEl.textContent   = `${cat.emoji}  ${cat.label}`;
    nameEl.style.color   = w.accent;
    nameEl.style.textShadow = `0 0 40px ${w.accentGlow}`;
  }
  if (eyeEl) eyeEl.textContent = '— Betreten —';

  // Trigger animation
  bi.classList.remove('fadeout');
  bi.classList.add('active');

  // After 1.35s start fadeout, then callback
  setTimeout(() => {
    bi.classList.add('fadeout');
    setTimeout(() => {
      bi.classList.remove('active','fadeout');
      callback();
    }, 380);
  }, 1350);
}

/* ─────────────────────────────────────────
   TYPEWRITER EFFECT
───────────────────────────────────────── */
function typewriterQuestion(text, onComplete) {
  // Clear any previous typewriter
  if (_typerInterval) { clearInterval(_typerInterval); _typerInterval = null; }

  const el = document.getElementById('quiz-question');
  el.textContent = '';
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';

  // Add blinking cursor
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  let i = 0;
  const CHAR_DELAY = 22; // ms per character

  const finish = () => {
    clearInterval(_typerInterval);
    _typerInterval = null;
    el.textContent = text; // remove cursor, show full text
    onComplete();
  };

  // Tap anywhere on question to skip
  el.addEventListener('click', finish, { once: true });

  _typerInterval = setInterval(() => {
    if (i >= text.length) { finish(); return; }
    el.textContent = text.slice(0, ++i);
    el.appendChild(cursor); // keep cursor at end
  }, CHAR_DELAY);
}

/* ─────────────────────────────────────────
   HP BAR
───────────────────────────────────────── */
function updateHpBar(levelIdx) {
  const fill = document.getElementById('hp-bar-fill');
  if (!fill) return;
  const pct   = ((RUN_LENGTH - levelIdx) / RUN_LENGTH * 100).toFixed(1);
  fill.style.width = pct + '%';
  // Color shifts green→yellow→red as HP depletes
  if (pct > 60) {
    fill.style.background = 'var(--quiz-accent)';
  } else if (pct > 30) {
    fill.style.background = '#ffcc02';
  } else {
    fill.style.background = '#ef5350';
  }
  const w = currentRun ? WORLDS[currentRun.catId] : null;
  if (w && pct > 60) {
    fill.style.boxShadow = `0 0 10px ${w.accentGlow}`;
  } else {
    fill.style.boxShadow = '0 0 10px rgba(255,80,80,0.4)';
  }
}

/* ─────────────────────────────────────────
   AMBIENT FLOATING ELEMENTS
───────────────────────────────────────── */
function createAmbientElements(catId) {
  clearAmbient();
  const w   = WORLDS[catId];
  const el  = document.getElementById('screen-quiz');
  if (!el || !w.ambientChars) return;

  const wrap = document.createElement('div');
  wrap.id = 'ambient-wrap';
  wrap.style.cssText = `
    position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;
  `;

  const count = 10;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    const char  = w.ambientChars[Math.floor(Math.random() * w.ambientChars.length)];
    const size  = 12 + Math.random() * 18;
    const left  = (5 + Math.random() * 90).toFixed(1);
    const delay = (Math.random() * 12).toFixed(2);
    const dur   = (8 + Math.random() * 10).toFixed(2);

    piece.textContent = char;
    piece.style.cssText = `
      position:absolute;
      left:${left}%;
      bottom:${(Math.random() * 30).toFixed(1)}%;
      font-size:${size}px;
      opacity:0;
      color:${w.accent};
      animation:particleDrift ${dur}s ${delay}s linear infinite;
      filter:blur(0.5px);
    `;
    wrap.appendChild(piece);
  }

  el.appendChild(wrap);
}

function clearAmbient() {
  const el = document.getElementById('ambient-wrap');
  if (el) el.remove();
}

/* ─────────────────────────────────────────
   SCREEN FLASH  (correct / wrong)
───────────────────────────────────────── */
function flashScreen(type) {
  const el = document.getElementById('screen-flash');
  if (!el) return;
  el.className = 'screen-flash';
  void el.offsetWidth;
  el.className = `screen-flash flash-${type}`;
  setTimeout(() => { el.className = 'screen-flash'; }, 500);
}

/* ─────────────────────────────────────────
   CONFETTI
───────────────────────────────────────── */
function launchConfetti(w) {
  const container = document.getElementById('screen-complete');
  if (!container) return;
  const colors = [w.accent, '#ffd700', '#ff6b9d', '#00d4ff', w.accentGlow, '#fff'];

  for (let i = 0; i < 32; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 4 + Math.random() * 9;
    piece.style.cssText = `
      left:${(Math.random() * 100).toFixed(1)}%;
      width:${size}px; height:${size * (0.5 + Math.random())}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay:${(Math.random() * 0.8).toFixed(2)}s;
      animation-duration:${(1.8 + Math.random() * 1.5).toFixed(2)}s;
      border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

/* ═════════════════════════════════════════
   MAP ENGINE
═════════════════════════════════════════ */
function renderMap() {
  const mp = document.getElementById('map-points');
  if (mp) mp.textContent = state.points;

  generateStars();
  renderZoneGlows();
  renderPaths();
  renderNodes();
  positionPlayer(false);
  renderMissionHUD();
  setupKeyboard();
  setupSwipe();
}

function generateStars() {
  const c = document.getElementById('map-stars');
  if (c.childElementCount > 0) return;
  for (let i = 0; i < 65; i++) {
    const s  = document.createElement('div');
    s.className = 'map-star';
    const sz = 1 + Math.random() * 2.5;
    s.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${(Math.random()*98).toFixed(1)}%;
      top:${(Math.random()*98).toFixed(1)}%;
      animation-delay:${(Math.random()*7).toFixed(2)}s;
      animation-duration:${(2.5+Math.random()*4).toFixed(2)}s;
    `;
    c.appendChild(s);
  }
}

function renderZoneGlows() {
  const c = document.getElementById('map-glows');
  c.innerHTML = '';
  DATA.categories.forEach(cat => {
    const pos = NODE_POS[cat.id];
    const w   = WORLDS[cat.id];
    const d   = document.createElement('div');
    d.className = 'zone-glow';
    const sz = w.zoneSize;
    d.style.cssText = `
      left:${pos.x}%; top:${pos.y}%;
      width:${sz}px; height:${sz}px;
      background: radial-gradient(circle, ${w.zoneFill} 0%, transparent 70%);
      animation-delay:${(Math.random()*5).toFixed(2)}s;
    `;
    c.appendChild(d);
  });
}

function renderPaths() {
  const svg = document.getElementById('map-paths');
  svg.innerHTML = '';
  const mw = document.getElementById('map-world');
  const W  = mw.offsetWidth, H = mw.offsetHeight;

  CONNECTIONS.forEach(([a, b]) => {
    const pa = NODE_POS[a], pb = NODE_POS[b];
    const x1 = (pa.x/100)*W, y1 = (pa.y/100)*H;
    const x2 = (pb.x/100)*W, y2 = (pb.y/100)*H;
    const unlocked = isUnlocked(b);

    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1); line.setAttribute('y1',y1);
    line.setAttribute('x2',x2); line.setAttribute('y2',y2);
    line.setAttribute('stroke', unlocked ? WORLDS[a].accent : 'rgba(255,255,255,0.15)');
    line.setAttribute('stroke-width','2');
    line.classList.add('map-path', ...(unlocked ? [] : ['locked']));
    svg.appendChild(line);
  });
}

function renderNodes() {
  const container = document.getElementById('map-nodes');
  container.innerHTML = '';

  DATA.categories.forEach(cat => {
    const pos      = NODE_POS[cat.id];
    const w        = WORLDS[cat.id];
    const unlocked = isUnlocked(cat.id);
    const score    = Math.min(state.scores[cat.id] || 0, 5);
    const isCur    = cat.id === currentMapNode;

    const r = 26, circ = 2 * Math.PI * r;
    const filled = (score / 5) * circ;
    const gap    = circ - filled;

    const node = document.createElement('div');
    node.className =
      `map-node${!unlocked ? ' node-locked' : ''}${isCur ? ' node-current' : ''}`;
    node.style.left = pos.x + '%';
    node.style.top  = pos.y + '%';
    node.style.setProperty('--node-glow', w.nodeGlow);

    node.innerHTML = `
      <div class="node-ring">
        <svg class="node-ring-svg" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28"
            fill="${w.nodeBg}"
            stroke="rgba(255,255,255,0.07)" stroke-width="1.5"/>
          <circle cx="32" cy="32" r="${r}" fill="none"
            stroke="${unlocked ? w.accent : 'rgba(255,255,255,0.1)'}"
            stroke-width="3"
            stroke-dasharray="${filled.toFixed(1)} ${gap.toFixed(1)}"
            transform="rotate(-90 32 32)"
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

function positionPlayer(animate) {
  const player = document.getElementById('player');
  const mw     = document.getElementById('map-world');
  const pos    = NODE_POS[currentMapNode];
  const W = mw.offsetWidth, H = mw.offsetHeight;
  const x = (pos.x / 100) * W;
  const y = (pos.y / 100) * H - 44;

  player.style.transition = animate
    ? 'left 0.55s cubic-bezier(0.25,0.46,0.45,0.94), top 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
    : 'none';
  player.style.left = x + 'px';
  player.style.top  = y + 'px';
}

function movePlayerTo(catId) {
  if (catId === currentMapNode) {
    if (isUnlocked(catId)) startRun(catId);
    return;
  }
  currentMapNode = catId;
  renderNodes();
  positionPlayer(true);
  renderMissionHUD();
  renderPaths();
}

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
    btn.textContent      = 'Betreten →';
    btn.disabled         = false;
    btn.style.background = w.btnBg;
    btn.style.color      = w.btnText;
    btn.style.boxShadow  = `0 4px 22px ${w.accentGlow}55`;
  } else {
    btn.textContent      = unlockHintText(currentMapNode);
    btn.disabled         = true;
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.color      = 'rgba(255,255,255,0.28)';
    btn.style.boxShadow  = 'none';
  }

  const comboEl = document.getElementById('mission-combo');
  if (comboEl) {
    if (state.streak >= 2) {
      comboEl.textContent   = `🔥 ×${state.streak}`;
      comboEl.style.display = 'block';
    } else {
      comboEl.style.display = 'none';
    }
  }

  hud.classList.add('visible');
}

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
      e.preventDefault();
      App.enterCurrentWorld();
    }
  };
}

function setupSwipe() {
  const mw = document.getElementById('map-world');
  let sx = 0, sy = 0;
  mw.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  mw.addEventListener('touchend', e => {
    const dx  = sx - e.changedTouches[0].clientX;
    const dy  = sy - e.changedTouches[0].clientY;
    const idx = PATH.indexOf(currentMapNode);
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx >  45 && PATH[idx+1]) movePlayerTo(PATH[idx+1]);
      if (dx < -45 && PATH[idx-1]) movePlayerTo(PATH[idx-1]);
    } else {
      if (dy >  45 && PATH[idx+1]) movePlayerTo(PATH[idx+1]);
      if (dy < -45 && PATH[idx-1]) movePlayerTo(PATH[idx-1]);
    }
  }, { passive: true });
}

/* ═════════════════════════════════════════
   RUN SYSTEM  –  5 levels per world
═════════════════════════════════════════ */
function startRun(catId) {
  const w   = WORLDS[catId];
  const cat = DATA.categories.find(c => c.id === catId);

  // Pick RUN_LENGTH unseen questions (reset pool if needed)
  const all  = DATA.questions.filter(q => q.category === catId);
  let pool   = all.filter(q => !state.seen.includes(q.id));
  if (pool.length < RUN_LENGTH) {
    state.seen = state.seen.filter(id => !all.map(q => q.id).includes(id));
    saveState();
    pool = [...all];
  }
  const shuffled  = pool.sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, RUN_LENGTH);

  currentRun = { catId, questions, levelIdx: 0, correct: 0, results: [] };
  applyWorldTheme(w);

  // Battle intro → then show quiz
  battleIntro(catId, () => {
    createAmbientElements(catId);
    showQuizLevel();
  });
}

function showQuizLevel() {
  const { catId, questions, levelIdx } = currentRun;
  const q   = questions[levelIdx];
  const w   = WORLDS[catId];
  const cat = DATA.categories.find(c => c.id === catId);

  /* topbar */
  document.getElementById('battle-world-name').textContent = `${cat.emoji} ${cat.label}`;
  document.getElementById('quiz-points').textContent       = state.points;

  /* level label + pips + HP bar */
  document.getElementById('level-track-label').textContent =
    `LEVEL ${levelIdx + 1} / ${RUN_LENGTH}`;
  updatePips();

  /* content card */
  document.getElementById('quiz-source').textContent = q.title;
  const link = document.getElementById('content-link');
  link.href        = q.url;
  link.textContent = 'ardmediathek.de →';

  /* render options FIRST (hidden), then typewriter */
  const optsEl = document.getElementById('quiz-options');
  optsEl.innerHTML = '';
  optsEl.classList.add('hidden'); // dimmed + non-interactive during typewriter

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-letter">${LETTERS[i]}</span>
      <span class="option-text">${opt}</span>
    `;
    btn.addEventListener('click', () => submitAnswer(i, btn));
    optsEl.appendChild(btn);
  });

  showScreen('screen-quiz');

  /* typewriter question — reveals options when done */
  typewriterQuestion(q.question, () => {
    optsEl.classList.remove('hidden');
    // cascade animation on buttons
    optsEl.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.style.opacity         = '0';
      btn.style.animation       = 'none';
      void btn.offsetWidth;
      btn.style.animation       = 'optionIn 0.32s ease forwards';
      btn.style.animationDelay  = `${i * 80}ms`;
    });
  });
}

function updatePips() {
  const pips = document.querySelectorAll('.pip');
  const { levelIdx, results } = currentRun;
  pips.forEach((pip, i) => {
    pip.className = 'pip';
    if (i < results.length) {
      pip.classList.add('done', results[i] ? 'correct' : 'wrong');
    } else if (i === levelIdx) {
      pip.classList.add('current');
    }
  });
  updateHpBar(levelIdx);
}

function submitAnswer(selectedIndex, clickedBtn) {
  // Disable all options immediately
  document.querySelectorAll('.option-btn').forEach(b => (b.disabled = true));

  // Lock-in state: brief pulse before reveal
  clickedBtn.classList.add('locking');

  setTimeout(() => {
    clickedBtn.classList.remove('locking');
    revealAnswer(selectedIndex, clickedBtn);
  }, 300);
}

function revealAnswer(selectedIndex, clickedBtn) {
  const q       = currentRun.questions[currentRun.levelIdx];
  const correct = selectedIndex === q.correctIndex;

  document.querySelectorAll('.option-btn')[q.correctIndex].classList.add('correct');
  if (!correct) clickedBtn.classList.add('wrong');

  currentRun.results.push(correct);

  if (correct) {
    state.points  += 1;
    state.streak  += 1;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    if (state.streak % 3 === 0) state.points += 1; // combo bonus
    currentRun.correct += 1;
    flashScreen('correct');
    createSparkles(clickedBtn);
  } else {
    state.streak = 0;
    flashScreen('wrong');
    shakeScreen();
  }

  if (!state.seen.includes(q.id)) state.seen.push(q.id);
  saveState();

  setTimeout(() => showFeedback(correct), 700);
}

function showFeedback(correct) {
  const { catId, levelIdx, results, questions } = currentRun;
  const q      = questions[levelIdx];
  const w      = WORLDS[catId];
  const isLast = levelIdx === RUN_LENGTH - 1;

  const streak   = state.streak;
  const combo    = correct && streak >= 2 ? ` · Combo ×${streak}` : '';
  const bonusTxt = correct && streak > 0 && streak % 3 === 0 ? ' (+1 ⭐)' : '';

  document.getElementById('fb-icon').textContent =
    correct ? (streak >= 3 ? '🔥' : '🎉') : '😌';

  const result = document.getElementById('fb-result');
  result.textContent  = correct ? `Richtig!${combo}${bonusTxt}` : 'Leider falsch.';
  result.style.animation = 'none';
  void result.offsetWidth;
  result.style.animation = '';

  const cl = document.getElementById('fb-correct-label');
  if (!correct) {
    cl.textContent    = `✓ ${q.options[q.correctIndex]}`;
    cl.style.display  = 'block';
  } else {
    cl.style.display  = 'none';
  }

  document.getElementById('fb-insight').textContent       = q.insight;
  document.getElementById('insight-bar').style.background = w.accent;

  const link = document.getElementById('fb-link');
  link.href        = q.url;
  link.textContent = `${q.title} →`;

  /* Weiter button */
  const btn = document.getElementById('btn-weiter');
  if (isLast) {
    btn.textContent      = 'Welt abschließen →';
    btn.style.background = w.btnBg;
    btn.style.color      = w.btnText;
    btn.style.border     = 'none';
    btn.style.boxShadow  = `0 4px 20px ${w.accentGlow}55`;
  } else {
    btn.textContent      = `Level ${levelIdx + 2} / ${RUN_LENGTH} →`;
    btn.style.background = 'rgba(255,255,255,0.1)';
    btn.style.color      = '#fff';
    btn.style.border     = '1px solid rgba(255,255,255,0.12)';
    btn.style.boxShadow  = 'none';
  }

  /* +1 float */
  if (correct) {
    const pf = document.getElementById('point-float');
    pf.classList.remove('floating');
    void pf.offsetWidth;
    pf.classList.add('floating');
    setTimeout(() => pf.classList.remove('floating'), 1200);
  }

  updatePips();
  document.getElementById('quiz-points').textContent = state.points;
  showScreen('screen-feedback');
}

function nextLevel() {
  currentRun.levelIdx += 1;
  showQuizLevel();
}

function finishRun() {
  const { catId, correct } = currentRun;
  const w = WORLDS[catId];

  const unlockedBefore = DATA.categories.map(c => ({ id: c.id, was: isUnlocked(c.id) }));

  state.scores[catId] = Math.max(state.scores[catId] || 0, correct);
  state.streak = 0;
  saveState();

  const newUnlocks = DATA.categories.filter(c => {
    const before = unlockedBefore.find(u => u.id === c.id);
    return before && !before.was && isUnlocked(c.id);
  });

  clearAmbient();
  showCompletion(correct, newUnlocks, w);
}

function showCompletion(correct, newUnlocks, w) {
  applyWorldTheme(w);

  const bg = document.getElementById('complete-bg');
  bg.style.cssText = `
    position:absolute;inset:0;
    background: radial-gradient(ellipse at 50% 40%, ${w.accentGlow}35 0%, transparent 65%);
    pointer-events:none;z-index:0;
  `;

  const trophies = ['😅','😤','🌟','🏅','🥇','🏆'];
  document.getElementById('complete-trophy').textContent = trophies[correct] || '🏆';

  document.getElementById('complete-title').textContent =
    correct >= 4 ? 'Welt gemeistert!' :
    correct >= 2 ? 'Welt beendet!'    : 'Weiter kämpfen!';

  /* Stars with staggered delay */
  const starsEl = document.getElementById('complete-stars');
  starsEl.innerHTML = '';
  for (let i = 0; i < RUN_LENGTH; i++) {
    const s = document.createElement('span');
    s.className = `complete-star${i >= correct ? ' empty' : ''}`;
    s.textContent = '⭐';
    s.style.animationDelay = `${0.35 + i * 0.12}s`;
    starsEl.appendChild(s);
  }

  document.getElementById('complete-fraction').textContent =
    `${correct} von ${RUN_LENGTH} Fragen richtig`;

  /* Unlocks */
  const unlocksEl = document.getElementById('complete-unlocks');
  unlocksEl.innerHTML = '';
  newUnlocks.forEach(cat => {
    const uw  = WORLDS[cat.id];
    const tag = document.createElement('div');
    tag.className = 'unlock-tag';
    tag.style.borderColor = uw.accent + '55';
    tag.innerHTML = `
      <span class="unlock-tag-icon">${cat.emoji}</span>
      <span><strong>${cat.label}</strong> freigeschaltet!</span>
    `;
    unlocksEl.appendChild(tag);
  });

  showScreen('screen-complete');

  // Confetti for decent scores
  if (correct >= 3) {
    setTimeout(() => launchConfetti(w), 350);
  }
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

  const defs = makeSVGEl('defs',{});
  defs.innerHTML = `
    <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  svg.appendChild(defs);
  svg.appendChild(makeSVGEl('circle',{cx,cy,r:outerR,
    fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.05)','stroke-width':1}));

  const segs = [];
  DATA.categories.forEach((cat, i) => {
    const w       = WORLDS[cat.id];
    const sa      = startOff + i * anglePer;
    const ea      = sa + anglePer;
    const score   = Math.min(state.scores[cat.id] || 0, 5);
    const fillPct = score / 5;

    const bg = makeSector(cx,cy,innerR,outerR,sa,ea);
    bg.setAttribute('fill', w.accentGlow);
    bg.setAttribute('fill-opacity','0.1');
    bg.classList.add('wheel-seg'); svg.appendChild(bg); segs.push(bg);

    if (fillPct > 0) {
      const fr   = innerR + (outerR - innerR) * fillPct;
      const fill = makeSector(cx,cy,innerR,fr,sa,ea);
      fill.setAttribute('fill', w.accent);
      fill.setAttribute('fill-opacity','0.88');
      fill.setAttribute('filter','url(#glow)');
      fill.classList.add('wheel-seg'); svg.appendChild(fill); segs.push(fill);
    }

    const p1 = polar(cx,cy,innerR,sa), p2 = polar(cx,cy,outerR,sa);
    svg.appendChild(makeSVGEl('line',{
      x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,
      stroke:'rgba(0,0,0,0.5)','stroke-width':1.5
    }));

    const mp = polar(cx,cy,outerR+18,(sa+ea)/2);
    const t  = makeSVGEl('text',{
      x:mp.x, y:mp.y,
      'text-anchor':'middle','dominant-baseline':'middle','font-size':16
    });
    t.textContent = cat.emoji; svg.appendChild(t);
  });

  svg.appendChild(makeSVGEl('circle',{cx,cy,r:innerR,
    fill:'#080812',stroke:'rgba(255,255,255,0.07)','stroke-width':1.5}));
  const cPts = makeSVGEl('text',{x:cx,y:cy-6,'text-anchor':'middle',
    'font-size':20,'font-weight':700,fill:'#ffd700'});
  cPts.textContent = state.points; svg.appendChild(cPts);
  const cLbl = makeSVGEl('text',{x:cx,y:cy+11,'text-anchor':'middle',
    'font-size':10,fill:'rgba(255,255,255,0.3)'});
  cLbl.textContent = 'Punkte'; svg.appendChild(cLbl);

  setTimeout(() => {
    segs.forEach((s,i) => setTimeout(() => s.classList.add('visible'), i*65));
  }, 80);

  const leg = document.getElementById('wheel-legend');
  leg.innerHTML = '';
  DATA.categories.forEach(cat => {
    const w     = WORLDS[cat.id];
    const score = Math.min(state.scores[cat.id]||0,5);
    const item  = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${w.accent}"></span>
      <span>${cat.label}: ${score}/${RUN_LENGTH}</span>`;
    leg.appendChild(item);
  });
}

/* ─── SVG helpers ─── */
function polar(cx,cy,r,a)  { return { x:cx+r*Math.cos(a), y:cy+r*Math.sin(a) }; }
function makeSector(cx,cy,r1,r2,sa,ea) {
  const p1=polar(cx,cy,r2,sa), p2=polar(cx,cy,r2,ea),
        p3=polar(cx,cy,r1,ea), p4=polar(cx,cy,r1,sa);
  const la = (ea-sa > Math.PI) ? 1 : 0;
  const d  = [
    `M ${p4.x} ${p4.y}`, `L ${p1.x} ${p1.y}`,
    `A ${r2} ${r2} 0 ${la} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`, `A ${r1} ${r1} 0 ${la} 0 ${p4.x} ${p4.y}`, 'Z'
  ].join(' ');
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',d); return path;
}
function makeSVGEl(tag,attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v)); return el;
}

/* ─── Animation helpers ─── */
function createSparkles(btn) {
  const rect = btn.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const w    = WORLDS[currentRun.catId];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * 2 * Math.PI + (Math.random() * 0.3);
    const dist  = 44 + Math.random() * 32;
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.cssText = `
      left:${cx}px; top:${cy}px; background:${i % 2 === 0 ? w.accent : '#ffd700'};
      --dx:${(Math.cos(angle)*dist).toFixed(1)}px;
      --dy:${(Math.sin(angle)*dist).toFixed(1)}px;
    `;
    document.body.appendChild(spark);
    requestAnimationFrame(() => spark.classList.add('burst'));
    setTimeout(() => spark.remove(), 650);
  }
}

function shakeScreen() {
  const el = document.getElementById('screen-quiz');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

/* ─── Start screen particles ─── */
function createParticles() {
  const c = document.getElementById('particles');
  for (let i = 0; i < 22; i++) {
    const p  = document.createElement('div');
    p.className = 'particle';
    const sz = 2 + Math.random() * 4;
    // Blue-tinted particles to match ARD brand
    const blue = Math.random() > 0.4;
    p.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${(Math.random()*100).toFixed(1)}%;
      bottom:${(Math.random()*40).toFixed(1)}%;
      background:${blue ? `rgba(0,100,255,${(0.3+Math.random()*0.5).toFixed(2)})` : `rgba(255,255,255,${(0.2+Math.random()*0.4).toFixed(2)})`};
      animation-delay:${(Math.random()*12).toFixed(2)}s;
      animation-duration:${(8+Math.random()*9).toFixed(2)}s;
    `;
    c.appendChild(p);
  }
}

/* ═════════════════════════════════════════
   Public App interface
═════════════════════════════════════════ */
const App = {
  goMap() {
    currentRun = null;
    clearAmbient();
    if (_typerInterval) { clearInterval(_typerInterval); _typerInterval = null; }
    const mp = document.getElementById('map-points');
    if (mp) mp.textContent = state.points;
    renderMap();
    showScreen('screen-map');
    requestAnimationFrame(() => { renderPaths(); positionPlayer(false); });
  },

  goWheel() {
    renderWheel();
    showScreen('screen-wheel');
  },

  enterCurrentWorld() {
    if (isUnlocked(currentMapNode)) startRun(currentMapNode);
  },

  abandonRun() {
    currentRun = null;
    clearAmbient();
    if (_typerInterval) { clearInterval(_typerInterval); _typerInterval = null; }
    App.goMap();
  },

  weiterAction() {
    if (!currentRun) { App.goMap(); return; }
    const isLast = currentRun.levelIdx === RUN_LENGTH - 1;
    if (isLast) {
      finishRun();
    } else {
      nextLevel();
    }
  },

  resetGame() {
    if (confirm('Wirklich zurücksetzen? Alle Punkte und Fortschritte werden gelöscht.')) {
      state          = defaultState(DATA.categories);
      currentRun     = null;
      currentMapNode = 'grundwissen';
      clearAmbient();
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
      <div style="padding:40px;color:#aac8ff;font-family:sans-serif;line-height:1.7;background:#0d0d14;height:100vh">
        <strong style="color:#0064ff;font-size:20px">ARD Life</strong><br><br>
        Ladefehler: ${err.message}<br><br>
        Öffne die App über einen lokalen Server:<br>
        <code style="background:#16162a;padding:6px 10px;border-radius:6px;display:inline-block;margin-top:6px">
          npx serve .
        </code>
      </div>`;
  }
}

init();
