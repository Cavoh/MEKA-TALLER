import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ifmrmafdtlninrbwezdk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbXJtYWZkdGxuaW5yYndlemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzgxNjMsImV4cCI6MjA4MzU1NDE2M30.iDKgu8F0dleBZj0oSB7bdLzi4sMV5U0Bb-sqvEMQPsI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
