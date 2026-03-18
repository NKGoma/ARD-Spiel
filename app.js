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
/* Category SVG logos – monochromatic ARD blue style */
const _SVG_GRUNDWISSEN = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;flex-shrink:0">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#005A9F" stroke-width="5" stroke-dasharray="58 14 58 14" stroke-linecap="round"/>
  <polygon points="50,27 30,34 28,71 50,64" fill="#1E5C8E"/><polygon points="50,27 37,31 35,67 50,64" fill="#005A9F"/>
  <polygon points="50,27 70,34 72,71 50,64" fill="#1E5C8E"/><polygon points="50,27 63,31 65,67 50,64" fill="#005A9F"/>
  <line x1="50" y1="27" x2="50" y2="64" stroke="white" stroke-width="2"/>
  <line x1="50" y1="64" x2="38" y2="77" stroke="white" stroke-width="1.5"/><line x1="50" y1="64" x2="50" y2="79" stroke="white" stroke-width="1.5"/><line x1="50" y1="64" x2="62" y2="77" stroke="white" stroke-width="1.5"/>
</svg>`;

const _SVG_SPORT = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;flex-shrink:0">
  <path d="M18,50 A32,32 0 1,1 50,82" fill="none" stroke="#005A9F" stroke-width="5" stroke-linecap="round"/>
  <circle cx="28" cy="42" r="9" fill="none" stroke="#005A9F" stroke-width="3.5"/><circle cx="40" cy="42" r="9" fill="none" stroke="#1E5C8E" stroke-width="3.5"/><circle cx="52" cy="42" r="9" fill="none" stroke="#005A9F" stroke-width="3.5"/>
  <polygon points="70,27 65,30 68,34" fill="#005A9F"/>
  <polygon points="68,34 62,47 72,44 77,35" fill="#1E5C8E"/>
  <polygon points="62,47 58,61 65,59 68,47" fill="#005A9F"/><polygon points="72,44 78,59 72,61 70,47" fill="#1E5C8E"/>
  <polygon points="62,39 54,49 58,51 66,42" fill="#005A9F"/><polygon points="74,38 80,49 76,51 71,41" fill="#005A9F"/>
</svg>`;

const _SVG_MUSIK = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;flex-shrink:0">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#005A9F" stroke-width="5" stroke-dasharray="48 12 48 12" stroke-linecap="round"/>
  <polygon points="50,18 46,24 48,30 54,28 56,22" fill="#1E5C8E"/>
  <polygon points="48,30 42,37 42,44 50,46 56,42 54,34" fill="#005A9F"/>
  <polygon points="42,44 40,52 44,58 50,58 52,52 50,46" fill="#1E5C8E"/>
  <polygon points="44,58 42,66 48,70 54,66 52,58" fill="#005A9F"/>
  <ellipse cx="44" cy="74" rx="8" ry="6" fill="#1E5C8E"/>
  <polygon points="48,70 46,78 50,82 54,78 52,70" fill="#005A9F"/>
  <line x1="52" y1="30" x2="52" y2="80" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
</svg>`;

const _SVG_HUMOR = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;flex-shrink:0">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#005A9F" stroke-width="5" stroke-dasharray="54 12 54 12" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="35" fill="#1A1D24" stroke="#005A9F" stroke-width="3"/>
  <polygon points="34,37 32,42 36,45 40,42 38,37" fill="#005A9F"/>
  <path d="M56,40 Q62,35 68,40" fill="none" stroke="#005A9F" stroke-width="3" stroke-linecap="round"/>
  <path d="M56,40 Q62,45 68,40" fill="none" stroke="#005A9F" stroke-width="3" stroke-linecap="round"/>
  <polygon points="31,57 30,67 70,67 69,57" fill="#005A9F"/>
  <rect x="33" y="59" width="34" height="6" rx="2" fill="white"/>
</svg>`;

