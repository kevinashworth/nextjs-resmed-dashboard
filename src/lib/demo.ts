// Demo mode adds a "Try the demo" button to /login that signs in as a shared demo user.
// Set DEMO_MODE=true with SUPABASE_DEMO_EMAIL and SUPABASE_DEMO_PASSWORD. These are server-only:
// none start with NEXT_PUBLIC_, so they never reach the browser.
export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

// True when the signed-in user is the shared demo user, so pages can hide the owner's personal details.
export function isDemoUser(email: string | undefined) {
  const demoEmail = process.env.SUPABASE_DEMO_EMAIL;
  return Boolean(demoEmail && email && email.toLowerCase() === demoEmail.toLowerCase());
}
