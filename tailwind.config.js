/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-beige': '#EED9B9',
        'brand-brown': '#8C5A3C',
        'brand-blue': '#003049',
        'primary': '#003049',
        'secondary': '#8C5A3C',
        'accent': '#EED9B9',
      },
    },
  },
  plugins: [],
}
