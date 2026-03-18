/* ══════════════════════════════════════════
   ARD Life – Das Wissensduell
   app.js  v4  —  Multiplayer Board Game
══════════════════════════════════════════ */

/* ═════════════════════════════════════════
   WEB AUDIO ENGINE
═════════════════════════════════════════ */
let _audioCtx = null;
let _muted    = false;

function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return _audioCtx;
}
function playTone(freq, type, duration, gain = 0.3, startDelay = 0) {
  if (_muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol); vol.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    const t = ctx.currentTime + startDelay;
    vol.gain.setValueAtTime(0, t);
    vol.gain.linearRampToValueAtTime(gain, t + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t); osc.stop(t + duration + 0.05);
  } catch(e) {}
}
function synthCorrect()  { [523,659,784].forEach((f,i) => playTone(f,'sine',0.2,0.22,i*0.08)); }
function synthWrong()    { playTone(330,'sawtooth',0.25,0.14,0); playTone(247,'sawtooth',0.3,0.12,0.12); }
function synthDuel()     { playTone(110,'sawtooth',0.7,0.3,0); playTone(55,'sine',0.9,0.35,0.1); }
function synthSteal()    { [784,659,523].forEach((f,i) => playTone(f,'sine',0.25,0.25,i*0.09)); }
function synthUnlock()   { [523,587,659,784].forEach((f,i) => playTone(f,'sine',0.35,0.28,i*0.12)); setTimeout(()=>[784,880,1047].forEach((f,i)=>playTone(f,'sine',0.4,0.22,i*0.1)),520); }
function synthRoll()     { [330,415,523].forEach((f,i) => playTone(f,'sine',0.15,0.15,i*0.06)); }
function synthTick()     { playTone(1400,'square',0.018,0.035); }
function synthNav()      { playTone(440,'sine',0.12,0.1,0); playTone(550,'sine',0.1,0.08,0.06); }
function synthEvent()    { [261,329,392].forEach((f,i) => playTone(f,'sine',0.3,0.2,i*0.1)); }
function synthCombo()    { [523,659,784,1047].forEach((f,i) => playTone(f,'square',0.18,0.14,i*0.07)); }
function synthWin()      { [261,329,392,523,659,784,1047].forEach((f,i) => playTone(f,'sine',0.5,0.2,i*0.08)); }

/* ═════════════════════════════════════════
   NARRATOR
═════════════════════════════════════════ */
let _narratorTimer = null;
function showNarrator(text, duration = 2500) {
  const box = document.getElementById('narrator');
  if (!box) return;
  document.getElementById('narrator-text').textContent = text;
  box.classList.remove('narrator-exit');
  box.classList.add('narrator-active');
  clearTimeout(_narratorTimer);
  _narratorTimer = setTimeout(() => {
    box.classList.add('narrator-exit');
    setTimeout(() => box.classList.remove('narrator-active','narrator-exit'), 500);
  }, duration);
}

/* ═════════════════════════════════════════
   VISUAL EFFECTS
═════════════════════════════════════════ */
function flashScreen(type) {
  const el = document.getElementById('screen-flash');
  if (!el) return;
  el.className = 'screen-flash';
  void el.offsetWidth;
  el.className = `screen-flash flash-${type}`;
  setTimeout(() => { el.className = 'screen-flash'; }, 500);
}

function showScreenCrack() {
  const el = document.getElementById('screen-crack');
  if (!el) return;
  el.classList.remove('crack-active');
  void el.offsetWidth;
  el.classList.add('crack-active');
  setTimeout(() => el.classList.remove('crack-active'), 750);
}

function createSparkles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * 2 * Math.PI;
    const dist  = 44 + Math.random() * 32;
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.cssText = `left:${x}px;top:${y}px;background:${i%2===0?color:'#ffd700'};
      --dx:${(Math.cos(angle)*dist).toFixed(1)}px;--dy:${(Math.sin(angle)*dist).toFixed(1)}px;`;
    document.body.appendChild(spark);
    requestAnimationFrame(() => spark.classList.add('burst'));
    setTimeout(() => spark.remove(), 650);
  }
}

