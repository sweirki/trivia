import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme";

type ArenaScreenProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ArenaScreen({
  title,
  subtitle,
  children,
  footer,
  contentStyle,
}: ArenaScreenProps) {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { padding: theme.spacing.md, paddingBottom: theme.spacing["3xl"] },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {(title || subtitle) && (
        <View style={{ marginBottom: theme.spacing.md }}>
          {title ? (
            <Text
              style={[
                styles.screenTitle,
                {
                  color: theme.colors.gold,
                  fontSize: theme.typography.h1.fontSize,
                  lineHeight: theme.typography.h1.lineHeight,
                },
              ]}
            >
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text
              style={[
                styles.screenSubtitle,
                {
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.body.fontSize,
                  lineHeight: theme.typography.body.lineHeight,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}

      {children}
      {footer}
    </ScrollView>
  );
}

type ArenaCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "soft" | "gold" | "danger" | "success" | "blue";
  onPress?: PressableProps["onPress"];
  disabled?: boolean;
};

export function ArenaCard({
  children,
  style,
  variant = "default",
  onPress,
  disabled,
}: ArenaCardProps) {
  const theme = useTheme();

  const variantStyle = {
    default: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    soft: {
      backgroundColor: theme.colors.cardSoft,
      borderColor: theme.colors.border,
    },
    gold: {
      backgroundColor: "rgba(245,196,81,0.12)",
      borderColor: "rgba(245,196,81,0.42)",
    },
    danger: {
      backgroundColor: "rgba(231,76,60,0.12)",
      borderColor: "rgba(231,76,60,0.42)",
    },
    success: {
      backgroundColor: "rgba(61,220,151,0.12)",
      borderColor: "rgba(61,220,151,0.38)",
    },
    blue: {
      backgroundColor: "rgba(110,168,254,0.12)",
      borderColor: "rgba(110,168,254,0.38)",
    },
  }[variant];

  const content = [
    styles.card,
    {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      backgroundColor: variantStyle.backgroundColor,
      borderColor: variantStyle.borderColor,
    },
    theme.shadows.sm,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          content,
          {
            opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
            transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
          },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={content}>{children}</View>;
}

type ArenaHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "gold" | "blue" | "danger" | "success";
  children?: React.ReactNode;
};

export function ArenaHero({
  eyebrow,
  title,
  subtitle,
  tone = "gold",
  children,
}: ArenaHeroProps) {
  const theme = useTheme();

  const toneColor = {
    gold: theme.colors.gold,
    blue: theme.colors.info,
    danger: theme.colors.error,
    success: theme.colors.success,
  }[tone];

  return (
    <ArenaCard variant={tone === "gold" ? "gold" : tone}>
      {eyebrow ? <ArenaPill label={eyebrow} color={toneColor} /> : null}

      <Text
        style={[
          styles.heroTitle,
          {
            color: toneColor,
            fontSize: theme.typography.h1.fontSize,
            lineHeight: theme.typography.h1.lineHeight,
            marginTop: eyebrow ? theme.spacing.sm : 0,
          },
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            styles.heroSubtitle,
            {
              color: theme.colors.textMuted,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      {children ? <View style={{ marginTop: theme.spacing.md }}>{children}</View> : null}
    </ArenaCard>
  );
}

type ArenaPillProps = {
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function ArenaPill({ label, color, style, textStyle }: ArenaPillProps) {
  const theme = useTheme();
  const pillColor = color ?? theme.colors.gold;

  return (
    <View
      style={[
        styles.pill,
        {
          borderColor: pillColor,
          backgroundColor: `${pillColor}22`,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          {
            color: pillColor,
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type ArenaStatProps = {
  label: string;
  value: string | number;
  tone?: "default" | "gold" | "danger" | "success" | "blue";
};

export function ArenaStat({ label, value, tone = "default" }: ArenaStatProps) {
  const theme = useTheme();
  const color = {
    default: theme.colors.text,
    gold: theme.colors.gold,
    danger: theme.colors.error,
    success: theme.colors.success,
    blue: theme.colors.info,
  }[tone];

  return (
    <View
      style={[
        styles.statBox,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceSoft,
          borderRadius: theme.radius.md,
          padding: theme.spacing.sm,
        },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

type ArenaButtonProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

export function ArenaButton({
  title,
  subtitle,
  onPress,
  variant = "primary",
  disabled,
}: ArenaButtonProps) {
  const theme = useTheme();

  const stylesByVariant = {
    primary: {
      backgroundColor: theme.colors.gold,
      borderColor: theme.colors.gold,
      textColor: theme.colors.background,
      subColor: "rgba(14,20,36,0.72)",
    },
    secondary: {
      backgroundColor: theme.colors.cardSoft,
      borderColor: theme.colors.border,
      textColor: theme.colors.text,
      subColor: theme.colors.textMuted,
    },
    danger: {
      backgroundColor: "rgba(231,76,60,0.15)",
      borderColor: "rgba(231,76,60,0.45)",
      textColor: theme.colors.error,
      subColor: theme.colors.textMuted,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: stylesByVariant.backgroundColor,
          borderColor: stylesByVariant.borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: stylesByVariant.textColor }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.buttonSubtext, { color: stylesByVariant.subColor }]}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function ArenaSectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg }}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 14,
  },
  screenTitle: {
    fontWeight: "900",
  },
  screenSubtitle: {
    fontWeight: "500",
  },
  card: {
    borderWidth: 1,
  },
  heroTitle: {
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontWeight: "500",
  },
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  pillText: {
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    minHeight: 76,
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
  },
  button: {
    borderWidth: 1,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "900",
  },
  buttonSubtext: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
  },
});

