import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageContainer } from "~/components/base/PageContainer";
import { ListContainer } from "~/components/base/ListContainer";
import { ListHeader } from "~/components/base/ListHeader";
import { Title } from "~/components/base/Title";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/PageContainer",
  component: PageContainer,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    title: { control: "text" },
    // children: { control: "object" },
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Basic: Story = {
  args: {
    title: "This is a page container with a title",
    children: <div>This is the content of the page container</div>,
  },
};

export const PageWithList: Story = {
  args: {
    title: "This is a page container with a content",
    children: (
      <ListContainer
        header={
          <ListHeader>
            <Title>This is a header with a Title component</Title>
          </ListHeader>
        }
      >
        This is the content of the list container
      </ListContainer>
    ),
  },
};
