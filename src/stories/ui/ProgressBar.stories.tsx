import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Progress } from "~/components/ui/progress";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/ProgressBar",
  component: Progress,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    value: { control: "number" },
    className: { control: "text" },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Zero: Story = {
  args: {
    value: 0,
    className: "w-20",
  },
};

export const Half: Story = {
  args: {
    value: 50,
    className: "w-20",
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    className: "w-20",
  },
};

export const Undefined: Story = {
  args: {
    value: undefined,
    className: "w-20",
  },
};
