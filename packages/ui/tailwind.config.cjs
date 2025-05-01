import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../apps/dashboard/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/components/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "ui-",
  plugins: [tailwindcssAnimate],
};

export default config;
