import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function MoreScreen() {
  const router = useRouter();

  const Item = ({
    label,
    route,
  }: {
    label: string;
    route?: string;
  }) => (
    <Pressable
      onPress={() => route && router.push(route)}
      style={{
        flex: 1,
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: "#121212",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
      }}
    >
      {/* TITLE */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 4,
        }}
      >
        More
      </Text>

      <Text style={{ opacity: 0.6, marginBottom: 20 }}>
        Profile, settings, and more
      </Text>

      {/* PRIMARY SERVICES */}
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Services
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <Item label="Profile" route="/profile" />
        <Item label="Statistics" />
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <Item label="Leaderboard" route="/leaderboard" />
        <Item label="Achievements" route="/achievements" />
      </View>

      {/* ECONOMY / SOCIAL */}
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Economy & Social
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <Item label="Cosmetics" />
        <Item label="Store / Bazaar" route="/shop" />
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <Item label="Friends" route="/friends" />
        <Item label="Settings" route="/settings" />
      </View>

     {/* SUPPORT */}
<Text style={{ fontWeight: "600", marginBottom: 8 }}>
  Support
</Text>

<View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
  <Item label="Help / Support" />
</View>
{/* DEV (TEMPORARY) */}
<Text style={{ fontWeight: "600", marginBottom: 8 }}>
  Dev
</Text>

<View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
  <Item label="Dev Actions" route="/dev" />
</View>

    </ScrollView>
  );
}
