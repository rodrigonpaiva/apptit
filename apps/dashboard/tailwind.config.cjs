/** @type {import('tailwindcss').Config} */
const config = require("@repo/tailwind-config/tailwindConfig");

module.exports = {
  ...config,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
};
