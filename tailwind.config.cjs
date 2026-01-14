/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Main brand colors
        primary: {
          DEFAULT: "#8B5CF6", // Purple
          light: "#A78BFA",
          dark: "#7C3AED",
        },
        secondary: {
          DEFAULT: "#3B82F6", // Blue
          light: "#60A5FA",
          dark: "#2563EB",
        },
        accent: {
          DEFAULT: "#EC4899", // Pink/Magenta
          light: "#F472B6",
          dark: "#DB2777",
        },
        // Dark theme
        dark: {
          DEFAULT: "#0F172A", // Slate-900
          lighter: "#1E293B", // Slate-800
          card: "#1E293B", // Card backgrounds
          border: "#334155", // Borders
        },
        // Functional colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
    },
  },
  plugins: [],
};
