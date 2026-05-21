import React from "react";
import {
  Animated,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { s } from "@/arena/theme/arenaSizing";

function PressScale({
  children,
  style,
  onPress,
  testID,
}: {
  children: React.ReactNode;
  style?: any;
  onPress: () => void;
  testID?: string;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const animateTo = React.useCallback(
    (toValue: number) => {
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        speed: 22,
        bounciness: 5,
      }).start();
    },
    [scale],
  );

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => animateTo(0.975)}
      onPressOut={() => animateTo(1)}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            style,
            { transform: [{ scale }], opacity: pressed ? 0.88 : 1 },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export function ArenaModeCard({
  title,
  subtitle,
  tag,
  art,
  accent = "#FFD36B",
  onPress,
  testID,
}: {
  title: string;
  subtitle: string;
  tag: string;
  art: ImageSourcePropType;
  accent?: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <PressScale testID={testID} style={styles.modeCard} onPress={onPress}>
      <ImageBackground
        source={art}
        resizeMode="cover"
        style={styles.modeArt}
        imageStyle={styles.modeArtImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(3,8,18,0.84)",
            "rgba(3,8,18,0.42)",
            "rgba(3,8,18,0.06)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.10)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={[styles.accentBar, { backgroundColor: accent }]} />

        <View style={styles.modeCopy}>
          <View style={styles.modeTitleRow}>
            <Text style={styles.modeTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text
              style={[
                styles.modeTag,
                { color: accent, borderColor: `${accent}66` },
              ]}
              numberOfLines={1}
            >
              {tag}
            </Text>
          </View>

          <Text style={styles.modeSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        <Text style={[styles.modeArrow, { color: accent }]}>›</Text>
      </ImageBackground>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  modeCard: {
    width: "100%",
    height: s(126),
    borderRadius: s(24),
    marginBottom: s(12),
    overflow: "hidden",
    backgroundColor: "#081428",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.26)",
    shadowColor: "#000",
    shadowOpacity: 0.36,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: s(8) },
    elevation: 8,
  },
  modeArt: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  modeArtImage: {
    borderRadius: s(24),
  },
  accentBar: {
    position: "absolute",
    left: s(14),
    right: s(14),
    top: 0,
    height: 1,
    opacity: 0.7,
  },
  modeCopy: {
    maxWidth: "68%",
    paddingHorizontal: s(15),
    paddingBottom: s(14),
  },
  modeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(7),
  },
  modeTitle: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "900",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: s(9),
  },
  modeTag: {
    borderWidth: 1,
    backgroundColor: "rgba(5,10,20,0.62)",
    borderRadius: s(999),
    paddingHorizontal: s(7),
    paddingVertical: s(3),
    fontSize: s(9),
    fontWeight: "900",
    overflow: "hidden",
    maxWidth: s(104),
  },
  modeSubtitle: {
    color: "#D8E7FF",
    marginTop: s(7),
    fontSize: s(12),
    fontWeight: "800",
    lineHeight: s(17),
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: s(7),
  },
  modeArrow: {
    position: "absolute",
    right: s(15),
    bottom: s(12),
    fontSize: s(30),
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: s(7),
  },
});
