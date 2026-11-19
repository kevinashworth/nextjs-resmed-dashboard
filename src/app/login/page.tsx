import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <h1 className="mb-4 text-xl font-bold text-accent-500">Sign in to view sleep data</h1>
      <LoginForm />
    </div>
  );
}
