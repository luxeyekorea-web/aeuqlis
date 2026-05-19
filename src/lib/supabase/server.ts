import { createClient } from "@supabase/supabase-js";

function createSupabaseClient(key: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}

export function createSupabaseReadClient() {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseKey);
}

export function createSupabaseAdminClient() {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseKey);
}
