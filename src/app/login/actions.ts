"use server";

import { redirect } from "next/navigation";

import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

import type { LoginState } from "./login-state";

const DEMO_UNAVAILABLE = "The demo isn't available right now.";

// Signs in and redirects to the charts, or returns the error so each action can choose its message.
async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return error;
  redirect("/sleep-data");
}

// Runs on the server: the password goes from the form to this function, and only a session cookie goes back.
export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const error = await signInWithPassword(email, password);
  // Wrong password and unknown email share one message, so it doesn't reveal which accounts exist.
  // Anything else, such as a rate limit or an outage, gets a generic message instead of blaming the password.
  const message =
    error?.code === "invalid_credentials" ? "Incorrect email or password." : "Sign-in failed. Please try again later.";
  return { error: message, email };
}

// The button only shows in demo mode, but anyone can call a server action directly, so check again here.
export async function signInAsDemo(_previousState: LoginState): Promise<LoginState> {
  const email = process.env.SUPABASE_DEMO_EMAIL;
  const password = process.env.SUPABASE_DEMO_PASSWORD;
  if (!isDemoMode() || !email || !password) {
    return { error: DEMO_UNAVAILABLE };
  }

  await signInWithPassword(email, password);
  return { error: DEMO_UNAVAILABLE };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
