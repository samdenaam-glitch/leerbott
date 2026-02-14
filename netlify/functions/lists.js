const { supabase, getUserFromToken } = require('./_shared/supabase')

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
      },
      body: ''
    }
  }

  // Auth check
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

  // GET: Get all lists for this user
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        words (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }

    // Format the response with word count
    const formatted = data.map(list => ({
      ...list,
      woord_count: list.words?.[0]?.count || 0,
      words: undefined
    }))
    
    return {
      statusCode: 200,
      body: JSON.stringify(formatted)
    }
  }

  // POST: Create new list
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}')
    const { name, description } = body
    
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Naam verplicht' })
      }
    }

    const { data, error } = await supabase
      .from('lists')
      .insert([{ 
        user_id: user.id, 
        name, 
        description,
        woord_count: 0
      }])
      .select()
      .single()

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }
    
    return {
      statusCode: 201,
      body: JSON.stringify(data)
    }
  }

  // DELETE: Remove a list
  if (event.httpMethod === 'DELETE') {
    const params = new URLSearchParams(event.rawQuery)
    const listId = params.get('id')
    
    if (!listId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'List ID required' })
      }
    }

    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', user.id)

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }
    
    return {
      statusCode: 204,
      body: ''
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  }
}
