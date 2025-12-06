import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SyncTracksSelect } from "~/components/sync/SyncTracksSelect";

const SyncTracksSelectStory = ({ value }: { value: number }) => {
  const [selectValue, setSelectValue] = useState(value);

  return (
    <SyncTracksSelect
      value={selectValue}
      onChange={(newValue) => {
        console.log("Tracks to Sync changed to: " + newValue);
        setSelectValue(newValue);
      }}
    />
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/SyncTracksSelect",
  component: SyncTracksSelectStory,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    value: { control: "number" },
  },
} satisfies Meta<typeof SyncTracksSelectStory>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const TrackSelect: Story = {
  args: {
    value: 250,
  },
};
