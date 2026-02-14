const { supabase } = require('./_shared/supabase')

exports.handler = async (event, context) => {
  // Handle CORS
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

  // GET: Get words from a shared list
  if (event.httpMethod === 'GET') {
    const params = new URLSearchParams(event.rawQuery || '')
    const sharedListId = params.get('listId')

    if (!sharedListId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'listId parameter required' })
      }
    }

    const { data, error } = await supabase
      .from('shared_words')
      .select('*')
      .eq('shared_list_id', sharedListId)
      .order('created_at', { ascending: true })

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data || [])
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  }
}
