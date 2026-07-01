import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Switch } from "./Switch";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultChecked: false,
    label: "label",
    onChange: fn(),
  },
  render: (args) => {
    const [{ defaultChecked }, updateArgs] = useArgs();

    function onChange(checked: boolean) {
      updateArgs({ defaultChecked: checked });
    }

    return <Switch {...args} onChange={onChange} defaultChecked={defaultChecked} />;
  },
};
