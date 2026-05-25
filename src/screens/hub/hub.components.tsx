import React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import GoldCard from "@/components/GoldCard";

type HubTileStyles = {
  secondaryBtn: StyleProp<ViewStyle>;
  hubTileContent: StyleProp<ViewStyle>;
  econIcon: StyleProp<ImageStyle>;
  secondaryBtnText: StyleProp<TextStyle>;
};

interface HubTileProps {
  label: string;
  icon: ImageSourcePropType;
  color: string;
  onPress: () => void;
  styles: HubTileStyles;
}

export function HubTile({ label, icon, color, onPress, styles }: HubTileProps) {
  return (
    <GoldCard
      pressable
      onPress={onPress}
      variant="soft"
      padding="md"
      style={styles.secondaryBtn}
      accessibilityLabel={label}
    >
      <View style={styles.hubTileContent}>
        <Image source={icon} style={styles.econIcon} />
        <Text style={styles.secondaryBtnText}>{label}</Text>
      </View>
    </GoldCard>
  );
}


