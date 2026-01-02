export const colors = {
  // Primary palette from visual identity
  primary: '#C4A574',        // Golden/caramel brown
  primaryDark: '#A89060',    // Darker mustard/olive
  primaryLight: '#D4C4A0',   // Lighter tan accent

  // Background colors
  background: '#F5EDE6',     // Soft cream/beige
  surface: '#FFFFFF',        // White cards
  surfaceVariant: '#FAF6F2', // Slightly off-white

  // Text colors
  text: '#3D3D3D',           // Dark gray for primary text
  textSecondary: '#6B6B6B',  // Medium gray for secondary text
  textLight: '#9B9B9B',      // Light gray for hints
  textOnPrimary: '#FFFFFF',  // White text on primary color

  // Status colors
  success: '#7CB342',        // Green for success states
  warning: '#FFB74D',        // Orange for warnings
  error: '#E57373',          // Red for errors
  info: '#64B5F6',           // Blue for info

  // Border colors
  border: '#E0D8D0',         // Light border
  borderDark: '#C4B8A8',     // Darker border

  // Misc
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};