const _SVG_GESCHICHTE = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;flex-shrink:0">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#005A9F" stroke-width="5" stroke-dasharray="50 12 50 12" stroke-linecap="round"/>
  <rect x="36" y="80" width="28" height="4" rx="1" fill="#1E5C8E"/><rect x="38" y="76" width="24" height="4" rx="1" fill="#005A9F"/>
  <rect x="40" y="64" width="4" height="12" fill="#1E5C8E"/><rect x="46" y="64" width="4" height="12" fill="#005A9F"/><rect x="52" y="64" width="4" height="12" fill="#1E5C8E"/><rect x="58" y="64" width="4" height="12" fill="#005A9F"/>
  <rect x="36" y="17" width="28" height="4" rx="1" fill="#1E5C8E"/>
  <polygon points="36,21 64,21 56,43 44,43" fill="#005A9F"/>
  <polygon points="41,21 59,21 54,33 46,33" fill="#1E5C8E" opacity="0.55"/>
  <rect x="44" y="43" width="12" height="4" rx="1" fill="#1E5C8E"/>
  <polygon points="44,47 56,47 64,63 36,63" fill="#005A9F"/>
  <polygon points="45,57 55,57 57,63 43,63" fill="#1E5C8E" opacity="0.55"/>
  <rect x="36" y="63" width="28" height="4" rx="1" fill="#1E5C8E"/>
</svg>`;

const _SVG_KULTUR = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;flex-shrink:0">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#005A9F" stroke-width="5" stroke-dasharray="48 12 48 12" stroke-linecap="round"/>
  <rect x="28" y="30" width="18" height="40" rx="2" fill="#005A9F"/>
  <rect x="30" y="34" width="14" height="12" rx="1" fill="#1A1D24"/><rect x="30" y="50" width="14" height="12" rx="1" fill="#1A1D24"/>
  <rect x="28" y="32" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="28" y="39" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="28" y="46" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="28" y="53" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="28" y="60" width="3" height="3" rx="1" fill="#1A1D24"/>
  <rect x="54" y="30" width="18" height="40" rx="2" fill="#1E5C8E"/>
  <rect x="56" y="34" width="14" height="12" rx="1" fill="#1A1D24"/><rect x="56" y="50" width="14" height="12" rx="1" fill="#1A1D24"/>
  <rect x="69" y="32" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="69" y="39" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="69" y="46" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="69" y="53" width="3" height="3" rx="1" fill="#1A1D24"/><rect x="69" y="60" width="3" height="3" rx="1" fill="#1A1D24"/>
</svg>`;

