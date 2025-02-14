import { NextRequest, NextResponse } from "next/server";

import { getThemeData } from "@/components/themePicker/ThemePicker";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const hue = url.searchParams.get("hue"),
    dark = url.searchParams.get("darkMode") === "yes";

  return NextResponse.json(getThemeData(hue!, dark), { status: 200 });
}
