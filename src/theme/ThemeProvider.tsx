import React, { createContext, useContext, useMemo } from "react";
import {
  Text as RNText,
  View as RNView,
  useColorScheme,
} from "react-native";

const gold = "#D8B24A";
const goldSoft = "#FBE7A1";
const black = "#000000";
const dark = "#0E0E0E";
const white = "#FFFFFF";

type Theme = {
  scheme: "light" | "dark";
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textMuted: string;
    gold: string;
    goldSoft: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: any;
    h2: any;
    h3: any;
    glowTitle: any;
    body: any;
    small: any;
  };
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() ?? "dark";
  const isLight = scheme === "light";

  const theme: Theme = useMemo(() => {
    return {
      scheme,
      colors: {
        background: isLight ? white : black,
        surface: isLight ? "#f4f4f4" : dark,
        card: isLight ? "#ffffff" : "#1A1A1A",
        text: isLight ? "#111" : "#fff",
        textMuted: isLight ? "#555" : "#999",
        gold,
        goldSoft,
        border: isLight ? "#ddd" : "#333",
      },

      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },

      typography: {
        h1: { fontSize: 32, fontWeight: "800", color: gold },
        h2: { fontSize: 24, fontWeight: "700", color: gold },
        h3: { fontSize: 18, fontWeight: "600", color: goldSoft },

        glowTitle: {
          fontSize: 32,
          fontWeight: "900",
          color: gold,
          textShadowColor: gold,
          textShadowRadius: 12,
        },

        body: { fontSize: 16, color: isLight ? "#111" : "#eee" },
        small: { fontSize: 13, color: isLight ? "#444" : "#aaa" },
      },
    };
  }, [scheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function Text(props: any) {
  const theme = useTheme();
  return (
    <RNText {...props} style={[{ color: theme.colors.text }, props.style]} />
  );
}

export function View(props: any) {
  const theme = useTheme();
  return (
    <RNView
      {...props}
      style={[
        { backgroundColor: props.transparent ? "transparent" : theme.colors.background },
        props.style,
      ]}
    />
  );
}
export default ThemeProvider;


