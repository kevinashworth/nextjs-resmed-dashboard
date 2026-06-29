import { Input } from "./Input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
