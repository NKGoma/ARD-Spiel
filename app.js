/* ══════════════════════════════════════════
   ARD Life – Medien als Lebensspiel
   app.js  – all game logic
══════════════════════════════════════════ */

const STATE_KEY = 'ard_state';

let DATA = null;   // loaded from data.json
let state = null;  // { scores, points, seen }
let currentQuestion = null;

/* ─── State ─── */

function defaultState(categories) {
  const scores = {};
  categories.forEach(c => { scores[c.id] = 0; });
  return { scores, points: 0, seen: [] };
}

function loadState(categories) {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // ensure all categories exist in scores
      categories.forEach(c => {
        if (parsed.scores[c.id] === undefined) parsed.scores[c.id] = 0;
      });
      return parsed;
    }
  } catch (e) { /* ignore */ }
  return defaultState(categories);
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/* ─── Unlock Logic ─── */

function isUnlocked(categoryId) {
  const cat = DATA.categories.find(c => c.id === categoryId);
  if (!cat || !cat.unlockRequirement) return true;
  const { category, minLevel } = cat.unlockRequirement;
  return (state.scores[category] || 0) >= minLevel;
}

function unlockHintText(categoryId) {
  const cat = DATA.categories.find(c => c.id === categoryId);
  if (!cat || !cat.unlockRequirement) return '';
  const { category, minLevel } = cat.unlockRequirement;
  const depCat = DATA.categories.find(c => c.id === category);
  const depLabel = depCat ? depCat.label : category;
  const current = state.scores[category] || 0;
  return `${depLabel} Level ${current}/${minLevel}`;
}

/* ─── Screen Management ─── */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    // force reflow so opacity transition fires
    void target.offsetWidth;
  }
}

/* ─── Category Screen ─── */

function renderCategories() {
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';

  document.getElementById('total-points').textContent = state.points;

  DATA.categories.forEach(cat => {
    const unlocked = isUnlocked(cat.id);
    const score = state.scores[cat.id] || 0;
    const level = Math.min(score, 5);
    const pct = (level / 5) * 100;

    const card = document.createElement('div');
    card.className = 'cat-card' + (unlocked ? '' : ' locked');
    card.style.setProperty('--cat-color', cat.color);

    if (unlocked) {
      card.addEventListener('click', () => startQuiz(cat.id));
    }

    card.innerHTML = `
      <div class="cat-emoji">${cat.emoji}</div>
      <div class="cat-name">${cat.label}</div>
      <div class="cat-level">Level ${level} / 5</div>
      <div class="cat-progress">
        <div class="cat-progress-fill" style="width:${pct}%"></div>
      </div>
      ${!unlocked ? `<div class="lock-overlay">🔒</div><div class="unlock-hint">${unlockHintText(cat.id)}</div>` : ''}
    `;

    grid.appendChild(card);
  });
}

/* ─── Quiz ─── */

function startQuiz(categoryId) {
  const cat = DATA.categories.find(c => c.id === categoryId);
  const allForCat = DATA.questions.filter(q => q.category === categoryId);

  // filter unseen; if all seen, reset for this category
  let pool = allForCat.filter(q => !state.seen.includes(q.id));
  if (pool.length === 0) {
    state.seen = state.seen.filter(id => !allForCat.map(q => q.id).includes(id));
    saveState();
    pool = allForCat;
  }

  // pick random
  currentQuestion = pool[Math.floor(Math.random() * pool.length)];

  // populate quiz screen
  document.getElementById('quiz-cat-label').textContent = `${cat.emoji} ${cat.label}`;
  document.getElementById('quiz-cat-label').style.color = cat.color;
  document.getElementById('quiz-points').textContent = state.points;
  document.getElementById('quiz-source').textContent = currentQuestion.title;
  document.getElementById('quiz-question').textContent = currentQuestion.question;

  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = '';

  currentQuestion.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => submitAnswer(i));
    optionsEl.appendChild(btn);
  });

  showScreen('screen-quiz');
}

function submitAnswer(selectedIndex) {
  const correct = selectedIndex === currentQuestion.correctIndex;
  const buttons = document.querySelectorAll('.option-btn');

  // disable all buttons
  buttons.forEach(b => (b.disabled = true));

  // highlight correct / wrong
  buttons[currentQuestion.correctIndex].classList.add('correct');
  if (!correct) buttons[selectedIndex].classList.add('wrong');

  // update state
  if (correct) {
    state.points += 1;
    const catId = currentQuestion.category;
    if (state.scores[catId] < 5) {
      state.scores[catId] += 1;
    }
  }

  if (!state.seen.includes(currentQuestion.id)) {
    state.seen.push(currentQuestion.id);
  }

  saveState();

  // brief pause then show feedback
  setTimeout(() => showFeedback(correct), 600);
}

