import { cx } from "class-variance-authority";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

// import { getThemeData, getThemeDataFromCookies } from "@/components/themePicker/ThemePicker";

import type { Metadata } from "next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResMed Sleep Data Dashboard",
  description: "Built with Next.js, Tailwind CSS, and TypeScript",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { darkMode, hue } = await getThemeDataFromCookies();
  // const { className, style } = getThemeData(hue!, darkMode === "yes");
  // console.log({ className, style });

  return (
    <html lang="en" className="h-full">
      <body className={cx(geistSans.variable, geistMono.variable, "antialiased")}>
        <nav className="mx-auto flex justify-center gap-4 bg-orange-50 text-xs font-medium text-orange-800">
          <Link className="m-1 p-1 hover:bg-orange-100 hover:underline" href="/">
            Home
          </Link>
          <Link className="m-1 p-1 hover:bg-orange-100 hover:underline" href="/sleep-data">
            Sleep Data
          </Link>
          {/* <Link className="m-1 p-1 hover:bg-orange-100 hover:underline" href="/settings">
            Settings
          </Link> */}
        </nav>

        <main className="m-1 p-1">{children}</main>
      </body>
    </html>
  );
}

// {/* <html lang="en" className={cx("h-full", { className: !!className })} style={style}> */}
