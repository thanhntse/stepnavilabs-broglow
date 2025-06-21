import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0C4DA2',
          darkblue: '#083A7D',
          lightblue: '#2E7DD1',
          pastel: '#EBF2FC',
        }
      },
    },
  },
  plugins: [],
};

export default config;
