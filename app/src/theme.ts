/**
 * Identidad visual de Coders Free (lienzo "Identidad visual", sección 05 · En la app).
 * Las pantallas usan solo estos valores; nunca colores, tamaños ni espacios sueltos.
 */

export const colors = {
  night: '#0B1A23',
  cyan: '#22D3EE',
  cyanLight: '#67E8F9',
  orange: '#FF8A3D',
  snow: '#F2F7F8',
  green: '#3DDC84',
  red: '#FF4D6D',
  surface: '#0F222D',
  surfaceRaised: '#11242F',
  border: '#1E3644',
  borderStrong: '#2A4656',
  grid: 'rgba(26, 48, 60, 0.4)',
  textSecondary: '#B8C7CF',
  textMuted: '#9FB3BE',
  label: '#D5E0E5',
  overlay: 'rgba(4, 10, 14, 0.72)',
} as const;

export const fonts = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  heading: 'PlusJakartaSans_800ExtraBold',
  headingBold: 'PlusJakartaSans_700Bold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const fontSizes = {
  label: 12,
  small: 13,
  body: 15,
  paragraph: 16,
  card: 18,
  subtitle: 20,
  title: 28,
  avatar: 40,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 16,
} as const;

export const radii = {
  chip: 8,
  control: 12,
  card: 16,
  sheet: 24,
  round: 999,
} as const;

export const sizes = {
  control: 52,
  touch: 48,
  header: 64,
  tabBar: 72,
  avatar: 120,
  avatarBadge: 40,
  preview: 280,
  icon: 24,
} as const;

export const letterSpacing = {
  label: 1.7,
} as const;
