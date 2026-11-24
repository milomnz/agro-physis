import { colors, gradients } from './tokens';

/**
 * Roles semánticos de color. Las pantallas piden un papel (title, card…), nunca un hex,
 * y el modo alto contraste cambia todos a la vez.
 */
export interface AppPalette {
  // Clases NativeWind
  card: string;
  title: string;
  body: string;
  sub: string;
  faint: string;
  divider: string;
  input: string;
  inputBorder: string;
  inputFocus: string;
  fieldErrorBorder: string;
  errorBanner: string;
  successBanner: string;
  warningBanner: string;
  bannerText: string;
  // Valores para props nativas
  canvas: string;
  backdrop: string;
  icon: string;
  iconStrong: string;
  iconError: string;
  iconSuccess: string;
  iconWarning: string;
  placeholder: string;
  spinner: string;
}

const light: AppPalette = {
  card: 'bg-papel border border-azul/25',
  title: 'text-tinta',
  body: 'text-tinta',
  sub: 'text-azul',
  faint: 'text-liquen',
  divider: 'bg-azul/15',
  input: 'bg-papel',
  inputBorder: 'border-azul',
  inputFocus: 'border-tinta',
  fieldErrorBorder: 'border-tierra',
  errorBanner: 'bg-error-bg border-2 border-tierra',
  successBanner: 'bg-exito-bg border-2 border-verde',
  warningBanner: 'bg-alerta-bg border-2 border-lima',
  bannerText: 'text-tinta',
  canvas: colors.crema,
  backdrop: gradients.backdrop,
  icon: colors.azul,
  iconStrong: colors.tinta,
  iconError: colors.tinta,
  iconSuccess: colors.tinta,
  iconWarning: colors.tinta,
  placeholder: colors.liquen,
  spinner: colors.azul,
};

const highContrast: AppPalette = {
  card: 'bg-azul border-2 border-crema',
  title: 'text-crema',
  body: 'text-crema',
  sub: 'text-crema/80',
  faint: 'text-crema/80',
  divider: 'bg-crema/30',
  input: 'bg-tinta',
  inputBorder: 'border-crema',
  inputFocus: 'border-lima',
  fieldErrorBorder: 'border-tierra',
  errorBanner: 'bg-tinta border-2 border-tierra',
  successBanner: 'bg-tinta border-2 border-verde',
  warningBanner: 'bg-tinta border-2 border-lima',
  bannerText: 'text-crema',
  canvas: colors.tinta,
  backdrop: gradients.backdropHc,
  icon: colors.crema,
  iconStrong: colors.crema,
  iconError: colors.crema,
  iconSuccess: colors.verde,
  iconWarning: colors.lima,
  placeholder: `${colors.crema}B3`,
  spinner: colors.crema,
};

export const buildPalette = (isHighContrast: boolean): AppPalette =>
  isHighContrast ? highContrast : light;
