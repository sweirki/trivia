import type { TextStyle } from "react-native";

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
} as const;

export const fontSize = {
  hero: 32,
  display: 28,
  h1: 24,
  h2: 20,
  h3: 18,
  body: 15,
  bodySmall: 13,
  caption: 12,
  micro: 11,
} as const;

export const lineHeight = {
  hero: 38,
  display: 34,
  h1: 30,
  h2: 26,
  h3: 24,
  body: 21,
  bodySmall: 18,
  caption: 16,
  micro: 14,
} as const;

export const typography = {
  hero: {
    fontSize: fontSize.hero,
    lineHeight: lineHeight.hero,
    fontWeight: fontWeights.black,
  } satisfies TextStyle,

  display: {
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeights.extraBold,
  } satisfies TextStyle,

  h1: {
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
    fontWeight: fontWeights.extraBold,
  } satisfies TextStyle,

  h2: {
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
    fontWeight: fontWeights.bold,
  } satisfies TextStyle,

  h3: {
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
    fontWeight: fontWeights.semibold,
  } satisfies TextStyle,

  body: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeights.regular,
  } satisfies TextStyle,

  bodyStrong: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeights.bold,
  } satisfies TextStyle,

  bodySmall: {
    fontSize: fontSize.bodySmall,
    lineHeight: lineHeight.bodySmall,
    fontWeight: fontWeights.regular,
  } satisfies TextStyle,

  small: {
    fontSize: fontSize.bodySmall,
    lineHeight: lineHeight.bodySmall,
    fontWeight: fontWeights.regular,
  } satisfies TextStyle,

  caption: {
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: fontWeights.semibold,
  } satisfies TextStyle,

  micro: {
    fontSize: fontSize.micro,
    lineHeight: lineHeight.micro,
    fontWeight: fontWeights.semibold,
  } satisfies TextStyle,
} as const;

export type ThemeTypography = typeof typography;
