import React, { createContext, useContext, useMemo } from "react";
import {
  Text as RNText,
  View as RNView,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { colors, type ThemeColors } from "./colors";
import { radius, type ThemeRadius } from "./radius";
import { shadows, type ThemeShadows } from "./shadows";
import { spacing, type ThemeSpacing } from "./spacing";
import { typography, type ThemeTypography } from "./typography";

export type Theme = {
  scheme: "dark";
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  typography: Record<keyof ThemeTypography, TextStyle> & {
    glowTitle: TextStyle;
  };
};

export const ThemeContext = createContext<Theme | null>(null);

function buildTypography(themeColors: ThemeColors): Theme["typography"] {
  return {
    ...typography,

    hero: { ...typography.hero, color: themeColors.gold },
    display: { ...typography.display, color: themeColors.gold },
    h1: { ...typography.h1, color: themeColors.gold },
    h2: { ...typography.h2, color: themeColors.goldSoft },
    h3: { ...typography.h3, color: themeColors.text },
    body: { ...typography.body, color: themeColors.text },
    bodyStrong: { ...typography.bodyStrong, color: themeColors.text },
    bodySmall: { ...typography.bodySmall, color: themeColors.textMuted },
    small: { ...typography.small, color: themeColors.textMuted },
    caption: { ...typography.caption, color: themeColors.textSubtle },
    micro: { ...typography.micro, color: themeColors.textSubtle },

    glowTitle: {
      ...typography.hero,
      fontWeight: "900",
      color: themeColors.gold,
      textShadowColor: themeColors.gold,
      textShadowRadius: 12,
    } as TextStyle,
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo((): Theme => {
    const themeColors = colors.dark;

    return {
      scheme: "dark",
      colors: themeColors,
      spacing,
      radius,
      shadows,
      typography: buildTypography(themeColors),
    };
  }, []);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return ctx;
}

type AppTextProps = TextProps & {
  variant?: keyof Theme["typography"];
  muted?: boolean;
  gold?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Text({
  variant = "body",
  muted = false,
  gold = false,
  style,
  ...props
}: AppTextProps) {
  const theme = useTheme();

  return (
    <RNText
      {...props}
      style={[
        theme.typography[variant],
        muted && { color: theme.colors.textMuted },
        gold && { color: theme.colors.gold },
        style,
      ]}
    />
  );
}

type AppViewProps = ViewProps & {
  transparent?: boolean;
  surface?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function View({ transparent, surface, style, ...props }: AppViewProps) {
  const theme = useTheme();

  return (
    <RNView
      {...props}
      style={[
        {
          backgroundColor: transparent
            ? theme.colors.transparent
            : surface
              ? theme.colors.surface
              : theme.colors.background,
        },
        style,
      ]}
    />
  );
}

export default ThemeProvider;


