/* =====================================================
   TOURNAMENT GENERATOR — app.js
   Vanilla JS | No external dependencies
   ===================================================== */

'use strict';

/* =====================================================
   STATE
   ===================================================== */
const state = {
  players: [],           // Array of player name strings
  tournament: null,      // Current tournament object
  darkMode: false,
  dragSrcIndex: null,    // For drag-and-drop reorder
};

/* =====================================================
   UTILITY HELPERS
   ===================================================== */

function $(id) { return document.getElementById(id); }

function showToast(msg, duration = 2500) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function nextPowerOfTwo(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* =====================================================
   PLAYER MANAGEMENT
   ===================================================== */

function renderPlayerList() {
  const ul = $('player-list');
  const count = $('player-count');
  count.textContent = state.players.length;

  if (state.players.length === 0) {
    ul.innerHTML = '<li class="empty-state">No players added yet.</li>';
    return;
  }

  ul.innerHTML = '';
  state.players.forEach((name, i) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    li.draggable = true;
    li.dataset.index = i;
    li.innerHTML = `
      <span class="player-drag-handle" aria-hidden="true">⠿</span>
      <span class="player-seed">#${i + 1}</span>
      <span class="player-name">${escapeHtml(name)}</span>
      <button class="player-remove" data-index="${i}" aria-label="Remove ${escapeHtml(name)}">✕</button>
    `;

    // Drag events
    li.addEventListener('dragstart', onDragStart);
    li.addEventListener('dragover', onDragOver);
    li.addEventListener('drop', onDrop);
    li.addEventListener('dragend', onDragEnd);

    // Touch drag (iOS)
    li.addEventListener('touchstart', onTouchStart, { passive: true });
    li.addEventListener('touchmove', onTouchMove, { passive: false });
    li.addEventListener('touchend', onTouchEnd);

    ul.appendChild(li);
  });
}

