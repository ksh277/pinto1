import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pinto: {
          primary: "#F472B6",
          soft: "#F9E8EE",
          accent: "#D3A9FF",
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
