import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ofbeemqhajiprabnqezb.supabase.co'
const supabaseAnonKey = 'YOUR_PUBLISHABLE_KEY_HERE' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)