function addPlayer(name) {
  name = name.trim();
  if (!name) return;
  if (state.players.includes(name)) {
    showToast(`"${name}" is already in the list.`);
    return;
  }
  state.players.push(name);
  renderPlayerList();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =====================================================
   DRAG & DROP — DESKTOP
   ===================================================== */

function onDragStart(e) {
  state.dragSrcIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  target.classList.add('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  const targetIndex = parseInt(e.currentTarget.dataset.index);
  if (state.dragSrcIndex !== null && state.dragSrcIndex !== targetIndex) {
    const moved = state.players.splice(state.dragSrcIndex, 1)[0];
    state.players.splice(targetIndex, 0, moved);
    renderPlayerList();
  }
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  $('player-list').querySelectorAll('.player-item').forEach(li => li.classList.remove('drag-over'));
  state.dragSrcIndex = null;
}

/* =====================================================
   TOUCH DRAG — iOS
   ===================================================== */

const touchDrag = { src: null, clone: null, startY: 0, startIndex: 0 };

function onTouchStart(e) {
  touchDrag.src = e.currentTarget;
  touchDrag.startIndex = parseInt(touchDrag.src.dataset.index);
  touchDrag.startY = e.touches[0].clientY;

  const rect = touchDrag.src.getBoundingClientRect();
  touchDrag.clone = touchDrag.src.cloneNode(true);
  touchDrag.clone.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${touchDrag.src.offsetWidth}px;
    opacity: 0.85;
    pointer-events: none;
    z-index: 9999;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    transition: none;
  `;
  document.body.appendChild(touchDrag.clone);
  touchDrag.src.style.opacity = '0.3';
}

function onTouchMove(e) {
  if (!touchDrag.clone) return;
  e.preventDefault();
  const touch = e.touches[0];
  const dy = touch.clientY - touchDrag.startY;
  touchDrag.clone.style.transform = `translateY(${dy}px)`;

  // Find element under touch
  touchDrag.clone.style.display = 'none';
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  touchDrag.clone.style.display = '';
  const item = el ? el.closest('.player-item') : null;
  $('player-list').querySelectorAll('.player-item').forEach(li => li.classList.remove('drag-over'));
  if (item && item !== touchDrag.src) {
    item.classList.add('drag-over');
  }
}

function onTouchEnd(e) {
  if (!touchDrag.clone) return;
  const touch = e.changedTouches[0];
  touchDrag.clone.style.display = 'none';
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  touchDrag.clone.style.display = '';

  const item = el ? el.closest('.player-item') : null;
  if (item && item !== touchDrag.src) {
    const targetIndex = parseInt(item.dataset.index);
    const moved = state.players.splice(touchDrag.startIndex, 1)[0];
    state.players.splice(targetIndex, 0, moved);
  }

  touchDrag.clone.remove();
  touchDrag.clone = null;
  if (touchDrag.src) touchDrag.src.style.opacity = '';
  touchDrag.src = null;
  $('player-list').querySelectorAll('.player-item').forEach(li => li.classList.remove('drag-over'));
  renderPlayerList();
}

/* =====================================================
   TOURNAMENT GENERATION
   ===================================================== */

function generateTournament() {
  const name = $('tournament-name').value.trim() || 'My Tournament';
  const type = document.querySelector('input[name="tournament-type"]:checked').value;

  if (state.players.length < 2) {
    showToast('Add at least 2 players to generate a tournament.');
    return;
  }

  if (type === 'single-elimination') {
    state.tournament = buildSingleElimination(name, [...state.players]);
  } else {
    state.tournament = buildRoundRobin(name, [...state.players]);
  }

  renderTournament();
  $('section-bracket').style.display = '';
  $('section-bracket').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Tournament generated!');
}

/* =====================================================
   SINGLE ELIMINATION
   ===================================================== */

function buildSingleElimination(name, players) {
  const size = nextPowerOfTwo(players.length);
  const byes = size - players.length;

  // Pad with BYE slots
  const seeded = [...players];
  for (let i = 0; i < byes; i++) seeded.push(null); // null = BYE

  // Build first round matches
  const rounds = [];
  const firstRound = [];
  for (let i = 0; i < size; i += 2) {
    firstRound.push({
      id: generateId(),
      p1: seeded[i],
      p2: seeded[i + 1],
      score1: null,
      score2: null,
      winner: null,
      isBye: seeded[i] === null || seeded[i + 1] === null,
    });
  }

  // Auto-advance byes
  firstRound.forEach(m => {
    if (m.isBye) {
      m.winner = m.p1 !== null ? m.p1 : m.p2;
    }
  });

  rounds.push({ title: 'Round 1', matches: firstRound });

  // Build subsequent rounds (empty placeholders)
  let prevCount = firstRound.length;
  let roundNum = 2;
  while (prevCount > 1) {
    const nextCount = Math.ceil(prevCount / 2);
    const matches = [];
    for (let i = 0; i < nextCount; i++) {
      matches.push({
        id: generateId(),
        p1: null,
        p2: null,
        score1: null,
        score2: null,
        winner: null,
        isBye: false,
      });
    }
    const title = prevCount === 2 ? 'Final' : prevCount === 4 ? 'Semi-Finals' : prevCount === 8 ? 'Quarter-Finals' : `Round ${roundNum}`;
    rounds.push({ title, matches });
    prevCount = nextCount;
    roundNum++;
  }

  const t = {
    id: generateId(),
    name,
    type: 'single-elimination',
    players,
    rounds,
    champion: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Propagate any first-round bye winners
  propagateSingleElim(t);
  return t;
}

function propagateSingleElim(t) {
  const rounds = t.rounds;
  for (let r = 0; r < rounds.length - 1; r++) {
    const cur = rounds[r].matches;
    const next = rounds[r + 1].matches;
    for (let m = 0; m < cur.length; m++) {
      const match = cur[m];
      const nextMatchIdx = Math.floor(m / 2);
      const slot = m % 2 === 0 ? 'p1' : 'p2';
      if (match.winner) {
        next[nextMatchIdx][slot] = match.winner;
      }
    }
  }

  // Check champion
  const finalRound = rounds[rounds.length - 1];
  if (finalRound.matches[0].winner) {
    t.champion = finalRound.matches[0].winner;
  }
}

function setMatchResult(roundIdx, matchIdx, winner, score1, score2) {
  const t = state.tournament;
  const match = t.rounds[roundIdx].matches[matchIdx];

  match.winner = winner;
  match.score1 = score1;
  match.score2 = score2;

  // Propagate winner to next round
  if (roundIdx < t.rounds.length - 1) {
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const slot = matchIdx % 2 === 0 ? 'p1' : 'p2';
    const nextMatch = t.rounds[roundIdx + 1].matches[nextMatchIdx];
    nextMatch[slot] = winner;

    // If the slot previously had a different winner, clear downstream
    if (nextMatch.winner && nextMatch.winner !== winner) {
      clearDownstream(t, roundIdx + 1, nextMatchIdx);
    }
  }

  propagateSingleElim(t);
  t.updatedAt = Date.now();
  renderTournament();
}

function clearDownstream(t, roundIdx, matchIdx) {
  if (roundIdx >= t.rounds.length) return;
  const match = t.rounds[roundIdx].matches[matchIdx];
  const oldWinner = match.winner;
  match.winner = null;
  match.score1 = null;
  match.score2 = null;

  if (roundIdx < t.rounds.length - 1) {
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const slot = matchIdx % 2 === 0 ? 'p1' : 'p2';
    const nextMatch = t.rounds[roundIdx + 1].matches[nextMatchIdx];
    if (nextMatch[slot] === oldWinner) {
      nextMatch[slot] = null;
      clearDownstream(t, roundIdx + 1, nextMatchIdx);
    }
  }

  t.champion = null;
}

/* =====================================================
   ROUND ROBIN
   ===================================================== */

function buildRoundRobin(name, players) {
  const matches = [];
  // Round-robin scheduling using circle method
  const n = players.length;
  const list = [...players];
  if (n % 2 !== 0) list.push(null); // dummy for odd number
  const rounds = list.length - 1;
  const half = list.length / 2;

  for (let r = 0; r < rounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const p1 = list[i];
      const p2 = list[list.length - 1 - i];
      if (p1 !== null && p2 !== null) {
        roundMatches.push({
          id: generateId(),
          round: r + 1,
          p1,
          p2,
          score1: null,
          score2: null,
          winner: null,
        });
      }
    }
    matches.push({ round: r + 1, matches: roundMatches });

    // Rotate: fix first element, rotate rest
    const last = list.splice(list.length - 1, 1)[0];
    list.splice(1, 0, last);
  }

  return {
    id: generateId(),
    name,
    type: 'round-robin',
    players,
    rounds: matches,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function computeStandings() {
  const t = state.tournament;
  const standings = {};
  t.players.forEach(p => {
    standings[p] = { name: p, wins: 0, losses: 0, draws: 0, gf: 0, ga: 0, played: 0 };
  });

  t.rounds.forEach(round => {
    round.matches.forEach(m => {
      if (m.winner) {
        standings[m.p1].played++;
        standings[m.p2].played++;
        if (m.winner === m.p1) {
          standings[m.p1].wins++;
          standings[m.p2].losses++;
        } else {
          standings[m.p2].wins++;
          standings[m.p1].losses++;
        }
        if (m.score1 !== null) standings[m.p1].gf += m.score1;
        if (m.score2 !== null) standings[m.p1].ga += m.score2;
        if (m.score2 !== null) standings[m.p2].gf += m.score2;
        if (m.score1 !== null) standings[m.p2].ga += m.score1;
      }
    });
  });

  return Object.values(standings).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });
}

/* =====================================================
   RENDERING
   ===================================================== */

function renderTournament() {
  const t = state.tournament;
  if (!t) return;

  $('bracket-title').textContent = escapeHtml(t.name);
  $('bracket-meta').textContent = `${t.type === 'single-elimination' ? 'Single Elimination' : 'Round Robin'} · ${t.players.length} players`;

  if (t.type === 'single-elimination') {
    $('single-elim-container').style.display = '';
    $('round-robin-container').style.display = 'none';
    renderSingleElim(t);
  } else {
    $('single-elim-container').style.display = 'none';
    $('round-robin-container').style.display = '';
    renderRoundRobin(t);
  }
}

/* ---- Single Elimination Render ---- */
function renderSingleElim(t) {
  const container = $('bracket-rounds');
  container.innerHTML = '';

  t.rounds.forEach((round, rIdx) => {
    const roundEl = document.createElement('div');
    roundEl.className = 'bracket-round';

    const titleEl = document.createElement('div');
    titleEl.className = 'round-title';
    titleEl.textContent = round.title;
    roundEl.appendChild(titleEl);

    const matchesEl = document.createElement('div');
    matchesEl.className = 'round-matches';
    matchesEl.style.justifyContent = 'space-around';

    round.matches.forEach((match, mIdx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'match-wrapper';
      wrapper.style.flex = '1';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';

      const card = document.createElement('div');
      card.className = 'match-card' + (match.isBye ? ' match-bye' : '') + (match.winner ? ' match-complete' : '');
      card.style.width = '100%';

      const p1Name = match.p1 || 'TBD';
      const p2Name = match.p2 || 'TBD';
      const p1TBD = !match.p1;
      const p2TBD = !match.p2;

      card.innerHTML = `
        <div class="match-participant ${match.winner === match.p1 ? 'winner' : match.winner && match.winner !== match.p1 ? 'loser' : ''} ${p1TBD ? 'tbd' : ''}">
          <span class="participant-name">${escapeHtml(p1Name)}</span>
          ${match.score1 !== null ? `<span class="participant-score">${match.score1}</span>` : ''}
        </div>
        <div class="match-participant ${match.winner === match.p2 ? 'winner' : match.winner && match.winner !== match.p2 ? 'loser' : ''} ${p2TBD ? 'tbd' : ''}">
          <span class="participant-name">${escapeHtml(p2Name)}</span>
          ${match.score2 !== null ? `<span class="participant-score">${match.score2}</span>` : ''}
        </div>
      `;

      if (!match.isBye && (match.p1 || match.p2)) {
        card.addEventListener('click', () => openMatchModal('se', rIdx, mIdx));
      }

      wrapper.appendChild(card);
      matchesEl.appendChild(wrapper);
    });

    roundEl.appendChild(matchesEl);
    container.appendChild(roundEl);

    // Add connector between rounds (except last)
    if (rIdx < t.rounds.length - 1) {
      const connector = document.createElement('div');
      connector.style.cssText = 'width:20px;flex-shrink:0;display:flex;align-items:center;';
      connector.innerHTML = '<div style="width:20px;height:1px;background:var(--border);"></div>';
      container.appendChild(connector);
    }
  });

  // Champion display
  const existingChamp = container.parentElement.querySelector('.champion-display');
  if (existingChamp) existingChamp.remove();

  if (t.champion) {
    const champ = document.createElement('div');
    champ.className = 'champion-display';
    champ.innerHTML = `
      <span class="trophy">🏆</span>
      <h3>Tournament Champion</h3>
      <div class="champion-name">${escapeHtml(t.champion)}</div>
    `;
    container.parentElement.appendChild(champ);
  }
}

/* ---- Round Robin Render ---- */
function renderRoundRobin(t) {
  renderRRSchedule(t);
  renderRRStandings();
}

function renderRRSchedule(t) {
  const container = $('rr-schedule');
  container.innerHTML = '';

  t.rounds.forEach((round) => {
    const group = document.createElement('div');
    group.className = 'rr-round-group';

    const title = document.createElement('div');
    title.className = 'rr-round-title';
    title.textContent = `Round ${round.round}`;
    group.appendChild(title);

    round.matches.forEach((match, mIdx) => {
      const card = document.createElement('div');
      card.className = 'rr-match-card' + (match.winner ? ' match-complete' : '');

      const p1Win = match.winner === match.p1;
      const p2Win = match.winner === match.p2;
      const hasScore = match.score1 !== null && match.score2 !== null;

      card.innerHTML = `
        <div class="rr-match-teams">
          <span class="rr-team ${p1Win ? 'winner' : match.winner ? 'loser' : ''}">${escapeHtml(match.p1)}</span>
          <span class="rr-vs">vs</span>
          <span class="rr-team ${p2Win ? 'winner' : match.winner ? 'loser' : ''}">${escapeHtml(match.p2)}</span>
        </div>
        <span class="rr-score ${hasScore ? 'has-score' : ''}">${hasScore ? `${match.score1} – ${match.score2}` : '–'}</span>
      `;

      card.addEventListener('click', () => openMatchModal('rr', round.round - 1, mIdx));
      group.appendChild(card);
    });

    container.appendChild(group);
  });
}

function renderRRStandings() {
  const container = $('rr-standings');
  const standings = computeStandings();

  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="standings-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>Player / Team</th>
            <th class="num-col">GP</th>
            <th class="num-col win-col">W</th>
            <th class="num-col loss-col">L</th>
            <th class="num-col">GF</th>
            <th class="num-col">GA</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((s, i) => `
            <tr class="rank-${i + 1}">
              <td class="rank-col">${i + 1}</td>
              <td>${escapeHtml(s.name)}</td>
              <td class="num-col">${s.played}</td>
              <td class="num-col win-col">${s.wins}</td>
              <td class="num-col loss-col">${s.losses}</td>
              <td class="num-col">${s.gf}</td>
              <td class="num-col">${s.ga}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* =====================================================
   MATCH MODAL
   ===================================================== */

let modalContext = null; // { type: 'se'|'rr', roundIdx, matchIdx }

function openMatchModal(type, roundIdx, matchIdx) {
  const t = state.tournament;
  const match = t.rounds[roundIdx].matches[matchIdx];

  if (!match.p1 && !match.p2) return;

  modalContext = { type, roundIdx, matchIdx };

  const p1 = match.p1 || 'TBD';
  const p2 = match.p2 || 'TBD';

  $('modal-team1-name').textContent = p1;
  $('modal-team2-name').textContent = p2;
  $('modal-win1').textContent = p1;
  $('modal-win2').textContent = p2;
  $('modal-score1').value = match.score1 !== null ? match.score1 : '';
  $('modal-score2').value = match.score2 !== null ? match.score2 : '';

  // Restore winner selection
  if (match.winner === match.p1) selectWinner(1);
  else if (match.winner === match.p2) selectWinner(2);
  else selectWinner(0);

  $('match-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Focus score input
  setTimeout(() => $('modal-score1').focus(), 100);
}

function closeMatchModal() {
  $('match-modal').style.display = 'none';
  document.body.style.overflow = '';
  modalContext = null;
}

function saveMatchModal() {
  if (!modalContext) return;
  const { type, roundIdx, matchIdx } = modalContext;
  const t = state.tournament;

  const match = t.rounds[roundIdx].matches[matchIdx];

  const s1 = $('modal-score1').value !== '' ? parseInt($('modal-score1').value) : null;
  const s2 = $('modal-score2').value !== '' ? parseInt($('modal-score2').value) : null;

  // Determine winner from selection
  let winner = null;
  if ($('modal-win1').classList.contains('selected')) {
    winner = match.p1;
  } else if ($('modal-win2').classList.contains('selected')) {
    winner = match.p2;
  } else if (s1 !== null && s2 !== null) {
    // Auto-determine from scores
    if (s1 > s2) winner = match.p1;
    else if (s2 > s1) winner = match.p2;
  }

  if (type === 'se') {
    if (winner) {
      setMatchResult(roundIdx, matchIdx, winner, s1, s2);
    } else {
      match.score1 = s1;
      match.score2 = s2;
      renderTournament();
    }
  } else {
    match.score1 = s1;
    match.score2 = s2;
    match.winner = winner;
    t.updatedAt = Date.now();
    renderTournament();
  }

  closeMatchModal();
  showToast('Match result saved.');
}

function clearMatchModal() {
  if (!modalContext) return;
  const { type, roundIdx, matchIdx } = modalContext;
  const t = state.tournament;

  let match;
  if (type === 'se') {
    match = t.rounds[roundIdx].matches[matchIdx];
    clearDownstream(t, roundIdx, matchIdx);
    match.score1 = null;
    match.score2 = null;
    propagateSingleElim(t);
  } else {
    match = t.rounds[roundIdx].matches[matchIdx];
    match.score1 = null;
    match.score2 = null;
    match.winner = null;
  }

  t.updatedAt = Date.now();
  renderTournament();
  closeMatchModal();
  showToast('Match result cleared.');
}

/* =====================================================
   LOCAL STORAGE — SAVE / LOAD / DELETE
   ===================================================== */

const LS_KEY = 'tournament-generator-saves';

function getSaves() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveTournament() {
  if (!state.tournament) {
    showToast('No tournament to save.');
    return;
  }
  const saves = getSaves();
  state.tournament.updatedAt = Date.now();
  saves[state.tournament.id] = state.tournament;
  localStorage.setItem(LS_KEY, JSON.stringify(saves));
  renderSavedList();
  showToast('Tournament saved!');
}

function applyTournament(t, toastMsg) {
  state.tournament = t;
  state.players = [...t.players];
  $('tournament-name').value = t.name;
  document.querySelectorAll('input[name="tournament-type"]').forEach(r => {
    r.checked = r.value === t.type;
  });
  renderPlayerList();
  renderTournament();
  $('section-bracket').style.display = '';
  $('section-bracket').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(toastMsg);
}

function loadTournament(id) {
  const saves = getSaves();
  const t = saves[id];
  if (!t) return;
  applyTournament(t, `Loaded: ${t.name}`);
}

function deleteTournament(id) {
  const saves = getSaves();
  delete saves[id];
  localStorage.setItem(LS_KEY, JSON.stringify(saves));
  renderSavedList();
  showToast('Tournament deleted.');
}

function renderSavedList() {
  const container = $('saved-list');
  const saves = getSaves();
  const ids = Object.keys(saves).sort((a, b) => saves[b].updatedAt - saves[a].updatedAt);

  if (ids.length === 0) {
    container.innerHTML = '<p class="empty-state">No saved tournaments.</p>';
    return;
  }

  container.innerHTML = '';
  ids.forEach(id => {
    const t = saves[id];
    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `
      <div class="saved-item-info">
        <div class="saved-item-name">${escapeHtml(t.name)}</div>
        <div class="saved-item-meta">${t.type === 'single-elimination' ? 'Single Elimination' : 'Round Robin'} · ${t.players.length} players · ${formatDate(t.updatedAt)}</div>
      </div>
      <div class="saved-item-actions">
        <button class="btn btn-sm btn-primary" data-load="${id}">Load</button>
        <button class="btn btn-sm btn-danger" data-del="${id}">✕</button>
      </div>
    `;
    container.appendChild(item);
  });
}

/* =====================================================
   EXPORT / IMPORT JSON
   ===================================================== */

function exportJSON() {
  if (!state.tournament) {
    showToast('No tournament to export.');
    return;
  }
  const data = JSON.stringify(state.tournament, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.tournament.name.replace(/[^a-z0-9]/gi, '_')}_tournament.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Tournament exported as JSON.');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const t = JSON.parse(e.target.result);
      if (!t.type || !t.players || !t.rounds) throw new Error('Invalid format');

      t.id = t.id || generateId();
      applyTournament(t, 'Tournament imported successfully!');
    } catch (err) {
      showToast('Invalid JSON file. Please check the format.');
    }
  };
  reader.readAsText(file);
}

/* =====================================================
   RESET TOURNAMENT
   ===================================================== */

function resetTournament() {
  if (!state.tournament) return;
  if (!confirm('Reset this tournament? All results will be cleared.')) return;

  const t = state.tournament;
  if (t.type === 'single-elimination') {
    state.tournament = buildSingleElimination(t.name, [...t.players]);
  } else {
    state.tournament = buildRoundRobin(t.name, [...t.players]);
  }

  renderTournament();
  showToast('Tournament reset.');
}

/* =====================================================
   DARK MODE
   ===================================================== */

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark-mode', state.darkMode);
  document.body.classList.toggle('light-mode', !state.darkMode);
  $('btn-dark-mode').textContent = state.darkMode ? '☀️' : '🌙';
  localStorage.setItem('tournament-dark-mode', state.darkMode ? '1' : '0');
}

function loadDarkModePreference() {
  const saved = localStorage.getItem('tournament-dark-mode');
  if (saved === '1') {
    state.darkMode = true;
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    $('btn-dark-mode').textContent = '☀️';
  }
}

/* =====================================================
   ROUND ROBIN TABS
   ===================================================== */

function initRRTabs() {
  document.querySelectorAll('.rr-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.rr-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const showSchedule = tab.dataset.tab === 'schedule';
      $('rr-schedule').classList.toggle('active', showSchedule);
      $('rr-standings').classList.toggle('active', !showSchedule);
      if (!showSchedule) renderRRStandings();
    });
  });
}

