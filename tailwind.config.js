/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["views/**/*.ejs", "./views/templates/*.ejs"],
  theme: {
    extend: {
      colors: {
        "theme-bg-color": "#FFD6FF",
        "theme-hf-color": "#C8B6FF",
        "theme-button-color": "#B8C0FF",
        "theme-extra-color1": "#E7C6FF",
        "theme-extra-color2": "#BBD0FF",
      },
    },
  },
  plugins: [],
};
