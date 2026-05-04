import { createClient } from "@supabase/supabase-js";

import "server-only";

// VibeSec: Use strict checks for environment variables to fail fast if missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error("[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is missing.");
}

/**
 * Creates a Supabase client with the Service Role key.
 * This client has admin privileges and bypasses Row Level Security (RLS).
 * STRICTLY for server-side use only.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
