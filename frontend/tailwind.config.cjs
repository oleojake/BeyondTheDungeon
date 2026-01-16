/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // D&D Themed colors
        primary: {
          DEFAULT: "#8B4513", // Saddle Brown (D&D leather)
          light: "#A0522D",
          dark: "#654321",
        },
        secondary: {
          DEFAULT: "#2F7D3E", // Forest Green
          light: "#48A15C",
          dark: "#1F5429",
        },
        accent: {
          DEFAULT: "#D4AF37", // Gold (treasure)
          light: "#E6C84A",
          dark: "#B8941F",
        },
        // Dark theme (parchment and dungeon)
        dark: {
          DEFAULT: "#1A1410", // Dark dungeon stone
          lighter: "#2C2419", // Lighter stone
          card: "#231C15", // Card backgrounds
          border: "#3D3128", // Borders
        },
        // Functional colors
        success: "#2F7D3E",
        warning: "#D4AF37",
        error: "#8B2E2E",
      },
    },
  },
  plugins: [],
};
