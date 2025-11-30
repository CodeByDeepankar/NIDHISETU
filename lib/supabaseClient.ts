import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extraEnv = (Constants.expoConfig?.extra as { env?: Record<string, string | undefined> } | undefined)?.env ?? {};

const sanitize = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined;
  }
  return trimmed;
};

const supabaseUrl =
  sanitize(process.env.EXPO_PUBLIC_SUPABASE_URL) ?? sanitize(extraEnv.EXPO_PUBLIC_SUPABASE_URL);
const supabaseAnonKey =
  sanitize(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) ?? sanitize(extraEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable media uploads.'
  );
}

export const SUPABASE_BUCKET =
  sanitize(process.env.EXPO_PUBLIC_SUPABASE_BUCKET) ?? sanitize(extraEnv.EXPO_PUBLIC_SUPABASE_BUCKET) ?? 'loan-evidence';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : undefined;
