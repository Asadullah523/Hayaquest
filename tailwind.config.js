/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    50: 'hsl(var(--primary) / 0.05)',
                    100: 'hsl(var(--primary) / 0.1)',
                    200: 'hsl(var(--primary) / 0.2)',
                    300: 'hsl(var(--primary) / 0.3)',
                    400: 'hsl(var(--primary) / 0.4)',
                    500: 'hsl(var(--primary) / 0.5)',
                    600: 'hsl(var(--primary) / 0.6)',
                    700: 'hsl(var(--primary) / 0.7)',
                    800: 'hsl(var(--primary) / 0.8)',
                    900: 'hsl(var(--primary) / 0.9)',
                },
                indigo: {
                    50: 'hsl(var(--primary) / 0.05)',
                    100: 'hsl(var(--primary) / 0.1)',
                    200: 'hsl(var(--primary) / 0.2)',
                    300: 'hsl(var(--primary) / 0.3)',
                    400: 'hsl(var(--primary) / 0.4)',
                    500: 'hsl(var(--primary) / 0.5)',
                    600: 'hsl(var(--primary) / 0.6)',
                    700: 'hsl(var(--primary) / 0.7)',
                    800: 'hsl(var(--primary) / 0.8)',
                    900: 'hsl(var(--primary) / 0.9)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Georgia', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in',
                'bounce': 'bounce 1s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
