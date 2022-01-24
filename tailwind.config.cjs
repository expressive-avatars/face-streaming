/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,jsx}'],
  theme: {
    fontFamily: {
      sans: 'Poppins, sans-serif',
    },
    extend: {
      colors: {
        'hubs-gray': '#868686',
        'hubs-blue': '#007AB8',
        'hubs-lightblue': '#008BD1',
      },
    },
  },
  plugins: [],
}
