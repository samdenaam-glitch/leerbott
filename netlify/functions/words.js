const { supabase, getUserFromToken } = require('./_lib/supabase')

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

  const params = new URLSearchParams(event.rawQuery || '')
  const listId = params.get('listId')

  if (!listId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'listId parameter required' })
    }
  }

  // Check if the list belongs to this user
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single()

  if (listError || !list) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Geen toegang tot deze lijst' })
    }
  }

  // GET: Get all words in this list
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true })

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }

  // POST: Add new word
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}')
    const { source_word, target_word } = body
    
    if (!source_word || !target_word) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Beide woorden zijn verplicht' })
      }
    }

    const { data, error } = await supabase
      .from('words')
      .insert([{ list_id: listId, source_word, target_word }])
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

  // DELETE: Remove a word
  if (event.httpMethod === 'DELETE') {
    const wordId = params.get('id')
    
    if (!wordId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Geen woord ID opgegeven' })
      }
    }
    
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId)
      .eq('list_id', listId)

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
