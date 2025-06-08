/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // ✅ AGREGÁ ESTA LÍNEA
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        rojoEyl: '#c0392b'
      },
      boxShadow: {
        suave: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    },
  },
  plugins: [],
}
