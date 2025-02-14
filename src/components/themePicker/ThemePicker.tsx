import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getVariables } from "@/lib/tw/runtime";

import { FormContent } from "./Form";

const hueCookie = "theme-hue",
  darkModeCookie = "theme-dark-mode";

const getHue = async () => (await cookies()).get(hueCookie)?.value ?? "40";
const getDarkMode = async () =>
  (await cookies()).get(darkModeCookie)?.value ?? "no";

export const getThemeDataFromCookies = async () => {
  return {
    darkMode: await getDarkMode(),
    hue: await getHue(),
  };
};

export function getThemeData(hue: string, darkMode: boolean) {
  const accent = getVariables({ baseName: "accent", hue: +hue });

  return {
    className: darkMode ? "dark" : "",
    style: Object.fromEntries(accent),
  };
}

export async function ThemePicker() {
  async function updateTheme(form: FormData) {
    "use server";

    const cookieStore = await cookies();
    cookieStore.set(hueCookie, form.get("hue") as string, {
      maxAge: 1704085200,
    });
    cookieStore.set(
      darkModeCookie,
      form.get("force-dark") == "on" ? "yes" : "no",
      { maxAge: 1704085200 }
    );

    revalidatePath("/api/my-theme");
  }

  return (
    <form action={updateTheme} className="md:col-span-2">
      <FormContent
        darkMode={(await getDarkMode()) == "yes"}
        hue={await getHue()}
      />
    </form>
  );
}
