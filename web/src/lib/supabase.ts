import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasRealSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseUrl.includes('placeholder');

/**
 * Offline demo mode: the app runs on local demo data and needs no accounts.
 * On when VITE_DEMO=1 (e.g. `VITE_DEMO=1 npm run dev`), or when Supabase isn't configured.
 * In demo mode the email OTP code is always 123456.
 */
export const isDemoMode = import.meta.env.VITE_DEMO === '1' || !hasRealSupabaseConfig;

/** True only when the app should talk to the real Supabase backend. */
export const isSupabaseConfigured = !isDemoMode;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
