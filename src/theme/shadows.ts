import type { ViewStyle } from "react-native";

export const shadows = {
  none: {} satisfies ViewStyle,

  sm: {
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } satisfies ViewStyle,

  md: {
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  } satisfies ViewStyle,

  lg: {
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  } satisfies ViewStyle,
} as const;

export type ThemeShadows = typeof shadows;



