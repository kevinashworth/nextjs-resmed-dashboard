import { fn } from "storybook/test";

import { Field } from "./Field";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "id",
    label: fn(),
  },
};
