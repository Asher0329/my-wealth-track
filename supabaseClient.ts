import { createClient } from '@supabase/supabase-js'

// 使用环境变量，这样部署到 Netlify 时更安全
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
