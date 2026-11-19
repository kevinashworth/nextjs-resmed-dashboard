import { redirect } from "next/navigation";

import { signOut } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";

import getData from "./get-data";
import PageContent from "./page-content";

export default async function Page() {
  const supabase = await createClient();

  // Check here too: the proxy is a convenience, and the page must not rely on it alone.
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) {
    redirect("/login");
  }

  const data = await getData(supabase);

  return (
    <>
      <form action={signOut} className="flex justify-end px-4">
        <button type="submit" className="text-sm text-gray-600 underline hover:text-gray-900">
          Sign out
        </button>
      </form>
      <PageContent data={data} />
    </>
  );
}
