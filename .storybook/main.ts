import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@chromatic-com/storybook", "@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    config.build ??= {};

    config.build.chunkSizeWarningLimit = 1_322;

    config.build.rolldownOptions = {
      ...config.build.rolldownOptions,
      onLog(level, log, defaultHandler) {
        if (level === "warn" && log.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }

        defaultHandler(level, log);
      },
    };

    return config;
  },
};

export default config;
