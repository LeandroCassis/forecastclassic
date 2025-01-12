import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://efqdvfqyegetrekukfqw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWR2ZnF5ZWdldHJla3VrZnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MzEzNTEsImV4cCI6MjA1MjEwNzM1MX0.PoVDvinvU4FNmByqs5iCFy_eCe0Ac_QrjywW8TajtpM";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    db: {
      schema: 'public'
    }
  }
);