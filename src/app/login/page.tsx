import { connection } from "next/server";

import { isDemoMode } from "@/lib/demo";

import DemoLoginButton from "./demo-login-button";
import LoginForm from "./login-form";

export default async function LoginPage() {
  // Render per request so DEMO_MODE is read when the server runs, not baked in at build time.
  await connection();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <h1 className="mb-4 text-xl font-bold text-accent-500">Sign in to view sleep data</h1>
      <LoginForm />
      {isDemoMode() ? (
        <>
          <p className="text-sm text-gray-500">or</p>
          <DemoLoginButton />
        </>
      ) : null}
    </div>
  );
}
