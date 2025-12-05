import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ListHeader } from "~/components/ui/ListHeader";
import { Title } from "~/components/ui/Title";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/ListHeader",
  component: ListHeader,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
} satisfies Meta<typeof ListHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Header: Story = {
  args: {
    children: <div>This is a header with no additional styling</div>,
  },
};

export const HeaderTitle: Story = {
  args: {
    children: <Title>This is a header with a Title component</Title>,
  },
};
