import { ActivityCategory } from '../types';

export const colors = {
  background: '#FAF6EE',
  surface: '#FFFFFF',
  primary: '#C4714A',
  primaryLight: '#F5E6DE',
  secondary: '#7D9B76',
  secondaryLight: '#E5EDE4',
  accent: '#E8B84B',
  accentLight: '#FDF3DA',
  textDark: '#2C1810',
  textMedium: '#6B4C3B',
  textLight: '#A08070',
  border: '#E8DDD3',
  error: '#D44533',
  white: '#FFFFFF',
  shadow: 'rgba(44, 24, 16, 0.08)',
};

export const categoryGradients: Record<ActivityCategory, [string, string]> = {
  'practical-life': ['#C4714A', '#E8956A'],
  'sensorial':      ['#9B6B9B', '#C49BC4'],
  'language':       ['#4A8FAA', '#72B5CE'],
  'mathematics':    ['#5B8A5B', '#82B082'],
  'art':            ['#E8824A', '#F5AA7A'],
  'science':        ['#4A7BAA', '#6FA3CE'],
  'music-movement': ['#D4615A', '#E89590'],
  'outdoor':        ['#7D9B76', '#A8C8A2'],
};

export const categoryColors: Record<ActivityCategory, string> = {
  'practical-life': '#C4714A',
  'sensorial': '#9B6B9B',
  'language': '#4A8FAA',
  'mathematics': '#5B8A5B',
  'art': '#E8824A',
  'science': '#4A7BAA',
  'music-movement': '#D4615A',
  'outdoor': '#7D9B76',
};

export const categoryEmojis: Record<ActivityCategory, string> = {
  'practical-life': '🧹',
  'sensorial': '👃',
  'language': '📚',
  'mathematics': '🔢',
  'art': '🎨',
  'science': '🔬',
  'music-movement': '🎵',
  'outdoor': '🌿',
};

export const categoryLabels: Record<ActivityCategory, string> = {
  'practical-life': 'Practical Life',
  'sensorial': 'Sensorial',
  'language': 'Language',
  'mathematics': 'Mathematics',
  'art': 'Art & Creativity',
  'science': 'Science & Nature',
  'music-movement': 'Music & Movement',
  'outdoor': 'Outdoor',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 100,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: colors.textDark },
  h2: { fontSize: 24, fontWeight: '700' as const, color: colors.textDark },
  h3: { fontSize: 20, fontWeight: '600' as const, color: colors.textDark },
  h4: { fontSize: 17, fontWeight: '600' as const, color: colors.textDark },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textMedium },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textLight },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textLight },
};
