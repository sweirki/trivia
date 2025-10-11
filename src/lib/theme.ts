import { StyleSheet } from 'react-native';

//
//  Mega-Wow-Trivia Theme
// Centralized styles & constants
//

// Neon palette
export const colors = {
  primary: '#6B3FA0',   // Neon Purple
  secondary: '#00BFFF', // Neon Blue
  background: '#0A0A0F', // Deep Midnight
  text: '#FFFFFF',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFC107',
};

// Typography
export const fonts = {
  heading: 'System',
  body: 'System',
  mono: 'monospace',
};

// Spacing & sizes
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
};

// Common reusable styles
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  text: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  heading: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1A1A24',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
});

// ✅ Add this at the very bottom:
export const theme = {
  colors,
  fonts,
  spacing,
  radius,
  common,
};
