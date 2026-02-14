const { supabase, getUserFromToken } = require('./_shared/supabase')

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
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
  const { user, error: authError } = await getUserFromToken(token)
  
  if (authError || !user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Ongeldige token' })
    }
  }

  // GET: Get user stats
  if (event.httpMethod === 'GET') {
    let { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no stats exist, create them
    if (!stats) {
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert([{
          user_id: user.id,
          xp: 0,
          level: 1,
          streak: 0
        }])
        .select()
        .single()

      if (createError) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to create stats' })
        }
      }
      stats = newStats
    }

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(stats)
    }
  }

  // POST: Update user stats (add XP)
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}')
    const { xpGained } = body

    if (!xpGained || xpGained < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid xpGained required' })
      }
    }

    // Get current stats
    let { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Create if doesn't exist
    if (!stats) {
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert([{
          user_id: user.id,
          xp: 0,
          level: 1,
          streak: 0
        }])
        .select()
        .single()
      stats = newStats
    }

    // Calculate new XP and level
    const newXp = (stats.xp || 0) + xpGained
    const newLevel = Math.floor(newXp / 100) + 1

    // Update stats
    const { data: updatedStats, error } = await supabase
      .from('user_stats')
      .update({
        xp: newXp,
        level: newLevel,
        last_practice_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(updatedStats)
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  }
}
