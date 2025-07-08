/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../packages/tailwind/tailwind.preset')],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};