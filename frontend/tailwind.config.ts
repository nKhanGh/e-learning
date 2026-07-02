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
                bg: '#F7F4ED',
                surface: '#EFEAE0',
                card: '#E7E3DA',
                primary: '#8A7A64',
                secondary: '#C8BDAA',
                accent: '#A89574',
                text: '#3B3328',
                muted: '#7B6F60',
                border: '#D6CEC0',
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
