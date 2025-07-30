/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors:{
        'green-400': '#48bb78',
        'green-700': '#2f855a',
        'green-900': '#1a4731',
        'gray-300': '#d1d5db',
        'gray-400': '#9ca3af',
        'gray-700': '#374151',
        'gray-800': '#1f2937',
        'yellow-400': '#fbbf24',
        'yellow-500': '#f59e0b',
        
      }
    },
  },
  plugins: [],
}

