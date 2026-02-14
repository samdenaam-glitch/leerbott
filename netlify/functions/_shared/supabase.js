const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function getUserFromToken(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return { user, error }
}

module.exports = { supabase, getUserFromToken }
