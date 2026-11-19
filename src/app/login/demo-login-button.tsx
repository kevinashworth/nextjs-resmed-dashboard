"use client";

import { useActionState } from "react";

import { Button } from "@/components/Button";

import { signInAsDemo } from "./actions";
import FormError from "./form-error";
import { initialLoginState } from "./login-state";

export default function DemoLoginButton() {
  const [state, formAction, isPending] = useActionState(signInAsDemo, initialLoginState);

  return (
    <form action={formAction} className="flex w-72 flex-col gap-3">
      <Button type="submit" variant="secondary" disabled={isPending} className="w-full">
        {isPending ? "Opening the demo…" : "Try the demo"}
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
