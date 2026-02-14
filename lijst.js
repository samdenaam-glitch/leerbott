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

  await laadLijstNaam(session.access_token, lijstId);
  await laadWoorden(session.access_token, lijstId);

  document.getElementById('voegWoordBtn').addEventListener('click', async () => {
    const bron = document.getElementById('bronWoord').value.trim();
    const doel = document.getElementById('doelWoord').value.trim();
    if (!bron || !doel) return showToast('Vul beide woorden in!', 'warning');
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/words?listId=${lijstId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ source_word: bron, target_word: doel })
    });
    if (res.ok) {
      document.getElementById('bronWoord').value = '';
      document.getElementById('doelWoord').value = '';
      await laadWoorden(session.access_token, lijstId);
      showToast('Woord toegevoegd!', 'success');
    } else showToast('Fout bij toevoegen', 'error');
  });
});

async function laadLijstNaam(token, lijstId) {
  const res = await fetch('/api/lists', { headers: { 'Authorization': `Bearer ${token}` } });
  const lijsten = await res.json();
  const lijst = lijsten.find(l => l.id == lijstId);
  if (lijst) document.getElementById('lijstNaam').textContent = lijst.name;
}

async function laadWoorden(token, lijstId) {
  const res = await fetch(`/api/words?listId=${lijstId}`, { headers: { 'Authorization': `Bearer ${token}` } });
  const woorden = await res.json();
  const container = document.getElementById('woordenContainer');
  container.innerHTML = '';
  if (!woorden.length) {
    container.innerHTML = '<p>Nog geen woordjes. Voeg er een toe!</p>';
    return;
  }
  woorden.forEach(w => {
    const div = document.createElement('div');
    div.className = 'word-item';
    div.innerHTML = `<div class="word-pair"><span class="source">${w.source_word}</span> → <span class="target">${w.target_word}</span></div><button onclick="verwijderWoord(${w.id})">🗑️</button>`;
    container.appendChild(div);
  });
}

window.verwijderWoord = async function(id) {
  if (!confirm('Verwijderen?')) return;
  const { data: { session } } = await supabase.auth.getSession();
  const lijstId = window.getLijstId();
  const res = await fetch(`/api/words?listId=${lijstId}&id=${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  if (res.ok) {
    await laadWoorden(session.access_token, lijstId);
    showToast('Verwijderd', 'success');
  } else showToast('Fout bij verwijderen', 'error');
};