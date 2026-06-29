import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import SegmentedToggle from "./SegmentedToggle";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: SegmentedToggle,
  args: { onChange: fn() },
  tags: ["!autodocs"],
} satisfies Meta<typeof SegmentedToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Toggle: Story = {
  args: {
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
    value: "option1",
  },
  render: (args) => {
    const [{ value }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ value: value === "option1" ? "option2" : "option1" });
    }

    return <SegmentedToggle {...args} onChange={onChange} value={value} />;
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { label: "Disabled 1", value: "disabled1" },
      { label: "Disabled 2", value: "disabled2" },
    ],
    value: "disabled1",
    disabled: true,
  },
};
