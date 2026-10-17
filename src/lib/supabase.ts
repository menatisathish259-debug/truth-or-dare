import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are realistically configured
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-supabase') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Singleton Supabase Client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Return current configuration status and details for diagnostics UI
 */
export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]{4})[^/]+/, '$1...') : 'Not set',
    hasKey: Boolean(supabaseAnonKey && supabaseAnonKey.length > 10),
  };
};
