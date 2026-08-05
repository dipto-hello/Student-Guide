import type { Preview } from '@storybook/react-vite';
import '../client/src/index.css';

/**
 * The app's design tokens are defined under a `.dark` class on <html>, so the
 * backgrounds toolbar has to toggle that class rather than just swap a canvas
 * colour — otherwise dark-mode stories render light tokens on a dark canvas.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: 'oklch(0.13 0.028 261.692)' },
        light: { name: 'Light', value: '#ffffff' },
      },
    },
  },

  initialGlobals: {
    backgrounds: { value: 'dark' },
  },

  decorators: [
    (Story, context) => {
      const isDark = context.globals.backgrounds?.value !== 'light';
      document.documentElement.classList.toggle('dark', isDark);
      return Story();
    },
  ],
};

export default preview;
