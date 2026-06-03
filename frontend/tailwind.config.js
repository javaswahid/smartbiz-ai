/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6', // Tailwind blue
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dark: {
          bg: '#0f172a',    // slate-900
          card: '#1e293b',  // slate-800
          border: '#334155',// slate-700
          text: '#f8fafc',  // slate-50
          muted: '#94a3b8'  // slate-400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
