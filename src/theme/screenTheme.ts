import { colors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";

const c = colors.dark;

export const screenTheme = {
  colors: {
    background: c.background,
    backgroundSoft: c.backgroundSoft,
    surface: c.surface,
    surfaceSoft: c.surfaceSoft,
    card: c.card,
    cardSoft: c.cardSoft,
    border: c.border,
    borderStrong: c.goldDeep,
    text: c.text,
    textMuted: c.textMuted,
    textSubtle: c.textSubtle,
    gold: c.gold,
    goldSoft: c.goldSoft,
    goldDeep: c.goldDeep,
    success: c.success,
    warning: c.warning,
    error: c.error,
    danger: c.error,
    info: c.info,
    white: c.text,
    black: "#0E1424",
    overlay: c.overlay,
    transparent: c.transparent,
  },
  spacing,
  radius,
  typography,
} as const;

export type ScreenTheme = typeof screenTheme;
