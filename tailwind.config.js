/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Premium Minimalist Dark
                dark: {
                    DEFAULT: '#000000',
                    50: '#0a0a0a',
                    100: '#111111',
                    200: '#1a1a1a',
                    300: '#222222',
                    400: '#333333',
                    500: '#444444',
                },
                accent: {
                    DEFAULT: '#fbbf24', // Amber 400
                    hover: '#f59e0b',   // Amber 500
                    subtle: 'rgba(251, 191, 36, 0.1)',
                },
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'premium': '0 20px 50px rgba(0, 0, 0, 0.5)',
                'glow': '0 0 15px rgba(251, 191, 36, 0.2)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
