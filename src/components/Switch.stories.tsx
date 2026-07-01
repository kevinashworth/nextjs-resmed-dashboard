import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import Switch from "./Switch";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Switch,
  args: { label: "label", onChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [{ checked }, updateArgs] = useArgs();

    function onChange(checked: boolean) {
      updateArgs({ checked });
    }

    return <Switch {...args} onChange={onChange} checked={checked} />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
