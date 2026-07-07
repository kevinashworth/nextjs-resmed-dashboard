import { Select } from "./Select";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: Select,
  args: {
    children: (
      <>
        <option value="options" disabled>
          Select 1 thru 3
        </option>
        <option value="option1">Option 1</option>
        <option value="option2" selected>
          Option 2
        </option>
        <option value="option3">Option 3</option>
      </>
    ),
    // id: "storybook-select",
    // name: "Choose an option",
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
