// Shared by the login forms and their server actions. It lives outside actions.ts because a
// "use server" file may only export async functions.

// `email` is returned on failure so the form can keep what the user typed.
export type LoginState = { error: string | null; email?: string };

export const initialLoginState: LoginState = { error: null };
