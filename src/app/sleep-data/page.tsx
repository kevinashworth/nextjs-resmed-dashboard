import { redirect } from "next/navigation";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

import getData from "./get-data";
import PageContent from "./page-content";

export default async function Page() {
  const supabase = await createClient();

  // src/proxy.ts already redirects signed-out visitors, but a matcher mistake could skip it,
  // so verify the user here as well. RLS in Postgres is the final safeguard for the data.
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) {
    redirect("/login");
  }

  const data = await getData(supabase);

  return (
    <PageContent
      data={data}
      actions={
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      }
    />
  );
}
