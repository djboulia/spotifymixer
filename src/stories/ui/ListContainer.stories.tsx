import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ListContainer } from "~/components/base/ListContainer";
import { ListHeader } from "~/components/base/ListHeader";
import { Title } from "~/components/base/Title";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/ListContainer",
  component: ListContainer,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    header: { control: "object" },
    children: { control: "object" },
  },
} satisfies Meta<typeof ListContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const WithoutHeader: Story = {
  args: {
    children: <div>This is a list container with no header</div>,
  },
};

export const WithHeader: Story = {
  args: {
    header: (
      <ListHeader>
        <Title>This is a header with a Title component</Title>
      </ListHeader>
    ),
    children: <div>This is the content of the list container</div>,
  },
};
