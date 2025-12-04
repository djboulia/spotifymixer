import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Alert } from "~/components/ui/Alert";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Alert",
  component: Alert,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    message: { control: "text" },
    severity: { control: "select", options: ["info", "error"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Info: Story = {
  args: {
    severity: "info",
    message: `This is an informational alert`,
  },
};

export const Error: Story = {
  args: {
    severity: "error",
    message: "This is an error alert",
  },
};
