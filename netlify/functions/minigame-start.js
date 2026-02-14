const { supabase } = require('./_lib/supabase')

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Niet ingelogd' })
    }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Ongeldige token' })
    }
  }

  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('last_minigame')
    .eq('user_id', user.id)
    .single()

  const now = new Date()
  if (stats?.last_minigame) {
    const last = new Date(stats.last_minigame)
    const diffSeconds = (now - last) / 1000
    if (diffSeconds < 600) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Te vroeg', waitSeconds: Math.ceil(600 - diffSeconds) })
      }
    }
  }

  const { data: words, error: wordsError } = await supabase
    .from('minigame_words')
    .select('id, source_word, target_word')
    .limit(20)

  if (wordsError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: wordsError.message })
    }
  }

  const shuffled = words.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 5)

  const vragen = selected.map(correct => {
    const others = words.filter(w => w.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.target_word)

    const opties = [correct.target_word, ...others]
    const shuffledOpties = opties.sort(() => 0.5 - Math.random())

    return {
      vraag: correct.source_word,
      opties: shuffledOpties,
      goed: correct.target_word,
      id: correct.id
    }
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ vragen })
  }
}