import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { spacing, colors } from "../lib/theme";

type Props = {
  duration: number;
  onEnd: () => void;
};

export default function Timer({ duration, onEnd }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }
    const id = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  return (
    <View style={{ alignItems: "center", marginBottom: spacing.md }}>
      <Image
        source={require("../../assets/images/timer-ring.png")}
        style={{ width: 80, height: 80, tintColor: colors.secondary }}
      />
      <Text style={{ color: colors.text, position: "absolute", top: 28 }}>
        {timeLeft}
      </Text>
    </View>
  );
}
