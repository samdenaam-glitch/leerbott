window.getLijstId = (function() {
  let id = null;
  return function() {
    if (!id) {
      const params = new URLSearchParams(window.location.search);
      id = params.get('id');
    }
    return id;
  };
})();

let woorden = [], huidigeIndex = 0, toonAntwoord = false, goedCount = 0, foutCount = 0, sessieXP = 0, woordHistory = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabase) return alert('Supabase niet geladen');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return window.location.href = 'index.html';
  document.getElementById('username').textContent = session.user.email;

  const lijstId = window.getLijstId();
  if (!lijstId) {
    alert('Geen lijst geselecteerd');
    window.location.href = 'dashboard.html';
    return;
  }

  await laadStats(session.access_token);
  await laadWoorden(session.access_token, lijstId);

  if (woorden.length) {
    toonKaart(0);
    updateProgress();
  } else {
    document.getElementById('flashcard').innerHTML = 'Deze lijst is leeg! Voeg eerst woorden toe.';
  }

  document.getElementById('goedBtn')?.addEventListener('click', goedAntwoord);
  document.getElementById('foutBtn')?.addEventListener('click', foutAntwoord);
});

async function laadWoorden(token, lijstId) {
  const res = await fetch(`/api/words?listId=${lijstId}`, { headers: { 'Authorization': `Bearer ${token}` } });
  woorden = await res.json();
  woordHistory = new Array(woorden.length).fill(false);
}

async function laadStats(token) {
  const res = await fetch('/api/user-stats', { headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) {
    const stats = await res.json();
    document.getElementById('xpDisplay').textContent = stats.xp || 0;
    document.getElementById('levelDisplay').textContent = stats.level || 1;
    document.getElementById('streakDisplay').textContent = stats.streak || 0;
  }
}

async function updateStats(xpGained) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const res = await fetch('/api/user-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify({ xpGained })
  });
  if (res.ok) {
    const stats = await res.json();
    document.getElementById('xpDisplay').textContent = stats.xp;
    document.getElementById('levelDisplay').textContent = stats.level;
    document.getElementById('streakDisplay').textContent = stats.streak;
    return stats;
  }
}

function toonKaart(index) {
  if (!woorden.length) return;
  huidigeIndex = index;
  toonAntwoord = false;
  document.getElementById('voorkant').textContent = woorden[index].source_word;
  document.getElementById('voorkant').classList.add('active');
  document.getElementById('achterkant').classList.remove('active');
  document.getElementById('achterkant').textContent = woorden[index].target_word;
  document.getElementById('teller').textContent = `${index+1} / ${woorden.length}`;
}

window.draaiKaart = function() {
  if (!woorden.length) return;
  toonAntwoord = !toonAntwoord;
  const voorkant = document.getElementById('voorkant');
  const achterkant = document.getElementById('achterkant');
  if (toonAntwoord) {
    voorkant.classList.remove('active');
    achterkant.classList.add('active');
  } else {
    voorkant.classList.add('active');
    achterkant.classList.remove('active');
  }
};

window.volgendeKaart = function() {
  if (!woorden.length) return;
  huidigeIndex = (huidigeIndex + 1) % woorden.length;
  toonKaart(huidigeIndex);
};

window.vorigeKaart = function() {
  if (!woorden.length) return;
  huidigeIndex = (huidigeIndex - 1 + woorden.length) % woorden.length;
  toonKaart(huidigeIndex);
};

function updateProgress() {
  const beantwoord = woordHistory.filter(v => v).length;
  document.getElementById('progressText').textContent = `${beantwoord} / ${woorden.length} woorden`;
  document.getElementById('progressFill').style.width = woorden.length ? (beantwoord / woorden.length * 100) + '%' : '0%';
}

function checkSessieVoltooid() {
  if (woordHistory.every(v => v)) {
    document.getElementById('sessieGoed').textContent = goedCount;
    document.getElementById('sessieFout').textContent = foutCount;
    document.getElementById('sessieXP').textContent = sessieXP;
    document.getElementById('sessieModal').style.display = 'block';
  }
}

async function goedAntwoord() {
  if (!woorden.length || woordHistory[huidigeIndex]) return;
  goedCount++; sessieXP += 5; woordHistory[huidigeIndex] = true;
  updateProgress(); await updateStats(5); showToast('+5 XP!', 'success');
  if (huidigeIndex < woorden.length - 1) volgendeKaart(); else checkSessieVoltooid();
}

async function foutAntwoord() {
  if (!woorden.length || woordHistory[huidigeIndex]) return;
  foutCount++; sessieXP += 1; woordHistory[huidigeIndex] = true;
  updateProgress(); await updateStats(1); showToast('+1 XP', 'info');
  if (!toonAntwoord) draaiKaart();
  setTimeout(() => {
    if (huidigeIndex < woorden.length - 1) volgendeKaart(); else checkSessieVoltooid();
  }, 1500);
}

document.querySelector('.close')?.addEventListener('click', () => document.getElementById('sessieModal').style.display = 'none');
window.addEventListener('click', e => { if (e.target === document.getElementById('sessieModal')) document.getElementById('sessieModal').style.display = 'none'; });