/* =====================================================
   EVENT LISTENERS
   ===================================================== */

// Toggle winner highlight in the modal (side: 1 or 2)
function selectWinner(side) {
  $('modal-win1').classList.toggle('selected', side === 1);
  $('modal-win2').classList.toggle('selected', side === 2);
  $('modal-team1').classList.toggle('selected', side === 1);
  $('modal-team2').classList.toggle('selected', side === 2);
}

function initEventListeners() {
  // Delegated: remove player buttons
  $('player-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.player-remove');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index);
    state.players.splice(idx, 1);
    renderPlayerList();
  });

  // Delegated: saved tournament load / delete buttons
  $('saved-list').addEventListener('click', (e) => {
    const loadBtn = e.target.closest('[data-load]');
    if (loadBtn) { loadTournament(loadBtn.dataset.load); return; }
    const delBtn = e.target.closest('[data-del]');
    if (delBtn && confirm('Delete this saved tournament?')) {
      deleteTournament(delBtn.dataset.del);
    }
  });

  // Add player
  $('btn-add-player').addEventListener('click', () => {
    const input = $('player-input');
    addPlayer(input.value);
    input.value = '';
    input.focus();
  });

  $('player-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = $('player-input');
      addPlayer(input.value);
      input.value = '';
    }
  });

  // Paste import
  $('btn-paste-import').addEventListener('click', () => {
    const text = $('paste-input').value.trim();
    if (!text) return;
    const names = text.split('\n').map(n => n.trim()).filter(Boolean);
    let added = 0;
    names.forEach(name => {
      if (!state.players.includes(name)) {
        state.players.push(name);
        added++;
      }
    });
    renderPlayerList();
    $('paste-input').value = '';
    showToast(`Added ${added} player${added !== 1 ? 's' : ''}.`);
  });

  // Randomize
  $('btn-randomize').addEventListener('click', () => {
    if (state.players.length < 2) return;
    state.players = shuffleArray(state.players);
    renderPlayerList();
    showToast('Player order randomized!');
  });

  // Clear all players
  $('btn-clear-players').addEventListener('click', () => {
    if (state.players.length === 0) return;
    if (!confirm('Remove all players?')) return;
    state.players = [];
    renderPlayerList();
  });

  // Generate tournament
  $('btn-generate').addEventListener('click', generateTournament);

  // Reset tournament
  $('btn-reset').addEventListener('click', resetTournament);

  // Save tournament
  $('btn-save').addEventListener('click', saveTournament);

  // Export JSON
  $('btn-export').addEventListener('click', exportJSON);

  // Import JSON
  $('btn-import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importJSON(file);
      e.target.value = '';
    }
  });

  // Dark mode
  $('btn-dark-mode').addEventListener('click', toggleDarkMode);

  // Print
  $('btn-print').addEventListener('click', () => window.print());

  // Modal close
  $('modal-close').addEventListener('click', closeMatchModal);
  $('match-modal').addEventListener('click', (e) => {
    if (e.target === $('match-modal')) closeMatchModal();
  });

  // Modal winner buttons
  $('modal-win1').addEventListener('click', () => selectWinner(1));
  $('modal-win2').addEventListener('click', () => selectWinner(2));

  // Clicking team card selects as winner
  $('modal-team1').addEventListener('click', () => selectWinner(1));
  $('modal-team2').addEventListener('click', () => selectWinner(2));

  // Auto-select winner from score inputs
  function autoSelectFromScores() {
    const s1 = parseInt($('modal-score1').value);
    const s2 = parseInt($('modal-score2').value);
    if (!isNaN(s1) && !isNaN(s2)) {
      if (s1 > s2) selectWinner(1);
      else if (s2 > s1) selectWinner(2);
    }
  }

  $('modal-score1').addEventListener('input', autoSelectFromScores);
  $('modal-score2').addEventListener('input', autoSelectFromScores);

  // Modal save / clear
  $('modal-save').addEventListener('click', saveMatchModal);
  $('modal-clear').addEventListener('click', clearMatchModal);

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('match-modal').style.display !== 'none') {
      closeMatchModal();
    }
  });
}

/* =====================================================
   INIT
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadDarkModePreference();
  renderPlayerList();
  renderSavedList();
  initRRTabs();
  initEventListeners();
});
