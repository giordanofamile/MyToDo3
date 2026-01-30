import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://efstrxvkobetogrnalux.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmc3RyeHZrb2JldG9ncm5hbHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTE5MTAsImV4cCI6MjA4NTM2NzkxMH0.STI47XLORS12t5WsLCMVg49P0CGD7kCoxiXqqNc-lxg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);