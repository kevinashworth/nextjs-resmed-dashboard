import type { Config } from "tailwindcss";

import twForms from "@tailwindcss/forms";
import colors, { fuchsia } from "tailwindcss/colors";

import { dynamicTwClasses } from "./src/lib/tw/twPlugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  plugins: [twForms],
  theme: {
    extend: {
      colors: {
        accent: dynamicTwClasses("accent", 40),
        code: colors.emerald,
        danger: colors.red,
        success: colors.green,
      },
    },
  },
};

export default config;
