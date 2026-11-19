"use server";

import { redirect } from "next/navigation";

import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

// Runs on the server: the password goes from the form to this function, and only a session cookie goes back.
export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Don't reveal whether the email exists.
    return { error: "Incorrect email or password." };
  }

  redirect("/sleep-data");
}

// The button only shows in demo mode, but anyone can call a server action directly, so check again here.
export async function signInAsDemo(_previousState: LoginState): Promise<LoginState> {
  const email = process.env.SUPABASE_DEMO_EMAIL;
  const password = process.env.SUPABASE_DEMO_PASSWORD;
  if (!isDemoMode() || !email || !password) {
    return { error: "The demo isn't available right now." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "The demo isn't available right now." };
  }

  redirect("/sleep-data");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
