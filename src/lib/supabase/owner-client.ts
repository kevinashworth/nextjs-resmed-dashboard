import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// TEMPORARY until M5: reads as the owner. M5 replaces this with the visitor's session.
export async function createOwnerClient() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_OWNER_EMAIL!,
    password: process.env.SUPABASE_OWNER_PASSWORD!,
  });
  if (error) throw error;
  return supabase;
}
