import React from "react";
import { StyleSheet, Animated, ScrollView } from "react-native";

export default function GoldParallax({ children }: any) {
  const translateY = new Animated.Value(0);

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: translateY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <Animated.View
        style={[
          styles.bgLayer,
          {
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, 300],
                  outputRange: [0, -40], // subtle depth
                }),
              },
            ],
          },
        ]}
      />

      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  bgLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    opacity: 0.25,
  },
});






