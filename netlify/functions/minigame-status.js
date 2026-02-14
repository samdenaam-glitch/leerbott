const { supabase } = require('./_lib/supabase')

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
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

  if (statsError && statsError.code !== 'PGRST116') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: statsError.message })
    }
  }

  const now = new Date()
  let canPlay = true
  let waitSeconds = 0

  if (stats?.last_minigame) {
    const last = new Date(stats.last_minigame)
    const diffSeconds = (now - last) / 1000
    if (diffSeconds < 600) {
      canPlay = false
      waitSeconds = Math.ceil(600 - diffSeconds)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ canPlay, waitSeconds })
  }
}