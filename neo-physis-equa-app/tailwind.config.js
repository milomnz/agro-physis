/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
theme: {
  extend: {
    colors: {
      // Paleta del manual de marca (Documento de visión, "Paleta y uso permitido")
      'tinta': '#0F2A38',       // Texto principal, fondos del alto contraste (13.3:1 sobre Crema)
      'azul': '#17506B',        // Primario: botones, encabezado, bordes interactivos (7.8:1)
      'crema': '#F5F2EA',       // Fondo de pantallas y tarjetas
      'teal': '#1E8C8C',        // Solo texto en negrita o grande (3.6:1)
      'tierra': '#9C6B3F',      // Íconos y texto grande, acento cálido (4.1:1)
      'verde': '#5FB548',       // Solo relleno con texto Tinta (5.8:1)
      'lima': '#B5D84A',        // Solo relleno con texto Tinta (9.2:1) o decoración
      // Alertas: tintes de la paleta sobre Crema, texto Tinta (>= 11:1)
      'exito-bg': '#E3EBD7',
      'alerta-bg': '#E8EDCA',
      'error-bg': '#E8DED0',
      // Nombres anteriores conservados como alias
      'noche': '#0F2A38',
      'turquesa': '#17506B',
      'accent': '#6B979A',
    },
    borderRadius: {
      'campo': '12px',
      'boton': '16px',
      'tarjeta': '24px',
      'chip': '9999px',
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
    }
  }
},
  plugins: [],
};
