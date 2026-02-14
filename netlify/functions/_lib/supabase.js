const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getUserFromToken(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return { user, error }
}

module.exports = { supabase, getUserFromToken }