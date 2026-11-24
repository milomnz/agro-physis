// Tokens de diseño Agro Physis ("biofilia funcional", Documento de visión).
// colors.json es la única fuente de los hex: Tailwind los expone como clases (bg-azul,
// text-tinta…) y este archivo los entrega a props nativas y degradados.
import palette from './colors.json';

export const colors = palette;

/** Hex + alfa (0–1) → #RRGGBBAA. Los degradados se desvanecen al mismo tono, sin franja gris. */
const alpha = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')}`;

// Cadenas CSS para `style.backgroundImage` (RN 0.88 y web las dibujan sin librerías).
// Contraste medido en el punto más desfavorable de cada degradado: ver ESTILOS.md.
export const gradients = {
  /** Fondo de pantalla: crema → salvia → bruma, con brotes de lima y teal en esquinas opuestas. */
  backdrop: [
    `radial-gradient(circle at 100% 0%, ${alpha(colors.lima, 0.22)} 0%, ${alpha(colors.lima, 0)} 35%)`,
    `radial-gradient(circle at 0% 100%, ${alpha(colors.teal, 0.12)} 0%, ${alpha(colors.teal, 0)} 40%)`,
    `linear-gradient(180deg, ${colors.crema} 0%, ${colors.salvia} 55%, ${colors.bruma} 100%)`,
  ].join(', '),
  /** Fondo en alto contraste: Tinta → Abismo; Crema conserva ≥ 11:1. */
  backdropHc: [
    `radial-gradient(circle at 100% 0%, ${alpha(colors.lima, 0.1)} 0%, ${alpha(colors.lima, 0)} 35%)`,
    `linear-gradient(180deg, ${colors.tinta} 0%, ${colors.abismo} 100%)`,
  ].join(', '),
  /** Encabezados y héroes: texto Crema ≥ 4.9:1 incluso sobre el brote de lima. */
  brand: [
    `radial-gradient(circle at 100% 100%, ${alpha(colors.lima, 0.25)} 0%, ${alpha(colors.lima, 0)} 45%)`,
    `linear-gradient(135deg, ${colors.tinta} 0%, ${colors.azul} 100%)`,
  ].join(', '),
  /** Botón primario: donde cae el texto Crema el contraste es ≥ 6:1. */
  action: `linear-gradient(135deg, ${colors.teal} 0%, ${colors.azul} 45%, ${colors.tinta} 100%)`,
  /** Botón primario en alto contraste: texto Tinta ≥ 9.2:1. */
  actionHc: `linear-gradient(135deg, ${colors.lima} 0%, ${colors.crema} 60%)`,
  /** Hoja: medallones y selección activa, siempre con Tinta encima (≥ 5.8:1). */
  leaf: `linear-gradient(135deg, ${colors.lima} 0%, ${colors.verde} 100%)`,
} as const;

export const radius = {
  campo: 12,
  boton: 16,
  tarjeta: 24,
} as const;

/** Familias cargadas en app/_layout.tsx, para props nativas (headerTitleStyle). */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  body: 'Inter_400Regular',
  bodySemibold: 'Inter_600SemiBold',
} as const;

/**
 * Escala tipográfica. Bricolage para títulos y acciones, Inter para cuerpo,
 * JetBrains Mono para cifras. El color lo pone la paleta (palette.title, palette.sub…).
 */
export const type = {
  display: 'text-3xl font-bricolage',
  title: 'text-2xl font-bricolage',
  heading: 'text-xl font-bricolage',
  subheading: 'text-lg font-inter-semibold',
  body: 'text-base font-inter',
  caption: 'text-sm font-inter',
  label: 'text-base font-inter-semibold',
  data: 'text-sm font-mono-medium',
} as const;

/** Margen lateral de las pantallas, para contentContainerStyle. */
export const space = {
  gutter: 24,
} as const;

/** Transición entre pantallas: corta, y desactivada si el sistema pide reducir movimiento. */
export const motion = {
  screenMs: 220,
} as const;
