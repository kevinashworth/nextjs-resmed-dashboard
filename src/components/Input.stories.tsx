import { expect } from "storybook/test";

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

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "hello");
    await expect(input).toHaveValue("hello");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
};

export const WithLabel: Story = {
  args: { name: "email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
  render: (args) => (
    <label className="flex w-72 flex-col gap-1 text-sm font-medium text-gray-700">
      Email
      <Input {...args} />
    </label>
  ),
  play: async ({ canvas }) => {
    // Wrapping the input in its label gives it an accessible name without an id.
    await expect(canvas.getByLabelText("Email")).toBeInTheDocument();
  },
};
