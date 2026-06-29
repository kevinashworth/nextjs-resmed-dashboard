import { Switch } from "./Switch";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "label",
  },
};
