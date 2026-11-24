// Los colores salen de src/theme/colors.json, la misma fuente que usan las props nativas
// (src/theme/tokens.ts). Uso permitido de cada uno: ESTILOS.md.
const colors = require('./src/theme/colors.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      borderRadius: {
        campo: '12px',
        boton: '16px',
        tarjeta: '24px',
        chip: '9999px',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        inter: ['Inter_400Regular', 'sans-serif'],
        'inter-semibold': ['Inter_600SemiBold', 'sans-serif'],
        'inter-bold': ['Inter_700Bold', 'sans-serif'],
        bricolage: ['BricolageGrotesque_700Bold', 'sans-serif'],
        mono: ['JetBrainsMono_400Regular', 'monospace'],
        'mono-medium': ['JetBrainsMono_500Medium', 'monospace'],
        'mono-bold': ['JetBrainsMono_700Bold', 'monospace'],
      },
    },
  },
  plugins: [],
};
