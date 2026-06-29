import DisplayJson from "./DisplayJSON";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: DisplayJson,
} satisfies Meta<typeof DisplayJson>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    json: "json",
  },
};

export const ComplexObject: Story = {
  args: {
    json: {
      name: "John Doe",
      id: 12345,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345",
      },
      hobbies: ["reading", "traveling", "cooking"],
      nested: {
        level1: {
          level2: {
            level3: {
              key: "value",
            },
          },
        },
      },
    },
  },
};

export const ConsoleLog: Story = {
  args: {
    json: { message: "This will be logged to the console" },
    consoleLog: true,
    consoleTitle: "Custom Console Title",
  },
};
