/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],

    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                bg: '#020617',
                surface: '#020617',
                card: '#020617',
                primary: '#3B82F6',
                secondary: '#22D3EE',
                accent: '#A78BFA',
                text: '#E5E7EB',
                muted: '#94A3B8',
                border: '#1E293B',
            },
            keyframes: {
                typing: {
                    '0%, 100%': {
                        transform: 'translateY(0)',
                        opacity: '0.4',
                    },
                    '50%': { transform: 'translateY(-4px)', opacity: '1' },
                },
            },
            animation: {
                typing: 'typing 1.2s infinite ease-in-out',
            },
        },
    },
    plugins: [],
};
