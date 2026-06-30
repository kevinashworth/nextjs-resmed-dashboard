import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

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
  play: async function ({ canvas, step, userEvent }) {
    await step("Clicking on the A option", async () => {
      const optionA = canvas.getByRole("radio", { name: "Option 1" });
      await userEvent.click(optionA);
      await expect(optionA).toHaveAttribute("aria-checked", "true");
    });

    await step("Clicking on the B option", async () => {
      const optionB = canvas.getByRole("radio", { name: "Option 2" });
      await userEvent.click(optionB);
      await expect(optionB).toHaveAttribute("aria-checked", "true");

      // to avoid leaving SegmentedToggle with optionB selected and its ring visible, click on body to remove focus from SegmentedToggle
      await userEvent.pointer({ target: document.body, keys: "[MouseLeft]" });
    });
  },
  render: (args) => {
    const [{ value }, updateArgs] = useArgs();

    function onChange(nextValue: string) {
      args.onChange?.(nextValue);
      updateArgs({ value: nextValue });
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
  play: async function ({ canvas, step }) {
    await step("Disabled A option", async () => {
      const optionA = canvas.getByRole("radio", { name: "Disabled 1" });
      await expect(optionA).toBeDisabled();
    });

    await step("Disabled B option", async () => {
      const optionB = canvas.getByRole("radio", { name: "Disabled 2" });
      await expect(optionB).toBeDisabled();
    });
  },
};

export const InvalidValue: Story = {
  args: {
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
    value: "invalid-value",
  },
  play: async function ({ canvas, step }) {
    await step("disables both options when value is invalid", async () => {
      const optionA = canvas.getByRole("radio", { name: "Option 1" });
      expect(optionA).toBeDisabled();
      const optionB = canvas.getByRole("radio", { name: "Option 2" });
      expect(optionB).toBeDisabled();
    });
  },
};
