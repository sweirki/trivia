import React, { PropsWithChildren, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type PulseGlowProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  minScale?: number;
  maxScale?: number;
  duration?: number;
}>;

export default function PulseGlow({
  children,
  style,
  minScale = 1,
  maxScale = 1.018,
  duration = 1400,
}: PulseGlowProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [duration, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = minScale + (maxScale - minScale) * pulse.value;
    return {
      transform: [{ scale }],
      opacity: 0.94 + 0.06 * pulse.value,
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}


