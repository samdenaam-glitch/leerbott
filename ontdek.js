let currentFilter = {
  language: '',
  level: ''
}

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    document.getElementById('username').textContent = session.user.email
  }

  await laadLijsten(session?.access_token)

  // Filter button
  document.getElementById('filterBtn')?.addEventListener('click', async () => {
    currentFilter.language = document.getElementById('taalFilter').value
    currentFilter.level = document.getElementById('niveauFilter').value
    const { data: { session } } = await supabase.auth.getSession()
    await laadLijsten(session?.access_token)
  })
})

async function laadLijsten(token) {
  let url = '/api/shared-lists?'
  if (currentFilter.language) url += `language=${currentFilter.language}&`
  if (currentFilter.level) url += `level=${currentFilter.level}`

  const res = await fetch(url, {
    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
  })
  if (!res.ok) {
    showToast('Fout bij laden van voorbeeldlijsten', 'error')
    return
  }
  const lijsten = await res.json()
  const container = document.getElementById('lijstenContainer')
  container.innerHTML = ''
  if (lijsten.length === 0) {
    container.innerHTML = '<p style="text-align:center;">Geen lijsten gevonden.</p>'
    return
  }
  lijsten.forEach(lijst => {
    const div = document.createElement('div')
    div.className = 'list-card'
    div.innerHTML = `
      <h3>${lijst.name}</h3>
      <p>${lijst.description || ''}</p>
      <div class="list-meta">
        <span>${vertaalTaal(lijst.language)}</span>
        <span>${lijst.level || '-'}</span>
      </div>
      <div class="list-actions">
        <button class="kopieerBtn btn small" data-id="${lijst.id}">📋 Kopiëren</button>
        <button class="bekijkBtn btn small secondary" data-id="${lijst.id}">👁️ Bekijk</button>
      </div>
    `
    container.appendChild(div)
  })

  document.querySelectorAll('.kopieerBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id
      await kopieerLijst(id, token)
    })
  })
  document.querySelectorAll('.bekijkBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id
      await toonWoorden(id, token)
    })
  })
}

function vertaalTaal(code) {
  const talen = {
    'en': 'Engels',
    'fr': 'Frans',
    'de': 'Duits',
    'es': 'Spaans',
    'it': 'Italiaans'
  }
  return talen[code] || code
}

async function kopieerLijst(sharedListId, token) {
  if (!token) {
    showToast('Je moet ingelogd zijn om lijsten te kopiëren', 'error')
    window.location.href = 'login.html'
    return
  }

  try {
    // Get the shared list words
    const res = await fetch(`/api/shared-list-words?listId=${sharedListId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!res.ok) {
      showToast('Fout bij ophalen van woorden', 'error')
      return
    }

    const words = await res.json()
    
    // For now, just show a message. You can implement the full copy functionality
    showToast(`Deze lijst heeft ${words.length} woorden. Kopiëren komt binnenkort!`, 'info')
    
  } catch (e) {
    showToast('Fout bij kopiëren: ' + e.message, 'error')
  }
}

async function toonWoorden(sharedListId, token) {
  try {
    const res = await fetch(`/api/shared-list-words?listId=${sharedListId}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    
    if (!res.ok) {
      showToast('Fout bij ophalen van woorden', 'error')
      return
    }

    const words = await res.json()
    const modalContainer = document.getElementById('modalWoordenLijst')
    
    if (words.length === 0) {
      modalContainer.innerHTML = '<p>Geen woorden in deze lijst.</p>'
    } else {
      modalContainer.innerHTML = words.map(w => `
        <div class="word-item" style="margin-bottom: 10px; padding: 10px; background: var(--primary-light); border-radius: 10px;">
          <strong>${w.source_word}</strong> → ${w.target_word}
        </div>
      `).join('')
    }

    // Show modal
    document.getElementById('woordModal').style.display = 'block'
  } catch (e) {
    showToast('Fout bij laden woorden: ' + e.message, 'error')
  }
}

// Modal close button
document.querySelector('.close')?.addEventListener('click', () => {
  document.getElementById('woordModal').style.display = 'none'
})

window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('woordModal')) {
    document.getElementById('woordModal').style.display = 'none'
  }
})
