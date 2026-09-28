/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ampere: {
          red: "#F64335",
          "red-dark": "#D93429",
          black: "#111111",
          charcoal: "#1C1C1C",
          graphite: "#2B2B2B",
          surface: "#F6F6F4",
          line: "#D9D9D6",
          muted: "#6B6B67",
        },
      },
    },
  },
  plugins: [],
};
