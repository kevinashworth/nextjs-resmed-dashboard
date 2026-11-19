"use client";

import { useActionState } from "react";

import { Button } from "@/components/Button";

import { signInAsDemo, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function DemoLoginButton() {
  const [state, formAction, isPending] = useActionState(signInAsDemo, initialState);

  return (
    <form action={formAction} className="flex w-72 flex-col gap-3">
      <Button type="submit" variant="secondary" disabled={isPending} className="w-full">
        {isPending ? "Opening the demo…" : "Try the demo"}
      </Button>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
