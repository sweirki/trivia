import React, { PropsWithChildren, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type RewardRevealPillProps = PropsWithChildren<{
  delay?: number;
  style?: StyleProp<ViewStyle>;
}>;

export default function RewardRevealPill({
  children,
  delay = 0,
  style,
}: RewardRevealPillProps) {
  const progress = useSharedValue(0);
  const pop = useSharedValue(0.92);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    pop.value = withDelay(
      delay,
      withSequence(
        withSpring(1.05, { damping: 10, stiffness: 190 }),
        withSpring(1, { damping: 13, stiffness: 180 }),
      ),
    );
  }, [delay, pop, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [16, 0]) },
      { scale: pop.value },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}


