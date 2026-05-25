import { View, Text, StyleSheet } from "react-native";

export default function HubEntry() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading Hub…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
  },
});




