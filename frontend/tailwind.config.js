/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ramadan: {
                    blue: '#0F172A', // Midnight blue
                    gold: '#FACC15', // Vibrant gold
                    accent: '#1E293B'
                }
            }
        },
    },
    plugins: [],
}
