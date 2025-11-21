/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ehtpGreen: "#4b6b22",      // vert du bouton
        ehtpLightGreen: "#DFECC6",
      },
    },
  },
  plugins: [],
};
