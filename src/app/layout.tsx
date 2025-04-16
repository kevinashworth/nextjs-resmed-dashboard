import { cx } from "class-variance-authority";
import { Geist, Geist_Mono } from "next/font/google";

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
  title: "My Resmed Sleep Data Dashboard",
  description:
    "I built this Sleep Data Dashboard to view my `Resmed myAir` data with different timelines - Built with Next.js, React, Tailwind CSS, and TypeScript",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cx(geistSans.variable, geistMono.variable, "antialiased")}>
        <main className="m-1 p-1">{children}</main>
      </body>
    </html>
  );
}
