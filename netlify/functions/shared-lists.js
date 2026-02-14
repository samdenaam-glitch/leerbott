const { supabase, getUserFromToken } = require('./_shared/supabase')

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

  // GET: Get shared/example lists
  if (event.httpMethod === 'GET') {
    const params = new URLSearchParams(event.rawQuery || '')
    const language = params.get('language')
    const level = params.get('level')

    let query = supabase
      .from('shared_lists')
      .select(`
        *,
        shared_words (count)
      `)

    if (language) {
      query = query.eq('language', language)
    }
    if (level) {
      query = query.eq('level', level)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }

    // Format the response
    const formatted = data.map(list => ({
      ...list,
      word_count: list.shared_words?.[0]?.count || 0,
      shared_words: undefined
    }))
    
    return {
      statusCode: 200,
      body: JSON.stringify(formatted)
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  }
}
