import type { Config } from 'tailwindcss';
import preset from '@threadly/config/tailwind-preset';

const config: Config = {
  presets: [preset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/themes/src/**/*.{ts,tsx}',
  ],
};

export default config;
