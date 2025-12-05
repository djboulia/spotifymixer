import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AlertInfo } from "~/components/base/AlertInfo";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Alert",
  component: AlertInfo,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    message: { control: "text" },
  },
} satisfies Meta<typeof AlertInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Info: Story = {
  args: {
    message: `This is an informational alert`,
  },
};
