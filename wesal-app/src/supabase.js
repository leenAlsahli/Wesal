import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdgkdbzdfklwckkfyoly.supabase.co'
const supabaseKey = 'sb_publishable_VioXmD5M7yo-HtRBlchBDg_Rc4v4Wbc'

export const supabase = createClient(supabaseUrl, supabaseKey)