import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vsmeitfapvzojbvvbtgd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbWVpdGZhcHZ6b2pidnZidGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTMyMDgsImV4cCI6MjA5MjkyOTIwOH0.v_5cAu7Ds1vL16M5tRLbw0xoytM8Z3XA0gNZMlHgPIQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
