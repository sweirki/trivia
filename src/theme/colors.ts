export const colors = {
  dark: {
    background: "#0B1020",
    backgroundSoft: "#0F172A",
    surface: "#121A2D",
    surfaceSoft: "#17213A",
    card: "#151E33",
    cardSoft: "#1A2540",
    border: "#2B395C",

    text: "#F8FAFC",
    textMuted: "#A8B3C7",
    textSubtle: "#748098",

    gold: "#F5C451",
    goldSoft: "#FFD978",
    goldDeep: "#B9922E",

    success: "#3DDC97",
    warning: "#F5C451",
    error: "#E74C3C",
    info: "#6EA8FE",

    overlay: "rgba(0,0,0,0.65)",
    transparent: "transparent",
  },

  light: {
    background: "#0B1020",
    backgroundSoft: "#0F172A",
    surface: "#121A2D",
    surfaceSoft: "#17213A",
    card: "#151E33",
    cardSoft: "#1A2540",
    border: "#2B395C",

    text: "#F8FAFC",
    textMuted: "#A8B3C7",
    textSubtle: "#748098",

    gold: "#F5C451",
    goldSoft: "#FFD978",
    goldDeep: "#B9922E",

    success: "#3DDC97",
    warning: "#F5C451",
    error: "#E74C3C",
    info: "#6EA8FE",

    overlay: "rgba(0,0,0,0.65)",
    transparent: "transparent",
  },
} as const;

export type ColorSchemeName = keyof typeof colors;
export type ThemeColors = {
  background: string;
  backgroundSoft: string;
  surface: string;
  surfaceSoft: string;
  card: string;
  cardSoft: string;
  border: string;

  text: string;
  textMuted: string;
  textSubtle: string;

  gold: string;
  goldSoft: string;
  goldDeep: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  overlay: string;
  transparent: string;
};
