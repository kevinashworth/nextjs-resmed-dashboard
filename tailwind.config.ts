import twForms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";

// import { baseHue } from "./src/lib/tw/constants";
// import { dynamicTwClasses } from "./src/lib/tw/twPlugin";

import type { Config } from "tailwindcss";

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
        // accent: dynamicTwClasses("accent", baseHue.accent),
        code: colors.emerald,
        danger: colors.red,
        success: colors.green,
      },
    },
  },
};

export default config;
