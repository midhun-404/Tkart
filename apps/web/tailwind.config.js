/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F172A', // Navy Blue
                secondary: '#334155', // Slate
                accent: '#F59E0B', // Vibrant Orange
                background: '#F1F5F9', // Light Slate
                dark: '#020617',
                light: '#ffffff'
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
