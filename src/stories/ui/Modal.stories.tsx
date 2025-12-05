import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";

import { Modal } from "~/components/base/Modal";
import { ProgressBar } from "~/components/base/ProgressBar";

// wrap the modal so we can implement isOpen prop easily
const ModalWrapper = ({
  title,
  isOpen,
  children,
}: {
  title: string;
  isOpen: boolean;
  children?: React.ReactNode;
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(true);
  }, [isOpen]);

  return (
    <Modal isOpen={showModal} title={title} onClose={() => setShowModal(false)}>
      {children}
    </Modal>
  );
};

const ComplexBodyContent = () => {
  return (
    <div className="space-y-4">
      <p>
        This is an example of a more complex modal body, including a progress
        bar.
      </p>
      <ProgressBar percentComplete={70} />
      <p>Additional content can go here.</p>
    </div>
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Modal",
  component: ModalWrapper,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    title: { control: "text" },
    isOpen: { control: "boolean" },
  },
} satisfies Meta<typeof ModalWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const EmptyModal: Story = {
  args: {
    title: "This is a modal",
    isOpen: false,
  },
};

export const BasicModal: Story = {
  args: {
    title: "This is a modal",
    isOpen: false,
    children: <div>Here is some content for the actual modal</div>,
  },
};

export const LongTitle: Story = {
  args: {
    title: "This is a modal with a very, very, very long title at the top",
    isOpen: false,
    children: <div>Here is some content for the actual modal</div>,
  },
};

export const ComplexBody: Story = {
  args: {
    title: "This is a modal complex body props",
    isOpen: false,
    children: <ComplexBodyContent />,
  },
};
