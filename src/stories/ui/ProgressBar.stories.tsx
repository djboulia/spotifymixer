import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProgressBar } from "~/components/ui/ProgressBar";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/ProgressBar",
  component: ProgressBar,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    percentComplete: { control: "number" },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Zero: Story = {
  args: {
    percentComplete: 0,
  },
};

export const Half: Story = {
  args: {
    percentComplete: 50,
  },
};

export const Complete: Story = {
  args: {
    percentComplete: 100,
  },
};

export const Undefined: Story = {
  args: {
    percentComplete: undefined,
  },
};
