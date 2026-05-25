export const colors = {
  dark: {
    background: "#070B12",
    backgroundSoft: "#0D141E",
    surface: "#101722",
    surfaceSoft: "#151F2C",
    card: "#111A26",
    cardSoft: "#182331",
    border: "#223142",

    text: "#F3F7FC",
    textMuted: "#A7B4C5",
    textSubtle: "#6F7C8E",

    gold: "#D6E6F5",
    goldSoft: "#E7F1FA",
    goldDeep: "#8EA9C2",

    success: "#3DDC97",
    warning: "#B7C7D9",
    error: "#E74C3C",
    info: "#8FB7D9",

    overlay: "rgba(0,0,0,0.65)",
    transparent: "transparent",
  },

  light: {
    background: "#070B12",
    backgroundSoft: "#0D141E",
    surface: "#101722",
    surfaceSoft: "#151F2C",
    card: "#111A26",
    cardSoft: "#182331",
    border: "#223142",

    text: "#F3F7FC",
    textMuted: "#A7B4C5",
    textSubtle: "#6F7C8E",

    gold: "#D6E6F5",
    goldSoft: "#E7F1FA",
    goldDeep: "#8EA9C2",

    success: "#3DDC97",
    warning: "#B7C7D9",
    error: "#E74C3C",
    info: "#8FB7D9",

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


