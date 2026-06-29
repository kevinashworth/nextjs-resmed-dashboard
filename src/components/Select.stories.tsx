import { Select } from "./Select";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
