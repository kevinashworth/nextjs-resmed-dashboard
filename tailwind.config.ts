import twForms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";

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
        accent: {
          "50": "oklch(0.9777777777777777 0.0114 40)",
          "100": "oklch(0.9355555555555556 0.0331 40)",
          "200": "oklch(0.8511111111111112 0.0774 40)",
          "300": "oklch(0.7666666666666667 0.1275 40)",
          "400": "oklch(0.6822222222222223 0.1547 40)",
          "500": "oklch(0.5977777777777777 0.1355 40)",
          "600": "oklch(0.5133333333333333 0.1164 40)",
          "700": "oklch(0.4288888888888889 0.0974 40)",
          "800": "oklch(0.34444444444444444 0.0782 40)",
          "900": "oklch(0.26 0.0588 40)",
          "950": "oklch(0.2177777777777777 0.0491 40)",
        },
        code: colors.emerald,
        danger: colors.red,
        success: colors.green,
      },
    },
  },
};

export default config;
