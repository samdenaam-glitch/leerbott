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

  const body = JSON.parse(event.body || '{}')
  const { score } = body

  const xpGained = score * 10

  const { data: stats, error: fetchError } = await supabase
    .from('user_stats')
    .select('xp, level, streak, last_minigame')
    .eq('user_id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: fetchError.message })
    }
  }

  const now = new Date()
  const newXp = (stats?.xp || 0) + xpGained
  const newLevel = Math.floor(newXp / 100) + 1

  const { data, error: upsertError } = await supabase
    .from('user_stats')
    .upsert({
      user_id: user.id,
      xp: newXp,
      level: newLevel,
      streak: stats?.streak || 0,
      last_active: now.toISOString().split('T')[0],
      last_minigame: now.toISOString()
    })
    .select()
    .single()

  if (upsertError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: upsertError.message })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ xpGained, newXp, newLevel })
  }
}