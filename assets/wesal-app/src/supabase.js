import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdgkdbzdfklwckkfyoly.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZ2tkYnpkZmtsd2Nra2Z5b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjI4MDQsImV4cCI6MjA4MTAzODgwNH0.lhbVROmnXbrbm2H4UsXn0HAy87reghgZ2CkvSYiMqV0'

export const supabase = createClient(supabaseUrl, supabaseKey)