function spawnConfetti(container) {
  const colors = ['#ff6b6b','#4ecdc4','#ffd700','#c084fc','#ff9f43','#00d4ff'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 4 + Math.random() * 8;
    piece.style.cssText = `
      left:${Math.random()*100}%;width:${size}px;height:${size*(0.5+Math.random())}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${(Math.random()*0.8).toFixed(2)}s;
      animation-duration:${(1.8+Math.random()*1.5).toFixed(2)}s;
      border-radius:${Math.random()>0.4?'50%':'2px'};
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

/* ═════════════════════════════════════════
   WORLD THEMES (6 categories)
═════════════════════════════════════════ */
const WORLDS = {
  grundwissen: { accent:'#81c784', accentGlow:'#4caf50', btnBg:'#2e7d32', label:'Grundwissen', emoji:'🧠' },
  sport:       { accent:'#64b5f6', accentGlow:'#1976d2', btnBg:'#1565c0', label:'Sport',       emoji:'⚽' },
  musik:       { accent:'#ce93d8', accentGlow:'#9c27b0', btnBg:'#6a1b9a', label:'Musik',       emoji:'🎵' },
  humor:       { accent:'#ffcc02', accentGlow:'#ff9800', btnBg:'#bf360c', label:'Humor',       emoji:'😂' },
  geschichte:  { accent:'#d4a96a', accentGlow:'#8d6e63', btnBg:'#5d4037', label:'Geschichte',  emoji:'📚' },
  kultur:      { accent:'#90a4ae', accentGlow:'#607d8b', btnBg:'#37474f', label:'Kultur',      emoji:'🌍' },
};

const PLAYER_COLORS  = ['#ff6b6b','#4ecdc4','#ffd700','#c084fc'];
const PLAYER_AVATARS = ['🦊','🐺','🦁','🐻','🐉','👾','🤖','🦋'];

/* ═════════════════════════════════════════
   BOARD DEFINITION (30 spaces, 5×6 snake)
═════════════════════════════════════════ */
const BOARD = [
  // Row 1 → left to right
  { type:'start',    cat:null },
  { type:'question', cat:'grundwissen' },
  { type:'question', cat:'sport' },
  { type:'duel',     cat:null },
  { type:'question', cat:'musik' },
  { type:'question', cat:'humor' },
  // Row 2 → right to left
  { type:'question', cat:'geschichte' },
  { type:'bonus',    cat:'grundwissen' },
  { type:'question', cat:'kultur' },
  { type:'event',    cat:null },
  { type:'question', cat:'sport' },
  { type:'question', cat:'musik' },
  // Row 3 → left to right
  { type:'question', cat:'humor' },
  { type:'duel',     cat:null },
  { type:'bonus',    cat:'sport' },
  { type:'question', cat:'geschichte' },
  { type:'question', cat:'kultur' },
  { type:'question', cat:'grundwissen' },
  // Row 4 → right to left
  { type:'event',    cat:null },
  { type:'question', cat:'musik' },
  { type:'question', cat:'humor' },
  { type:'duel',     cat:null },
  { type:'bonus',    cat:'musik' },
  { type:'question', cat:'geschichte' },
  // Row 5 → left to right
  { type:'question', cat:'grundwissen' },
  { type:'question', cat:'sport' },
  { type:'duel',     cat:null },
  { type:'bonus',    cat:'humor' },
  { type:'event',    cat:null },
  { type:'end',      cat:null },
];

/* ═════════════════════════════════════════
   ARD EVENT CARDS
═════════════════════════════════════════ */
const ARD_EVENTS = [
  {
    id:'breaking-news', emoji:'📢',
    title:'Tagesschau Extra!',
    desc:'Die nächste Frage für ALLE zählt 4 Punkte statt 2!',
    effect:'bonus_next_global',
  },
  {
    id:'bundesliga', emoji:'🏆',
    title:'Bundesliga-Finale!',
    desc:'Alle Spieler rücken sofort 2 Felder vor!',
    effect:'all_advance_2',
  },
  {
    id:'kabarett', emoji:'🎭',
    title:'Kabarett-Abend!',
    desc:'Der Letzte darf 3 Punkte vom Führenden stehlen!',
    effect:'last_steals_leader',
  },
  {
    id:'starprogramm', emoji:'⭐',
    title:'Starprogramm!',
    desc:'Alle Spieler bekommen sofort +2 Punkte!',
    effect:'all_gain_2',
  },
  {
    id:'sendepause', emoji:'📺',
    title:'Sendepause!',
    desc:'Der nächste Spieler setzt eine Runde aus.',
    effect:'skip_next',
  },
  {
    id:'schwarzer-peter', emoji:'🃏',
    title:'Schwarzer Peter!',
    desc:'Der Führende verliert 3 Punkte!',
    effect:'leader_loses_3',
  },
  {
    id:'shuffle', emoji:'🔀',
    title:'Mediathek Shuffle!',
    desc:'Alle Spieler tauschen ihre Positionen auf dem Brett!',
    effect:'shuffle_positions',
  },
];

/* ═════════════════════════════════════════
   GAME STATE
═════════════════════════════════════════ */
let DATA = null;

let gameState = {
  players: [],
  currentPlayerIdx: 0,
  phase: 'roll',
  seenQuestions: [],
  eventDeck: [],
  finalRoundTriggered: false,
  finalRoundCount: 0,
  skipNextPlayer: false,
  bonusNextGlobal: false,
  pendingDuel: null,
  _handoffCallback: null,
};

function currentPlayer() {
  return gameState.players[gameState.currentPlayerIdx];
}

function nextTurn() {
  // Check win after final round countdown
  if (gameState.finalRoundTriggered) {
    gameState.finalRoundCount--;
    if (gameState.finalRoundCount <= 0) {
      endGame();
      return;
    }
  }

  let next = (gameState.currentPlayerIdx + 1) % gameState.players.length;

  // Skip next player event effect
  if (gameState.skipNextPlayer) {
    gameState.skipNextPlayer = false;
    const skipped = gameState.players[next];
    showNarrator(`${skipped.avatar} ${skipped.name} setzt diese Runde aus! 📺`, 2000);
    next = (next + 1) % gameState.players.length;
  }

  gameState.currentPlayerIdx = next;
  gameState.phase = 'roll';
  updateScoreStrip();

  // Show pass-and-play handoff screen
  showHandoff(gameState.players[next], () => {
    updateTurnControls();
  });
}

/* ═════════════════════════════════════════
   HANDOFF SCREEN
═════════════════════════════════════════ */
function showHandoff(player, onTap) {
  gameState._handoffCallback = onTap;
  document.getElementById('ho-avatar').textContent = player.avatar;
  document.getElementById('ho-name').textContent   = player.name || `Spieler`;
  document.getElementById('ho-name').style.color   = player.color;
  document.getElementById('screen-handoff').style.background =
    `radial-gradient(ellipse at 50% 40%, ${player.color}22 0%, #08080f 65%)`;
  showScreen('screen-handoff');
}

/* ═════════════════════════════════════════
   SCREEN MANAGEMENT
═════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function hideAllOverlays() {
  document.getElementById('question-sheet').classList.remove('qs-active');
  document.getElementById('target-overlay').classList.remove('to-active');
  document.getElementById('event-overlay').classList.remove('eo-active');
}

/* ═════════════════════════════════════════
   START PARTICLES
═════════════════════════════════════════ */
function createParticles(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  for (let i = 0; i < 22; i++) {
    const p  = document.createElement('div');
    p.className = 'particle';
    const sz = 2 + Math.random() * 4;
    const blue = Math.random() > 0.4;
    p.style.cssText = `
      width:${sz}px;height:${sz}px;
      left:${(Math.random()*100).toFixed(1)}%;
      bottom:${(Math.random()*40).toFixed(1)}%;
      background:${blue?`rgba(0,100,255,${(0.3+Math.random()*0.5).toFixed(2)})`:`rgba(255,255,255,${(0.2+Math.random()*0.4).toFixed(2)})`};
      animation-delay:${(Math.random()*12).toFixed(2)}s;
      animation-duration:${(8+Math.random()*9).toFixed(2)}s;
    `;
    c.appendChild(p);
  }
}

/* ═════════════════════════════════════════
   SETUP SCREEN
═════════════════════════════════════════ */
let setupPlayerCount = 2;
let setupPlayers = [
  { name:'', avatar:'🦊', color: PLAYER_COLORS[0] },
  { name:'', avatar:'🐺', color: PLAYER_COLORS[1] },
  { name:'', avatar:'🦁', color: PLAYER_COLORS[2] },
  { name:'', avatar:'🐻', color: PLAYER_COLORS[3] },
];

function renderSetup() {
  const body = document.getElementById('setup-body');
  body.innerHTML = '';

  // Player count picker
  const countWrap = document.createElement('div');
  countWrap.className = 'setup-count-wrap';
  countWrap.innerHTML = `<div class="setup-section-label">Wie viele Spieler?</div>`;
  const countBtns = document.createElement('div');
  countBtns.className = 'setup-count-btns';
  [2,3,4].forEach(n => {
    const btn = document.createElement('button');
    btn.className = `setup-count-btn${n === setupPlayerCount ? ' active' : ''}`;
    btn.textContent = n;
    btn.onclick = () => { setupPlayerCount = n; renderSetup(); };
    countBtns.appendChild(btn);
  });
  countWrap.appendChild(countBtns);
  body.appendChild(countWrap);

  // Player entries
  const entriesLabel = document.createElement('div');
  entriesLabel.className = 'setup-section-label';
  entriesLabel.textContent = 'Spieler benennen:';
  body.appendChild(entriesLabel);

  for (let i = 0; i < setupPlayerCount; i++) {
    const p = setupPlayers[i];
    const card = document.createElement('div');
    card.className = 'setup-player-card';
    card.style.borderColor = p.color;

    // Avatar picker
    const avatarRow = document.createElement('div');
    avatarRow.className = 'setup-avatar-row';
    PLAYER_AVATARS.forEach(av => {
      const avBtn = document.createElement('button');
      avBtn.className = `setup-avatar-btn${av === p.avatar ? ' active' : ''}`;
      avBtn.textContent = av;
      avBtn.style.borderColor = av === p.avatar ? p.color : 'transparent';
      avBtn.onclick = () => { setupPlayers[i].avatar = av; renderSetup(); };
      avatarRow.appendChild(avBtn);
    });

    // Name input
    const nameInput = document.createElement('input');
    nameInput.className = 'setup-name-input';
    nameInput.type = 'text';
    nameInput.maxLength = 12;
    nameInput.placeholder = `Spieler ${i+1}`;
    nameInput.value = p.name;
    nameInput.style.borderColor = p.color;
    nameInput.oninput = (e) => { setupPlayers[i].name = e.target.value; };

    // Player number badge
    const badge = document.createElement('div');
    badge.className = 'setup-player-num';
    badge.style.background = p.color;
    badge.textContent = `P${i+1} ${p.avatar}`;

    card.appendChild(badge);
    card.appendChild(nameInput);
    card.appendChild(avatarRow);
    body.appendChild(card);
  }
}

/* ═════════════════════════════════════════
   BOARD RENDERING
═════════════════════════════════════════ */
function getGridPos(idx) {
  const row = Math.floor(idx / 6);
  const col  = idx % 6;
  const displayCol = row % 2 === 0 ? col : 5 - col;
  return { row: row + 1, col: displayCol + 1 }; // 1-based
}

function renderBoard() {
  const grid = document.getElementById('board-grid');
  grid.innerHTML = '';

  BOARD.forEach((space, idx) => {
    const { row, col } = getGridPos(idx);
    const div = document.createElement('div');
    div.id = `space-${idx}`;
    div.className = `board-space board-space--${space.type}`;
    div.style.gridRow    = row;
    div.style.gridColumn = col;

    let icon = '';
    let color = 'rgba(255,255,255,0.06)';
    if (space.type === 'question' || space.type === 'bonus') {
      const w = WORLDS[space.cat];
      color = w.accentGlow + '33';
      div.style.borderColor = w.accentGlow + '55';
      icon = space.type === 'bonus' ? `<span class="space-bonus-star">⭐</span>${w.emoji}` : w.emoji;
    } else if (space.type === 'duel')  { icon = '⚔️'; color='rgba(255,80,0,0.18)'; div.style.borderColor='rgba(255,80,0,0.45)'; }
    else if (space.type === 'event')   { icon = '📺'; color='rgba(0,100,255,0.18)'; div.style.borderColor='rgba(0,100,255,0.45)'; }
    else if (space.type === 'start')   { icon = '🏁'; color='rgba(255,215,0,0.15)'; div.style.borderColor='rgba(255,215,0,0.5)'; }
    else if (space.type === 'end')     { icon = '🏆'; color='rgba(255,215,0,0.25)'; div.style.borderColor='rgba(255,215,0,0.8)'; }

    div.style.background = color;
    div.innerHTML = `<span class="space-icon">${icon}</span><span class="space-num">${idx}</span>`;
    grid.appendChild(div);
  });

  renderTokens();
}

/* ═════════════════════════════════════════
   TOKEN RENDERING
═════════════════════════════════════════ */
function renderTokens() {
  const layer   = document.getElementById('token-layer');
  const wrapper = document.getElementById('board-wrapper');
  if (!layer || !wrapper) return;
  layer.innerHTML = '';

  // Group players by position
  const byPos = {};
  gameState.players.forEach(p => {
    if (!byPos[p.position]) byPos[p.position] = [];
    byPos[p.position].push(p);
  });

  Object.entries(byPos).forEach(([pos, players]) => {
    const spaceEl = document.getElementById(`space-${pos}`);
    if (!spaceEl) return;
    const sRect = spaceEl.getBoundingClientRect();
    const wRect = wrapper.getBoundingClientRect();
    const cx = sRect.left - wRect.left + sRect.width / 2;
    const cy = sRect.top  - wRect.top  + sRect.height / 2;
    const n  = players.length;

    players.forEach((p, i) => {
      const offX = n > 1 ? (i - (n-1)/2) * 14 : 0;
      const offY = 0;
      const token = document.createElement('div');
      token.id = `token-${p.id}`;
      token.className = 'player-token';
      token.style.cssText = `
        left:${(cx + offX).toFixed(1)}px;
        top:${(cy + offY).toFixed(1)}px;
        background:${p.color};
        box-shadow: 0 0 12px ${p.color}88;
      `;
      token.textContent = p.avatar;
      if (p.id === currentPlayer().id) token.classList.add('token-active');
      layer.appendChild(token);
    });
  });
}

/* ═════════════════════════════════════════
   SCORE STRIP
═════════════════════════════════════════ */
function lifeStatsHtml(p) {
  return `<div class="sc-life" id="sc-life-${p.id}">
    <span class="sc-life-stat">📚${p.bildung}</span>
    <span class="sc-life-stat">🤝${p.gemeinschaft}</span>
    <span class="sc-life-stat">🍀${p.glueck}</span>
  </div>`;
}

function renderScoreStrip() {
  const strip = document.getElementById('score-strip');
  strip.innerHTML = '';
  gameState.players.forEach(p => {
    const card = document.createElement('div');
    card.id = `score-card-${p.id}`;
    card.className = `score-card${p.id === currentPlayer().id ? ' score-card--active' : ''}`;
    card.style.borderColor = p.color;
    card.innerHTML = `
      <span class="sc-avatar">${p.avatar}</span>
      <div class="sc-info">
        <span class="sc-name">${p.name || 'Spieler'}</span>
        ${lifeStatsHtml(p)}
      </div>
      <span class="sc-points" id="sc-pts-${p.id}">${p.points}⭐</span>
    `;
    strip.appendChild(card);
  });
}

function updateScoreStrip() {
  gameState.players.forEach(p => {
    const pts = document.getElementById(`sc-pts-${p.id}`);
    if (pts) pts.textContent = `${p.points}⭐`;
    const life = document.getElementById(`sc-life-${p.id}`);
    if (life) life.innerHTML = `
      <span class="sc-life-stat">📚${p.bildung}</span>
      <span class="sc-life-stat">🤝${p.gemeinschaft}</span>
      <span class="sc-life-stat">🍀${p.glueck}</span>
    `;
    const card = document.getElementById(`score-card-${p.id}`);
    if (card) card.classList.toggle('score-card--active', p.id === currentPlayer().id);
  });
}

function updateTurnControls() {
  const cp = currentPlayer();
  document.getElementById('cp-avatar').textContent = cp.avatar;
  document.getElementById('cp-name').textContent   = cp.name || `Spieler ${gameState.currentPlayerIdx+1}`;
  const rollBtn = document.getElementById('roll-btn');
  rollBtn.style.background = cp.color;
  rollBtn.disabled = false;
}

/* ═════════════════════════════════════════
   DICE & ROLL
═════════════════════════════════════════ */
const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

function animateDice(finalValue, callback) {
  const face = document.getElementById('roll-dice-face');
  let count  = 0;
  const max  = 12;
  synthRoll();
  const iv = setInterval(() => {
    face.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    count++;
    if (count >= max) {
      clearInterval(iv);
      face.textContent = DICE_FACES[finalValue - 1];
      callback();
    }
  }, 60);
}

/* ═════════════════════════════════════════
   MOVE ANIMATION (step by step)
═════════════════════════════════════════ */
function animateMove(player, steps, onLand) {
  if (steps <= 0) { onLand(); return; }
  const next = Math.min(player.position + 1, BOARD.length - 1);
  player.position = next;
  renderTokens();
  synthNav();

  // Flash the space briefly
  const spaceEl = document.getElementById(`space-${next}`);
  if (spaceEl) {
    spaceEl.classList.add('space-visited');
    setTimeout(() => spaceEl.classList.remove('space-visited'), 180);
  }

  setTimeout(() => {
    if (next === BOARD.length - 1) {
      onLand();
    } else {
      animateMove(player, steps - 1, onLand);
    }
  }, 230);
}

/* ═════════════════════════════════════════
   SPACE RESOLUTION
═════════════════════════════════════════ */
function resolveSpace(player) {
  const space = BOARD[player.position];
  gameState.phase = space.type;

  if (space.type === 'end') {
    triggerFinalRound(player);
    return;
  }
  if (space.type === 'start') {
    showNarrator(`${player.avatar} ist wieder am Start! Weiter! 🏁`, 1500);
    setTimeout(nextTurn, 1800);
    return;
  }
  if (space.type === 'question' || space.type === 'bonus') {
    const pts = (space.type === 'bonus' || gameState.bonusNextGlobal) ? 4 : 2;
    if (gameState.bonusNextGlobal) gameState.bonusNextGlobal = false;
    showQuestion(player, space.cat, pts);
    return;
  }
  if (space.type === 'duel') {
    showTargetPicker(player);
    return;
  }
  if (space.type === 'event') {
    triggerEvent();
    return;
  }
}

function triggerFinalRound(player) {
  if (!gameState.finalRoundTriggered) {
    gameState.finalRoundTriggered = true;
    // How many players still get a turn after this one?
    const n = gameState.players.length;
    const remaining = n - 1; // others each get 1 more turn
    gameState.finalRoundCount = remaining;
    synthUnlock();
    showNarrator(`🏆 ${player.name} hat das Ziel erreicht! LETZTE RUNDE! 🏆`, 3000);
    setTimeout(() => {
      if (remaining === 0) { endGame(); } else { nextTurn(); }
    }, 3200);
  } else {
    // This player already triggered it or is in final round
    setTimeout(nextTurn, 500);
  }
}

/* ═════════════════════════════════════════
   QUESTION SYSTEM
═════════════════════════════════════════ */
let _questionTimerTimeout = null;

function getQuestion(catId) {
  if (!DATA) return null;
  const all  = DATA.questions.filter(q => q.category === catId);
  const pool = all.filter(q => !gameState.seenQuestions.includes(q.id));
  if (pool.length === 0) {
    // Reset pool for this category
    gameState.seenQuestions = gameState.seenQuestions.filter(id => !all.map(q=>q.id).includes(id));
    return all[Math.floor(Math.random() * all.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function showQuestion(player, catId, pts) {
  const q = getQuestion(catId);
  if (!q) { setTimeout(nextTurn, 500); return; }
  gameState.seenQuestions.push(q.id);

  const w = WORLDS[catId];
  const sheet = document.getElementById('question-sheet');

  // Header
  document.getElementById('qs-player-tag').textContent   = `${player.avatar} ${player.name || 'Spieler'}`;
  document.getElementById('qs-player-tag').style.color   = player.color;
  document.getElementById('qs-category-tag').textContent = `${w.emoji} ${w.label}`;
  document.getElementById('qs-category-tag').style.color = w.accent;
  document.getElementById('qs-pts-tag').textContent      = `+${pts} ⭐`;
  document.getElementById('qs-source').textContent       = q.title;

  // Question (typewriter)
  typewriterText('qs-question', q.question, () => {});

  // Options
  const optsEl = document.getElementById('qs-options');
  optsEl.innerHTML = '';
  const letters = ['A','B','C'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'qs-option-btn';
    btn.style.borderColor = w.accentGlow + '55';
    btn.innerHTML = `<span class="qs-letter" style="background:${w.btnBg}">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = () => resolveAnswer(i, q, player, pts, btn, optsEl);
    optsEl.appendChild(btn);
  });

  // Timer (10s)
  clearTimeout(_questionTimerTimeout);
  const timerBar = document.getElementById('qs-timer-bar');
  timerBar.style.animation = 'none';
  void timerBar.offsetWidth;
  timerBar.style.background = w.accentGlow;
  timerBar.style.animation = 'timerCountdown 10s linear forwards';

  _questionTimerTimeout = setTimeout(() => {
    // Time's up — treat as wrong
    disableOptions(optsEl);
    showNarrator(`⏱️ Zeit abgelaufen! Kein Punkt für ${player.avatar}`, 1800);
    flashScreen('wrong');
    setTimeout(() => {
      sheet.classList.remove('qs-active');
      nextTurn();
    }, 2000);
  }, 10500);

  sheet.classList.add('qs-active');
}

function resolveAnswer(selectedIdx, q, player, pts, clickedBtn, optsEl) {
  clearTimeout(_questionTimerTimeout);
  disableOptions(optsEl);

  const correct = selectedIdx === q.correctIndex;
  const btns    = optsEl.querySelectorAll('.qs-option-btn');

  btns[q.correctIndex].classList.add('qs-opt-correct');
  if (!correct) clickedBtn.classList.add('qs-opt-wrong');

  if (correct) {
    player.points += pts;
    // Life stats: scale by pts multiplier vs base 2
    const multiplier = pts / 2;
    const lp = q.points || {};
    player.bildung      += Math.round((lp.bildung      || 0) * multiplier);
    player.gemeinschaft += Math.round((lp.gemeinschaft || 0) * multiplier);
    player.glueck       += Math.round((lp.glueck       || 0) * multiplier);
    flashScreen('correct');
    synthCorrect();
    if (navigator.vibrate) navigator.vibrate(50);
    const rect = clickedBtn.getBoundingClientRect();
    createSparkles(rect.left + rect.width/2, rect.top + rect.height/2, WORLDS[BOARD[player.position].cat]?.accentGlow || '#ffd700');
    animateScoreUpdate(player, pts, true);
    if (pts === 4) showNarrator(`✨ BONUS! ${player.avatar} holt ${pts} Punkte!`, 2000);
    else showNarrator(`${player.avatar} hat Recht! +${pts} Punkte! 🎉`, 1800);
  } else {
    flashScreen('wrong');
    synthWrong();
    showScreenCrack();
    if (navigator.vibrate) navigator.vibrate([80,30,80]);
    showNarrator(`${player.avatar} liegt daneben... Kein Punkt!`, 1800);
  }

  updateScoreStrip();

  setTimeout(() => {
    document.getElementById('question-sheet').classList.remove('qs-active');
    nextTurn();
  }, 2000);
}

function disableOptions(optsEl) {
  optsEl.querySelectorAll('.qs-option-btn').forEach(b => b.disabled = true);
}

/* ═════════════════════════════════════════
   TYPEWRITER
═════════════════════════════════════════ */
let _typerInterval = null;
function typewriterText(elId, text, onDone) {
  if (_typerInterval) { clearInterval(_typerInterval); _typerInterval = null; }
  const el = document.getElementById(elId);
  if (!el) { onDone(); return; }
  el.textContent = '';
  let i = 0;
  _typerInterval = setInterval(() => {
    if (i >= text.length) {
      clearInterval(_typerInterval); _typerInterval = null;
      onDone(); return;
    }
    el.textContent = text.slice(0, ++i);
    if (i % 3 === 0) synthTick();
  }, 22);
}

/* ═════════════════════════════════════════
   DUEL SYSTEM
═════════════════════════════════════════ */
function showTargetPicker(challenger) {
  const list    = document.getElementById('to-list');
  const overlay = document.getElementById('target-overlay');
  list.innerHTML = '';

  const opponents = gameState.players.filter(p => p.id !== challenger.id);
  opponents.forEach(target => {
    const btn = document.createElement('button');
    btn.className = 'to-player-btn';
    btn.style.borderColor = target.color;
    btn.innerHTML = `
      <span class="to-avatar">${target.avatar}</span>
      <span class="to-pname">${target.name || 'Spieler'}</span>
      <span class="to-pts" style="color:${target.color}">${target.points} ⭐</span>
    `;
    btn.onclick = () => {
      overlay.classList.remove('to-active');
      startDuel(challenger, target);
    };
    list.appendChild(btn);
  });

  overlay.classList.add('to-active');
}

let _duelTimerTimeout = null;
let _duelLocked = { challenger: false, defender: false };

function startDuel(challenger, defender) {
  synthDuel();
  showNarrator(`⚔️ ${challenger.avatar} ${challenger.name} fordert ${defender.avatar} ${defender.name} heraus!`, 2200);

  // Pick a random question (random category)
  const cats = Object.keys(WORLDS);
  const cat  = cats[Math.floor(Math.random() * cats.length)];
  const q    = getQuestion(cat);
  if (!q) { nextTurn(); return; }
  gameState.seenQuestions.push(q.id);

  gameState.pendingDuel = { challenger, defender, q };
  _duelLocked = { challenger: false, defender: false };

  // Populate duel screen
  const w = WORLDS[cat];
  document.getElementById('duel-question-text').textContent = q.question;

  const letters = ['A','B','C'];

  function makeDuelBtns(containerId, playerKey) {
    const opts = document.getElementById(containerId);
    opts.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'duel-opt-btn';
      btn.style.borderColor = gameState.pendingDuel[playerKey].color + '88';
      btn.innerHTML = `<span class="duel-letter">${letters[i]}</span><span>${opt}</span>`;
      btn.onclick = () => resolveDuelAnswer(i, q, playerKey, btn, opts);
      opts.appendChild(btn);
    });
  }

  makeDuelBtns('duel-challenger-opts', 'challenger');
  makeDuelBtns('duel-defender-opts',   'defender');

  document.getElementById('duel-challenger-label').innerHTML =
    `${challenger.avatar} <span style="color:${challenger.color}">${challenger.name || 'Spieler'}</span> · ANGREIFER`;
  document.getElementById('duel-defender-label').innerHTML =
    `${defender.avatar} <span style="color:${defender.color}">${defender.name || 'Spieler'}</span> · VERTEIDIGER`;

  // Timer
  const timerBar = document.getElementById('duel-timer-bar');
  timerBar.style.animation = 'none';
  void timerBar.offsetWidth;
  timerBar.style.animation = 'timerCountdown 15s linear forwards';

  clearTimeout(_duelTimerTimeout);
  _duelTimerTimeout = setTimeout(() => {
    showNarrator('⏱️ Niemand hat rechtzeitig geantwortet! Unentschieden!', 2000);
    setTimeout(() => { showScreen('screen-board'); nextTurn(); }, 2500);
  }, 15500);

  setTimeout(() => showScreen('screen-duel'), 2400); // brief delay after narrator
}

function resolveDuelAnswer(selectedIdx, q, playerKey, clickedBtn, opts) {
  if (_duelLocked[playerKey]) return;
  _duelLocked[playerKey] = true;
  clearTimeout(_duelTimerTimeout);

  const duel     = gameState.pendingDuel;
  const correct  = selectedIdx === q.correctIndex;
  const player   = duel[playerKey];
  const other    = playerKey === 'challenger' ? duel.defender : duel.challenger;
  const otherKey = playerKey === 'challenger' ? 'defender' : 'challenger';

  // Lock out other side too
  _duelLocked[otherKey] = true;
  const otherOpts = document.getElementById(otherKey === 'challenger' ? 'duel-challenger-opts' : 'duel-defender-opts');
  if (otherOpts) otherOpts.querySelectorAll('.duel-opt-btn').forEach(b => b.disabled = true);

  // Show correct answer
  opts.querySelectorAll('.duel-opt-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === q.correctIndex) b.classList.add('duel-opt-correct');
  });
  if (!correct) clickedBtn.classList.add('duel-opt-wrong');

  setTimeout(() => {
    if (correct) {
      // Winner steals from loser
      const steal = Math.min(3, other.points);
      other.points  = Math.max(0, other.points - steal);
      player.points += steal;
      synthSteal();
      if (navigator.vibrate) navigator.vibrate([100,50,100]);
      flashScreen('correct');
      animateSteal(other, player, steal);
      showNarrator(`⚔️ ${player.avatar} gewinnt! +${steal} GESTOHLEN von ${other.avatar}! 💸`, 2500);
    } else {
      // Wrong answer — other player auto-wins (they defended)
      if (!_duelLocked[otherKey] || true) {
        const steal = Math.min(3, player.points);
        player.points = Math.max(0, player.points - steal);
        other.points += steal;
        synthSteal();
        flashScreen('wrong');
        showScreenCrack();
        animateSteal(player, other, steal);
        showNarrator(`${player.avatar} greift daneben! ${other.avatar} verteidigt! +${steal} ⭐`, 2500);
      }
    }

    updateScoreStrip();
    setTimeout(() => {
      showScreen('screen-board');
      nextTurn();
    }, 2800);
  }, 700);
}

/* ═════════════════════════════════════════
   STEAL ANIMATION
═════════════════════════════════════════ */
function animateSteal(fromPlayer, toPlayer, amount) {
  const fromEl = document.getElementById(`score-card-${fromPlayer.id}`);
  const toEl   = document.getElementById(`score-card-${toPlayer.id}`);
  if (!fromEl || !toEl) return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect   = toEl.getBoundingClientRect();

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const orb = document.createElement('div');
      orb.className = 'steal-orb';
      orb.textContent = '⭐';
      orb.style.cssText = `
        left:${fromRect.left + fromRect.width/2}px;
        top:${fromRect.top + fromRect.height/2}px;
      `;
      document.body.appendChild(orb);

      const dx = toRect.left + toRect.width/2  - (fromRect.left + fromRect.width/2);
      const dy = toRect.top  + toRect.height/2 - (fromRect.top  + fromRect.height/2);
      orb.style.setProperty('--steal-dx', dx + 'px');
      orb.style.setProperty('--steal-dy', dy + 'px');

      requestAnimationFrame(() => orb.classList.add('steal-orb--fly'));
      setTimeout(() => orb.remove(), 900);
    }, i * 100);
  }

  // Flash labels
  const fromPts = document.getElementById(`sc-pts-${fromPlayer.id}`);
  if (fromPts) { fromPts.classList.add('pts-lose'); setTimeout(() => fromPts.classList.remove('pts-lose'), 600); }
  const toPts = document.getElementById(`sc-pts-${toPlayer.id}`);
  if (toPts)   { toPts.classList.add('pts-gain');   setTimeout(() => toPts.classList.remove('pts-gain'), 600); }
}

function animateScoreUpdate(player, amount, isGain) {
  const card = document.getElementById(`score-card-${player.id}`);
  if (!card) return;
  const pts = document.getElementById(`sc-pts-${player.id}`);
  if (pts) {
    pts.classList.add(isGain ? 'pts-gain' : 'pts-lose');
    setTimeout(() => pts.classList.remove('pts-gain','pts-lose'), 600);
  }
  // Float number
  const rect = card.getBoundingClientRect();
  const float = document.createElement('div');
  float.className = 'score-float';
  float.textContent = isGain ? `+${amount} ⭐` : `-${amount} ⭐`;
  float.style.cssText = `left:${rect.left+rect.width/2}px;top:${rect.top}px;color:${isGain?'#ffd700':'#ef5350'};`;
  document.body.appendChild(float);
  setTimeout(() => float.remove(), 1200);
}

/* ═════════════════════════════════════════
   ARD EVENT SYSTEM
═════════════════════════════════════════ */
function triggerEvent() {
  if (gameState.eventDeck.length === 0) {
    gameState.eventDeck = [...ARD_EVENTS].sort(() => Math.random() - 0.5);
  }
  const ev = gameState.eventDeck.pop();
  synthEvent();

  document.getElementById('eo-emoji').textContent = ev.emoji;
  document.getElementById('eo-title').textContent = ev.title;
  document.getElementById('eo-desc').textContent  = ev.desc;

  const overlay = document.getElementById('event-overlay');
  overlay.classList.add('eo-active');

  setTimeout(() => {
    overlay.classList.remove('eo-active');
    applyEventEffect(ev);
  }, 3000);
}

function applyEventEffect(ev) {
  const players = gameState.players;
  const sorted  = [...players].sort((a,b) => b.points - a.points);
  const leader  = sorted[0];
  const last    = sorted[sorted.length - 1];

  switch(ev.effect) {
    case 'bonus_next_global':
      gameState.bonusNextGlobal = true;
      showNarrator('📢 Nächste Frage zählt 4 Punkte für ALLE!', 2000);
      break;
    case 'all_advance_2':
      players.forEach(p => { p.position = Math.min(p.position + 2, BOARD.length - 1); });
      renderTokens();
      showNarrator('🏆 Alle rücken 2 Felder vor!', 2000);
      break;
    case 'last_steals_leader':
      if (last.id !== leader.id) {
        const steal = Math.min(3, leader.points);
        leader.points = Math.max(0, leader.points - steal);
        last.points  += steal;
        animateSteal(leader, last, steal);
        showNarrator(`🎭 ${last.avatar} stiehlt ${steal} Punkte von ${leader.avatar}! 😈`, 2500);
      }
      break;
    case 'all_gain_2':
      players.forEach(p => { p.points += 2; animateScoreUpdate(p, 2, true); });
      showNarrator('⭐ Alle bekommen +2 Punkte! 🎉', 2000);
      break;
    case 'skip_next':
      gameState.skipNextPlayer = true;
      showNarrator('📺 Nächster Spieler setzt eine Runde aus!', 2000);
      break;
    case 'leader_loses_3':
      if (leader.points >= 3) {
        leader.points -= 3;
        animateScoreUpdate(leader, 3, false);
        showNarrator(`🃏 Schwarzer Peter! ${leader.avatar} ${leader.name} verliert 3 Punkte!`, 2500);
      }
      break;
    case 'shuffle_positions':
      const positions = players.map(p => p.position).sort(() => Math.random()-0.5);
      players.forEach((p, i) => { p.position = positions[i]; });
      renderTokens();
      showNarrator('🔀 Alle Positionen wurden gemischt! Chaos!', 2500);
      break;
  }

  updateScoreStrip();
  setTimeout(nextTurn, 2800);
}

/* ═════════════════════════════════════════
   END GAME & WINNER SCREEN
═════════════════════════════════════════ */
function endGame() {
  showScreen('screen-winner');
  synthWin();
  showNarrator('🏆 Das Spiel ist vorbei! Herzlichen Glückwunsch!', 3000);

  const sorted   = [...gameState.players].sort((a,b) => b.points - a.points);
  const podium   = document.getElementById('winner-podium');
  podium.innerHTML = '';
  const medals   = ['🥇','🥈','🥉','🎖️'];

  sorted.forEach((p, rank) => {
    const row = document.createElement('div');
    row.className = `winner-row${rank === 0 ? ' winner-row--first' : ''}`;
    row.style.borderColor = p.color;
    if (rank === 0) row.style.boxShadow = `0 0 24px ${p.color}55`;
    row.innerHTML = `
      <span class="winner-medal">${medals[rank] || '🎖️'}</span>
      <span class="winner-avatar">${p.avatar}</span>
      <span class="winner-name">${p.name || `Spieler ${rank+1}`}</span>
      <span class="winner-score" style="color:${p.color}">${p.points} ⭐</span>
    `;
    podium.appendChild(row);
  });

  // Life Awards
  const awardsEl = document.getElementById('winner-life-awards');
  if (awardsEl) {
    awardsEl.innerHTML = '';
    const awards = [
      { key:'bildung',      icon:'📚', label:'Bildung',       color:'#81c784' },
      { key:'gemeinschaft', icon:'🤝', label:'Gemeinschaft',  color:'#64b5f6' },
      { key:'glueck',       icon:'🍀', label:'Lebensfreude',  color:'#ffcc02' },
    ];
    awards.forEach(a => {
      const winner = [...gameState.players].sort((x,y) => y[a.key] - x[a.key])[0];
      if (winner[a.key] === 0) return;
      const pill = document.createElement('div');
      pill.className = 'winner-award-pill';
      pill.style.borderColor = a.color + '55';
      pill.innerHTML = `<span>${a.icon}</span><span style="color:${a.color}">${a.label}</span><span>${winner.avatar} ${winner.name}</span>`;
      awardsEl.appendChild(pill);
    });
  }

  // Confetti
  setTimeout(() => spawnConfetti(document.getElementById('winner-particles')), 400);
}

/* ═════════════════════════════════════════
   PUBLIC GAME OBJECT
═════════════════════════════════════════ */
const Game = {
  goStart() {
    showScreen('screen-start');
  },

  goSetup() {
    getAudioCtx(); // unlock audio context
    setupPlayerCount = 2;
    setupPlayers = [
      { name:'', avatar:'🦊', color: PLAYER_COLORS[0] },
      { name:'', avatar:'🐺', color: PLAYER_COLORS[1] },
      { name:'', avatar:'🦁', color: PLAYER_COLORS[2] },
      { name:'', avatar:'🐻', color: PLAYER_COLORS[3] },
    ];
    renderSetup();
    showScreen('screen-setup');
  },

  startGame() {
    // Build player list
    gameState.players = [];
    for (let i = 0; i < setupPlayerCount; i++) {
      const sp = setupPlayers[i];
      gameState.players.push({
        id:           `p${i+1}`,
        name:         sp.name || `Spieler ${i+1}`,
        avatar:       sp.avatar,
        color:        sp.color,
        position:     0,
        points:       0,
        bildung:      0,
        gemeinschaft: 0,
        glueck:       0,
      });
    }
    gameState.currentPlayerIdx   = 0;
    gameState.phase              = 'roll';
    gameState.seenQuestions      = [];
    gameState.eventDeck          = [...ARD_EVENTS].sort(() => Math.random()-0.5);
    gameState.finalRoundTriggered = false;
    gameState.finalRoundCount    = 0;
    gameState.skipNextPlayer     = false;
    gameState.bonusNextGlobal    = false;
    gameState.pendingDuel        = null;

    showScreen('screen-board');
    renderBoard();
    renderScoreStrip();
    updateTurnControls();

    // First player handoff
    const first = gameState.players[0];
    setTimeout(() => {
      showNarrator('🎲 Das Spiel beginnt! Viel Erfolg!', 2000);
      setTimeout(() => showHandoff(first, () => updateTurnControls()), 2200);
    }, 400);
  },

  roll() {
    if (gameState.phase !== 'roll') return;
    gameState.phase = 'moving';
    const btn = document.getElementById('roll-btn');
    btn.disabled = true;

    const roll = Math.ceil(Math.random() * 6);
    const cp   = currentPlayer();

    animateDice(roll, () => {
      setTimeout(() => {
        animateMove(cp, roll, () => {
          resolveSpace(cp);
        });
      }, 400);
    });
  },

  dismissHandoff() {
    const cb = gameState._handoffCallback;
    gameState._handoffCallback = null;
    showScreen('screen-board');
    if (cb) cb();
  },

  rematch() {
    // Same players, reset everything
    gameState.players.forEach(p => { p.position = 0; p.points = 0; p.bildung = 0; p.gemeinschaft = 0; p.glueck = 0; });
    gameState.currentPlayerIdx   = 0;
    gameState.phase              = 'roll';
    gameState.seenQuestions      = [];
    gameState.eventDeck          = [...ARD_EVENTS].sort(() => Math.random()-0.5);
    gameState.finalRoundTriggered = false;
    gameState.finalRoundCount    = 0;
    gameState.skipNextPlayer     = false;
    gameState.bonusNextGlobal    = false;
    gameState.pendingDuel        = null;

    showScreen('screen-board');
    renderBoard();
    renderScoreStrip();
    updateTurnControls();

    const first = gameState.players[0];
    setTimeout(() => {
      showNarrator('🔄 Nochmal! Zeigt, was ihr drauf habt!', 2000);
      setTimeout(() => showHandoff(first, () => updateTurnControls()), 2200);
    }, 400);
  },
};

/* ═════════════════════════════════════════
   BOOT
═════════════════════════════════════════ */
async function init() {
  try {
    const res = await fetch('data.json');
    DATA = await res.json();
    createParticles('particles');
    showScreen('screen-start');
  } catch(err) {
    document.body.innerHTML = `
      <div style="padding:40px;color:#aac8ff;font-family:sans-serif;line-height:1.7;background:#0d0d14;height:100vh">
        <strong style="color:#0064ff;font-size:20px">ARD Life</strong><br><br>
        Ladefehler: ${err.message}<br><br>
        Öffne die App über einen lokalen Server:<br>
        <code style="background:#16162a;padding:6px 10px;border-radius:6px;display:inline-block;margin-top:6px">npx serve .</code>
      </div>`;
  }
}

init();