function showFeedback(correct) {
  document.getElementById('feedback-icon').textContent  = correct ? '🎉' : '😅';
  document.getElementById('feedback-title').textContent = correct ? 'Richtig!' : 'Leider falsch.';
  document.getElementById('feedback-insight').textContent = currentQuestion.insight;

  const link = document.getElementById('feedback-link');
  link.href = currentQuestion.url;
  link.textContent = `${currentQuestion.title} →`;

  document.getElementById('quiz-points').textContent = state.points;

  showScreen('screen-feedback');
}

/* ─── Wheel of Life ─── */

function renderWheel() {
  document.getElementById('wheel-points').textContent = state.points;

  const svg = document.getElementById('wheel-svg');
  svg.innerHTML = '';

  const cx = 200, cy = 200;
  const outerR = 165, innerR = 45;
  const n = DATA.categories.length;
  const anglePer = (2 * Math.PI) / n;
  const startOffset = -Math.PI / 2; // start from top

  // draw background circle
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy);
  bg.setAttribute('r', outerR);
  bg.setAttribute('fill', '#f5f5f5');
  bg.setAttribute('stroke', '#e0e0e0');
  bg.setAttribute('stroke-width', '1');
  svg.appendChild(bg);

  DATA.categories.forEach((cat, i) => {
    const startAngle = startOffset + i * anglePer;
    const endAngle   = startAngle + anglePer;
    const score      = Math.min(state.scores[cat.id] || 0, 5);
    const fillPct    = score / 5;

    // background segment (always visible, faint)
    svg.appendChild(makeSector(cx, cy, innerR, outerR, startAngle, endAngle, cat.color, 0.15));

    // filled segment proportional to score
    if (fillPct > 0) {
      const fillR = innerR + (outerR - innerR) * fillPct;
      svg.appendChild(makeSector(cx, cy, innerR, fillR, startAngle, endAngle, cat.color, 1));
    }

    // divider line
    const lineEnd = polarXY(cx, cy, outerR, startAngle);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', lineEnd.x); line.setAttribute('y2', lineEnd.y);
    line.setAttribute('stroke', '#fff'); line.setAttribute('stroke-width', '2');
    svg.appendChild(line);

    // label
    const midAngle = startAngle + anglePer / 2;
    const labelR   = outerR + 22;
    const lp       = polarXY(cx, cy, labelR, midAngle);
    const text      = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', lp.x); text.setAttribute('y', lp.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '18');
    text.textContent = cat.emoji;
    svg.appendChild(text);
  });

  // center circle (white cap)
  const cap = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  cap.setAttribute('cx', cx); cap.setAttribute('cy', cy);
  cap.setAttribute('r', innerR);
  cap.setAttribute('fill', '#fff');
  cap.setAttribute('stroke', '#e0e0e0');
  cap.setAttribute('stroke-width', '1');
  svg.appendChild(cap);

  // center points text
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', cx); centerText.setAttribute('y', cy - 6);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('font-size', '18');
  centerText.setAttribute('font-weight', '700');
  centerText.setAttribute('fill', '#1a1a1a');
  centerText.textContent = state.points;
  svg.appendChild(centerText);

  const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subText.setAttribute('x', cx); subText.setAttribute('y', cy + 12);
  subText.setAttribute('text-anchor', 'middle');
  subText.setAttribute('font-size', '10');
  subText.setAttribute('fill', '#999');
  subText.textContent = 'Punkte';
  svg.appendChild(subText);

  // legend
  const legend = document.getElementById('wheel-legend');
  legend.innerHTML = '';
  DATA.categories.forEach(cat => {
    const score = Math.min(state.scores[cat.id] || 0, 5);
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${cat.color}"></span>
      <span>${cat.label}: ${score}/5</span>
    `;
    legend.appendChild(item);
  });
}

/* ─── SVG helpers ─── */

function polarXY(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function makeSector(cx, cy, r1, r2, startAngle, endAngle, color, opacity) {
  const p1 = polarXY(cx, cy, r2, startAngle);
  const p2 = polarXY(cx, cy, r2, endAngle);
  const p3 = polarXY(cx, cy, r1, endAngle);
  const p4 = polarXY(cx, cy, r1, startAngle);

  const largeArc = (endAngle - startAngle > Math.PI) ? 1 : 0;

  const d = [
    `M ${p4.x} ${p4.y}`,
    `L ${p1.x} ${p1.y}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', color);
  path.setAttribute('fill-opacity', opacity);
  return path;
}

/* ─── Navigation ─── */

const App = {
  goCategories() {
    renderCategories();
    showScreen('screen-categories');
  },
  goWheel() {
    renderWheel();
    showScreen('screen-wheel');
  },
  resetGame() {
    if (confirm('Wirklich zurücksetzen? Alle Punkte und Fortschritte werden gelöscht.')) {
      state = defaultState(DATA.categories);
      saveState();
      App.goCategories();
    }
  }
};

/* ─── Boot ─── */

async function init() {
  try {
    const res  = await fetch('data.json');
    DATA = await res.json();
    state = loadState(DATA.categories);
    showScreen('screen-start');
  } catch (err) {
    document.body.innerHTML = `<div style="padding:40px;color:red">Fehler beim Laden der Daten: ${err.message}</div>`;
  }
}

init();
