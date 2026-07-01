import { Input } from "./Input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Input,
  args: {
    placeholder: "Placeholder text",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
