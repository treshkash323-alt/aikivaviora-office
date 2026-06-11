import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const DEFAULT_TENANT_SLUG =
  import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? 'customer-demo';

export const supabaseConfigured = url.startsWith('http') && anon.length > 20;

export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder',
);

export function chatFunctionUrl(): string | null {
  if (!supabaseConfigured) return null;
  return `${url.replace(/\/$/, '')}/functions/v1/chat`;
}
