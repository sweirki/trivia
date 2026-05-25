import React from "react";
import { Linking, Text, TextProps, StyleSheet } from "react-native";

/**
 * Simple external link component.
 * Opens the given URL in the system browser when pressed.
 */
export function ExternalLink({
  href,
  children,
  style,
  ...props
}: TextProps & { href?: string }) {
  const handlePress = async () => {
    if (href) {
      const supported = await Linking.canOpenURL(href);
      if (supported) {
        await Linking.openURL(href);
      } else {
        console.warn("Don't know how to open URI:", href);
      }
    }
  };

  return (
    <Text style={[styles.link, style]} onPress={handlePress} {...props}>
      {children ?? href}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});







