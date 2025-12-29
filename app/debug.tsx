import { getRouter } from "expo-router";
import { ScrollView, Text } from "react-native";

export default function DebugRoutes() {
  const router = getRouter();
  const routes = router.getRoutes();

  return (
    <ScrollView style={{ padding: 20, backgroundColor: "#000" }}>
      {routes.map((r, i) => (
        <Text key={i} style={{ color: "#0f0", marginBottom: 12 }}>
          {JSON.stringify(r, null, 2)}
        </Text>
      ))}
    </ScrollView>
  );
}


