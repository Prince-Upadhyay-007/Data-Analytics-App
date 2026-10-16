/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui"],
      },
      colors: {
        pulse: {
          50: "#eef8ff",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          900: "#0b1b33",
        },
      },
      boxShadow: {
        card: "0 18px 40px -24px rgba(14, 165, 233, 0.45)",
      },
    },
  },
  plugins: [],
};
