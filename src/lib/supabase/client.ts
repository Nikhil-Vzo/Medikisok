import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://kzbfihrocizwazhsjgmr.supabase.co";
  // Support both standard Supabase name and the legacy/custom name
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_R_d-_JQhRhQ0SQOfj9NZng_FhY8wcBx";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
