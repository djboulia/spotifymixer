import type { Preview } from "@storybook/nextjs-vite";
import { themes } from "storybook/theming";
import "~/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    darkMode: {
      // Override the default dark theme
      dark: { ...themes.dark, appBg: "black" },
      // Override the default light theme
      light: { ...themes.normal, appBg: "red" },
    },
  },
};

export default preview;
