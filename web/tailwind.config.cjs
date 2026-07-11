const uiPreset = require("../../ui/tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...uiPreset,
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../ui/src/**/*.{ts,tsx}",
  ],
};
