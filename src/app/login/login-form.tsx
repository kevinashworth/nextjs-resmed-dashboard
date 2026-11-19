"use client";

import { useActionState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex w-72 flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Email
        <Input name="email" type="email" autoComplete="email" required />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Password
        <Input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="mt-4">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
