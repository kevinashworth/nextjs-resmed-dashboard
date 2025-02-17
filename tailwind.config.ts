import type { Config } from "tailwindcss";

import twForms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";

import { dynamicTwClasses } from "./src/lib/tw/twPlugin";
import { baseHue } from "./src/lib/tw/constants";

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
        accent: dynamicTwClasses("accent", baseHue.accent),
        code: colors.emerald,
        danger: colors.red,
        success: colors.green,
      },
    },
  },
};

export default config;