const WORLDS = {
  grundwissen: { accent:'#0A6ED1', accentGlow:'#005A9F', btnBg:'#003478', label:'Grundwissen', emoji:'🧠', svg:_SVG_GRUNDWISSEN },
  sport:       { accent:'#1E88E5', accentGlow:'#005A9F', btnBg:'#003478', label:'Sport',       emoji:'⚽', svg:_SVG_SPORT       },
  musik:       { accent:'#0A6ED1', accentGlow:'#005A9F', btnBg:'#003478', label:'Musik',       emoji:'🎵', svg:_SVG_MUSIK       },
  humor:       { accent:'#F5A623', accentGlow:'#cc8800', btnBg:'#7a5200', label:'Humor',       emoji:'😂', svg:_SVG_HUMOR       },
  geschichte:  { accent:'#C7CBD1', accentGlow:'#8A9099', btnBg:'#3a3f48', label:'Geschichte',  emoji:'📚', svg:_SVG_GESCHICHTE  },
  kultur:      { accent:'#0A6ED1', accentGlow:'#005A9F', btnBg:'#003478', label:'Kultur',      emoji:'🌍', svg:_SVG_KULTUR      },
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
   ZUFALLS-RAD (SPIN THE WHEEL)
═════════════════════════════════════════ */
const WHEEL_SEGMENTS = [
  { emoji:'🎯', label:'Doppelpunkte', desc:'Deine nächste Frage zählt doppelt!',           color:'#005A9F', effect:'double_next'   },
  { emoji:'💸', label:'Punkteklau',   desc:'Du stiehlst 2 Punkte vom Führenden!',          color:'#0A6ED1', effect:'steal_2_leader' },
  { emoji:'⚡', label:'Turbo!',       desc:'Rücke sofort 3 Felder vor!',                   color:'#1E88E5', effect:'advance_3'      },
  { emoji:'🔄', label:'Tausch!',      desc:'Tausche Position mit einem zufälligen Gegner!',color:'#003878', effect:'swap_position'  },
  { emoji:'🌊', label:'Alle ran!',    desc:'Alle Spieler beantworten die nächste Frage!',  color:'#005A9F', effect:'all_answer'     },
  { emoji:'📺', label:'Sendepause',   desc:'Aussetzen – aber +3 Punkte für dich!',         color:'#0A6ED1', effect:'skip_gain_3'   },
  { emoji:'🃏', label:'Joker',        desc:'Wähle deine Fragenkategorie frei!',            color:'#1E88E5', effect:'free_category'  },
  { emoji:'🎲', label:'Glücksrad',    desc:'Zufälliger Punktgewinn oder -verlust!',        color:'#003878', effect:'random_points'  },
];

let _wheelUsedThisTurn = false;
let _wheelSpinning     = false;
let _pendingWheelEffect = null;

function synthSpin() {
  [220,277,330,415,523,659,784,1047].forEach((f,i) => playTone(f,'sine',0.14,0.16,i*0.07));
}

function drawWheel(rotation) {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 150, cy = 150, r = 138;
  const n = WHEEL_SEGMENTS.length;
  const segAngle = (2 * Math.PI) / n;
  ctx.clearRect(0, 0, 300, 300);

  WHEEL_SEGMENTS.forEach((seg, i) => {
    const startA = rotation + i * segAngle - Math.PI / 2;
    const endA   = startA + segAngle;
    const lighter = i % 2 === 0;

    // Segment fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startA, endA);
    ctx.closePath();
    ctx.fillStyle = lighter ? seg.color : _lightenHex(seg.color, 28);
    ctx.fill();
    ctx.strokeStyle = '#0F1115';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emoji + label
    const midA = startA + segAngle / 2;
    const tx = cx + Math.cos(midA) * (r * 0.62);
    const ty = cy + Math.sin(midA) * (r * 0.62);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(midA + Math.PI / 2);
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seg.emoji, 0, -7);
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(seg.label.toUpperCase(), 0, 9);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#0F1115';
  ctx.fill();
  ctx.strokeStyle = '#005A9F';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function _lightenHex(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function showWheelResult(index) {
  const seg = WHEEL_SEGMENTS[index];
  const resultEl = document.getElementById('wheel-result');
  resultEl.innerHTML = `
    <span class="wheel-result-emoji">${seg.emoji}</span>
    <div class="wheel-result-title">${seg.label}</div>
    <div class="wheel-result-desc">${seg.desc}</div>
  `;
  resultEl.style.display = 'block';
  document.getElementById('wheel-close-btn').style.display = 'inline-block';
  flashScreen('correct');
  synthUnlock();
}

function applyWheelEffect(effect) {
  const gs = gameState;
  if (!gs || !gs.players) return;
  const cp = gs.players[gs.currentIndex];

  switch (effect) {
    case 'double_next':
      gs.wheelDoubleNext = true;
      showNarrator(`🎯 ${cp.name}: Nächste Frage zählt DOPPELT!`, 3000);
      break;

    case 'steal_2_leader': {
      const sorted = [...gs.players].sort((a,b) => b.points - a.points);
      const leader = sorted[0];
      if (leader !== cp && leader.points >= 2) {
        leader.points -= 2; cp.points += 2;
        renderScoreStrip();
        showNarrator(`💸 ${cp.name} stiehlt 2 Punkte von ${leader.name}!`, 3000);
        synthSteal();
      } else {
        cp.points += 1; renderScoreStrip();
        showNarrator(`💸 Kein Diebstahl möglich – +1 Punkt!`, 2500);
      }
      break;
    }

    case 'advance_3':
      showNarrator(`⚡ ${cp.name} rückt 3 Felder vor!`, 2500);
      setTimeout(() => animateMove(cp, Math.min(3, BOARD.length - 1 - cp.position), () => {
        resolveSpace(cp);
      }), 400);
      break;

    case 'swap_position': {
      const others = gs.players.filter((_,i) => i !== gs.currentIndex);
      if (others.length > 0) {
        const target = others[Math.floor(Math.random() * others.length)];
        const tmp = cp.position;
        cp.position = target.position;
        target.position = tmp;
        renderTokens();
        showNarrator(`🔄 ${cp.name} tauscht Position mit ${target.name}!`, 3000);
      } else {
        showNarrator(`🔄 Kein Tausch möglich!`, 2000);
      }
      break;
    }

    case 'all_answer':
      gs.wheelAllAnswer = true;
      showNarrator(`🌊 Alle müssen die nächste Frage beantworten!`, 3000);
      break;

    case 'skip_gain_3':
      cp.points += 3; renderScoreStrip();
      animateScoreUpdate(cp, 3, true);
      showNarrator(`📺 ${cp.name}: Aussetzen – aber +3 Punkte!`, 3000);
      gs.skipNextTurn = (gs.skipNextTurn || 0);
      // Mark this player to skip their next natural turn after roll
      gs.wheelSkipAfterRoll = true;
      break;

    case 'free_category':
      gs.wheelFreeCategory = true;
      showNarrator(`🃏 ${cp.name}: Wähle deine Fragenkategorie nach dem Würfeln frei!`, 3500);
      break;

    case 'random_points': {
      const delta = Math.floor(Math.random() * 9) - 3; // -3 to +5
      cp.points = Math.max(0, cp.points + delta);
      renderScoreStrip();
      animateScoreUpdate(cp, delta, delta >= 0);
      showNarrator(`🎲 ${delta >= 0 ? '+' + delta : delta} Punkte für ${cp.name}!`, 3000);
      break;
    }
  }
}

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
  // Wheel effect flags
  wheelDoubleNext:  false,
  wheelAllAnswer:   false,
  wheelFreeCategory: false,
  wheelSkipAfterRoll: false,
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

  // Reset wheel for the new turn
  _wheelUsedThisTurn = false;
  const wBtn = document.getElementById('wheel-trigger-btn');
  if (wBtn) wBtn.classList.remove('used');

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
  // 3D forest board — sync all player positions on the platforms
  gameState.players.forEach(p => Forest3D.setPlayerPosition(p.id, p.position));
}

/* ═════════════════════════════════════════
   TOKEN RENDERING
═════════════════════════════════════════ */
function renderTokens() {
  // 3D forest — sync sphere positions for all players
  gameState.players.forEach(p => Forest3D.setPlayerPosition(p.id, p.position));
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
  Forest3D.focusOn(cp.position);
  document.getElementById('cp-avatar').textContent = cp.avatar;
  document.getElementById('cp-name').textContent   = cp.name || `Spieler ${gameState.currentPlayerIdx+1}`;
  const rollBtn = document.getElementById('roll-btn');
  rollBtn.style.background = cp.color;
  rollBtn.disabled = false;
  // Sync wheel button state
  const wBtn = document.getElementById('wheel-trigger-btn');
  if (wBtn) {
    if (_wheelUsedThisTurn) wBtn.classList.add('used');
    else wBtn.classList.remove('used');
  }
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
  // Delegate to 3D forest jump animation
  Forest3D.movePlayer(player, steps, onLand);
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
    let pts = (space.type === 'bonus' || gameState.bonusNextGlobal) ? 4 : 2;
    if (gameState.bonusNextGlobal) gameState.bonusNextGlobal = false;
    // Wheel: double next question
    if (gameState.wheelDoubleNext) { pts *= 2; gameState.wheelDoubleNext = false; showNarrator(`🎯 Doppelpunkte aktiv! +${pts} Punkte möglich!`, 2000); }
    // Wheel: free category choice
    let cat = space.cat;
    if (gameState.wheelFreeCategory) {
      gameState.wheelFreeCategory = false;
      const cats = Object.keys(WORLDS);
      cat = cats[Math.floor(Math.random() * cats.length)];
      showNarrator(`🃏 Joker! Kategorie: ${WORLDS[cat].label}`, 2000);
    }
    showQuestion(player, cat, pts);
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
  document.getElementById('qs-category-tag').innerHTML = `${w.svg}<span style="margin-left:5px">${w.label}</span>`;
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
    gameState.wheelDoubleNext    = false;
    gameState.wheelAllAnswer     = false;
    gameState.wheelFreeCategory  = false;
    gameState.wheelSkipAfterRoll = false;
    _wheelUsedThisTurn = false;

    showScreen('screen-board');
    Forest3D.destroy();
    Forest3D.init();
    Forest3D.createPlayers(gameState.players);
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

    // Wheel skip_gain_3 effect: end turn immediately
    if (gameState.wheelSkipAfterRoll) {
      gameState.wheelSkipAfterRoll = false;
      showNarrator(`📺 Sendepause – nächste Runde!`, 2000);
      setTimeout(nextTurn, 2200);
      return;
    }

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

  openWheel() {
    if (gameState.phase !== 'roll') return;
    if (_wheelUsedThisTurn) { showNarrator('🎰 Zufalls-Rad schon benutzt diese Runde!', 2000); return; }
    const overlay = document.getElementById('wheel-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.getElementById('wheel-result').style.display = 'none';
    document.getElementById('wheel-close-btn').style.display = 'none';
    document.getElementById('wheel-spin-btn').disabled = false;
    drawWheel(0);
  },

  spinWheel() {
    if (_wheelSpinning) return;
    _wheelSpinning = true;
    document.getElementById('wheel-spin-btn').disabled = true;

    const targetIdx  = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segAngle   = (2 * Math.PI) / WHEEL_SEGMENTS.length;
    const targetAngle = -(targetIdx * segAngle + segAngle / 2);
    const totalRot    = Math.PI * 2 * (6 + Math.random() * 3) + targetAngle;
    const duration    = 3800;
    let startTs = null;

    synthSpin();

    function animate(ts) {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      drawWheel(totalRot * ease);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        _wheelSpinning = false;
        _pendingWheelEffect = WHEEL_SEGMENTS[targetIdx].effect;
        showWheelResult(targetIdx);
      }
    }
    requestAnimationFrame(animate);
  },

  closeWheel() {
    const overlay = document.getElementById('wheel-overlay');
    if (overlay) overlay.classList.remove('active');
    _wheelUsedThisTurn = true;
    const btn = document.getElementById('wheel-trigger-btn');
    if (btn) btn.classList.add('used');
    if (_pendingWheelEffect) {
      const eff = _pendingWheelEffect;
      _pendingWheelEffect = null;
      applyWheelEffect(eff);
    }
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
    gameState.wheelDoubleNext    = false;
    gameState.wheelAllAnswer     = false;
    gameState.wheelFreeCategory  = false;
    gameState.wheelSkipAfterRoll = false;
    _wheelUsedThisTurn = false;
    const wBtn = document.getElementById('wheel-trigger-btn');
    if (wBtn) wBtn.classList.remove('used');

    showScreen('screen-board');
    Forest3D.destroy();
    Forest3D.init();
    Forest3D.createPlayers(gameState.players);
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
   FOREST 3D ENVIRONMENT
═════════════════════════════════════════ */
const Forest3D = (() => {
  let _scene, _camera, _renderer, _animId, _resizeObs;
  let _platforms = [];
  let _playerMeshes = {};
  let _positions = [];
  let _camTarget = null;
  let _leaves = [];
  let _endPulse = 0;
  const TAU = Math.PI * 2;

  const PLAT_COLORS = {
    start:                0x27ae60,
    end:                  0xf1c40f,
    bonus:                0xd4a017,
    duel:                 0xc0392b,
    event:                0x2980b9,
    question_grundwissen: 0x2ecc71,
    question_sport:       0x3498db,
    question_musik:       0x9b59b6,
    question_humor:       0xf39c12,
    question_geschichte:  0xe67e22,
    question_kultur:      0x1abc9c,
  };

  function platColor(space) {
    if (space.type === 'question') return PLAT_COLORS['question_' + space.cat] || 0x005a9f;
    return PLAT_COLORS[space.type] || 0x005a9f;
  }

  function buildPositions() {
    _positions = [];
    for (let i = 0; i < 30; i++) {
      const row = Math.floor(i / 6), col = i % 6;
      const x = row % 2 === 0 ? (col - 2.5) * 2.3 : (2.5 - col) * 2.3;
      const z = (row - 2) * 2.7;
      const y = 0.1 + Math.sin(i * 0.85) * 0.1;
      _positions.push(new THREE.Vector3(x, y, z));
    }
  }

  function addTree(x, z, sc) {
    const g = new THREE.Group();
    const tr = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13 * sc, 0.18 * sc, 1.3 * sc, 6),
      new THREE.MeshLambertMaterial({ color: 0x4a2a0a })
    );
    tr.position.y = 0.65 * sc;
    g.add(tr);
    [[0.90, 1.7, 0x1a4820], [0.65, 1.3, 0x236b2e], [0.45, 1.0, 0x2d8040]].forEach(([r, h, col], li) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r * sc, h * sc, 8),
        new THREE.MeshLambertMaterial({ color: col })
      );
      cone.position.y = (1.3 + li * 0.9 + h / 2) * sc;
      g.add(cone);
    });
    g.position.set(x, 0, z);
    g.rotation.y = Math.random() * TAU;
    _scene.add(g);
  }

  function buildForest() {
    const occupied = new Set(_positions.map(p => Math.round(p.x * 2) + ',' + Math.round(p.z * 2)));
    function safe(x, z) { return !occupied.has(Math.round(x * 2) + ',' + Math.round(z * 2)); }
    for (let x = -11; x <= 11; x += 2.1) {
      if (safe(x, -10)) addTree(x + (Math.random() - .5) * .7, -10 + (Math.random() - .5) * .6, .8 + Math.random() * .9);
      if (safe(x,  10)) addTree(x + (Math.random() - .5) * .7,  10 + (Math.random() - .5) * .6, .8 + Math.random() * .9);
    }
    for (let z = -8; z <= 8; z += 2.1) {
      if (safe(-11, z)) addTree(-11 + (Math.random() - .5) * .6, z + (Math.random() - .5) * .7, .8 + Math.random() * .9);
      if (safe( 11, z)) addTree( 11 + (Math.random() - .5) * .6, z + (Math.random() - .5) * .7, .8 + Math.random() * .9);
    }
    [[-6,-1.3],[0,-1.3],[6,-1.3],[-6,1.3],[0,1.3],[6,1.3],
     [-4,-4],[2,-4],[-2,-4],[4,-4],[-4,4],[2,4],[-2,4],[4,4],
     [-7.5,-3],[7.5,-3],[-7.5,3],[7.5,3]].forEach(([x, z]) => {
      const jx = x + (Math.random() - .5) * .9, jz = z + (Math.random() - .5) * .9;
      if (safe(jx, jz)) addTree(jx, jz, .65 + Math.random() * .7);
    });
  }

  function buildPlatforms() {
    _platforms = [];
    BOARD.forEach((space, i) => {
      const col = platColor(space);
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.18, 8),
        new THREE.MeshPhongMaterial({ color: col, shininess: 35 })
      );
      disc.position.copy(_positions[i]);
      _scene.add(disc);
      _platforms.push(disc);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.78, 0.045, 5, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
      );
      ring.position.copy(_positions[i]);
      ring.position.y += 0.09;
      ring.rotation.x = Math.PI / 2;
      _scene.add(ring);
      if (space.type === 'end') {
        const gr = new THREE.Mesh(
          new THREE.TorusGeometry(0.94, 0.07, 5, 12),
          new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.7 })
        );
        gr.position.copy(_positions[i]);
        gr.position.y += 0.1;
        gr.rotation.x = Math.PI / 2;
        _scene.add(gr);
      }
    });
  }

  function buildPlayerSpheres(players) {
    Object.values(_playerMeshes).forEach(pm => { _scene.remove(pm.mesh); _scene.remove(pm.light); });
    _playerMeshes = {};
    players.forEach(p => {
      const hex = parseInt(p.color.replace('#', ''), 16);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 14, 10),
        new THREE.MeshPhongMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.15, shininess: 90 })
      );
      mesh.position.copy(_positions[0]);
      mesh.position.y += 0.55;
      _scene.add(mesh);
      const light = new THREE.PointLight(hex, 0.9, 2.8);
      light.position.copy(mesh.position);
      _scene.add(light);
      _playerMeshes[p.id] = { mesh, light };
    });
  }

  function spawnLeaves() {
    _leaves = [];
    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.15, 0.12),
        new THREE.MeshBasicMaterial({ color: 0x2d5a1b, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      resetLeaf(mesh);
      _scene.add(mesh);
      _leaves.push({ mesh, spd: 0.009 + Math.random() * 0.013, dx: (Math.random() - .5) * 0.004 });
    }
  }

  function resetLeaf(mesh) {
    mesh.position.set((Math.random() - .5) * 18, 5 + Math.random() * 5, (Math.random() - .5) * 14);
    mesh.rotation.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU);
  }

  function loop() {
    _animId = requestAnimationFrame(loop);
    if (_camTarget) {
      const goal = _camTarget.clone().add(new THREE.Vector3(0, 8.5, 11));
      _camera.position.lerp(goal, 0.05);
      _camera.lookAt(_camTarget.x, _camTarget.y + 1.2, _camTarget.z);
    }
    _leaves.forEach(({ mesh, spd, dx }) => {
      mesh.position.y -= spd;
      mesh.position.x += dx;
      mesh.rotation.z += 0.008;
      if (mesh.position.y < -1) resetLeaf(mesh);
    });
    if (_platforms[29]) {
      _endPulse += 0.04;
      _platforms[29].material.emissive.setHex(0xf1c40f);
      _platforms[29].material.emissiveIntensity = 0.1 + Math.abs(Math.sin(_endPulse)) * 0.45;
    }
    _renderer.render(_scene, _camera);
  }

  function pointAt(idx) {
    _camTarget = (_positions[idx] || _positions[0]).clone();
  }

  return {
    init() {
      const canvas = document.getElementById('three-canvas');
      if (!canvas || typeof THREE === 'undefined') return;
      _endPulse = 0;
      _scene = new THREE.Scene();
      _scene.background = new THREE.Color(0x0b1a0b);
      _scene.fog = new THREE.Fog(0x0b1a0b, 18, 44);
      const w = canvas.offsetWidth || 400, h = canvas.offsetHeight || 300;
      _camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 80);
      _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      _renderer.setSize(w, h, false);
      _scene.add(new THREE.HemisphereLight(0x87ceeb, 0x2d5a1b, 0.55));
      const sun = new THREE.DirectionalLight(0xfff3cc, 1.1);
      sun.position.set(8, 14, 5);
      _scene.add(sun);
      _scene.add(new THREE.AmbientLight(0x1a3a1a, 0.4));
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 80),
        new THREE.MeshLambertMaterial({ color: 0x152515 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.2;
      _scene.add(ground);
      buildPositions();
      buildForest();
      buildPlatforms();
      spawnLeaves();
      pointAt(0);
      _camera.position.copy(_camTarget.clone().add(new THREE.Vector3(0, 8.5, 11)));
      _camera.lookAt(_camTarget.x, _camTarget.y + 1.2, _camTarget.z);
      _resizeObs = new ResizeObserver(() => {
        const w2 = canvas.offsetWidth, h2 = canvas.offsetHeight;
        if (w2 && h2) { _camera.aspect = w2 / h2; _camera.updateProjectionMatrix(); _renderer.setSize(w2, h2, false); }
      });
      _resizeObs.observe(canvas);
      loop();
    },

    createPlayers(players) {
      if (!_scene) return;
      buildPlayerSpheres(players);
    },

    setPlayerPosition(playerId, idx) {
      const pm = _playerMeshes[playerId];
      if (!pm || !_positions[idx]) return;
      const pos = _positions[idx].clone();
      pos.y += 0.55;
      pm.mesh.position.copy(pos);
      pm.light.position.copy(pos);
    },

    movePlayer(player, steps, onLand) {
      if (steps <= 0) { onLand(); return; }
      const fromIdx = player.position;
      const toIdx   = Math.min(player.position + 1, BOARD.length - 1);
      player.position = toIdx;
      synthNav();
      const plat = _platforms[toIdx];
      if (plat) {
        plat.material.emissive.setHex(0xffffff);
        plat.material.emissiveIntensity = 0.6;
        setTimeout(() => { plat.material.emissive.setHex(0x000000); plat.material.emissiveIntensity = 0; }, 250);
      }
      pointAt(toIdx);
      const pm = _playerMeshes[player.id];
      if (!pm) {
        if (toIdx === BOARD.length - 1) { onLand(); return; }
        setTimeout(() => Forest3D.movePlayer(player, steps - 1, onLand), 350);
        return;
      }
      const from = _positions[fromIdx].clone(); from.y += 0.55;
      const to   = _positions[toIdx].clone();   to.y   += 0.55;
      const peak = from.clone().lerp(to, 0.5);  peak.y += 2.2;
      const dur = 350, t0 = performance.now();
      (function jump(now) {
        const t  = Math.min((now - t0) / dur, 1);
        const e  = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const p1 = from.clone().lerp(peak, e);
        const p2 = peak.clone().lerp(to,   e);
        pm.mesh.position.copy(p1.lerp(p2, e));
        pm.light.position.copy(pm.mesh.position);
        const sy = t < 0.5 ? 1 + t * 0.5 : 1.25 - (t - 0.5) * 1.0;
        pm.mesh.scale.set(t < 0.5 ? 0.88 : 1.05, Math.max(0.55, sy), t < 0.5 ? 0.88 : 1.05);
        if (t < 1) {
          requestAnimationFrame(jump);
        } else {
          pm.mesh.position.copy(to);
          pm.mesh.scale.set(1, 1, 1);
          pm.light.position.copy(to);
          if (toIdx === BOARD.length - 1) { onLand(); }
          else { Forest3D.movePlayer(player, steps - 1, onLand); }
        }
      })(performance.now());
    },

    focusOn(spaceIdx) {
      pointAt(Math.max(0, Math.min(spaceIdx, BOARD.length - 1)));
    },

    destroy() {
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
      if (_resizeObs) { _resizeObs.disconnect(); _resizeObs = null; }
      _platforms = []; _playerMeshes = {}; _leaves = [];
      _scene = null; _camera = null; _renderer = null;
    },
  };
})();

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
      <div style="padding:40px;color:#C7CBD1;font-family:'Inter',sans-serif;line-height:1.7;background:#0F1115;height:100vh">
        <strong style="color:#0A6ED1;font-size:20px">ARD Life</strong><br><br>
        Ladefehler: ${err.message}<br><br>
        Öffne die App über einen lokalen Server:<br>
        <code style="background:#1A1D24;padding:6px 10px;border-radius:6px;display:inline-block;margin-top:6px">npx serve .</code>
      </div>`;
  }
}

init();
