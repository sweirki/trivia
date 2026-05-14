import { View, StyleSheet } from "react-native";
import { Text } from "@/theme";

import AvatarPicker from "../../../src/identity/store/avatarPicker";


export default function AvatarPickerScreen() {
  return (
   <View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.title}>Choose Your Avatar</Text>
    <Text style={styles.subtitle}>
      This represents you across the game
    </Text>
  </View>

  <AvatarPicker />
</View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220", // same as Profile
    paddingTop: 84,
  },
  header: {
  alignItems: "center",
  marginBottom: 16,
},

title: {
  fontSize: 22,
  fontWeight: "800",
  color: "#F6C453",
  marginBottom: 6,
},

subtitle: {
  fontSize: 13,
  fontWeight: "600",
  color: "#9AA3B2",
},

});


