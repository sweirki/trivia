import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { getFriendsLeaderboard } from "@/social/getFriendsLeaderboard";
import { useAuthStore } from "@/store/useAuthStore";
import { sendChallenge } from "@/social/sendChallenge";

type Tab = "global" | "friends";

export default function LeaderboardScreen() {
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<Tab>("global");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (tab !== "friends") return;
    if (!user?.uid) return;

    setLoading(true);
    getFriendsLeaderboard(user.uid)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [tab, user?.uid]);

  if (!user) {
    return <Text>Not signed in</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        Leaderboard
      </Text>

      {/* TOGGLE */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Pressable
          onPress={() => setTab("global")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: tab === "global" ? "#FFD700" : "#eee",
            marginRight: 6,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Global</Text>
        </Pressable>

        <Pressable
          onPress={() => setTab("friends")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: tab === "friends" ? "#FFD700" : "#eee",
            marginLeft: 6,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Friends</Text>
        </Pressable>
      </View>
<Text style={{ textAlign: "center", marginBottom: 12, opacity: 0.6 }}>
  {tab === "global"
    ? "Top players worldwide"
    : "Compete with your friends"}
</Text>

      {/* CONTENT */}
      {tab === "global" ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ opacity: 0.6, textAlign: "center" }}>
            Global leaderboard coming soon 🌍
          </Text>
        </View>
      ) : loading ? (
       <View
  style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
  }}
>
  <Text style={{ opacity: 0.6, textAlign: "center" }}>
    Loading friends leaderboard…
  </Text>
</View>

      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.uid}
          renderItem={({ item, index }) => (
            <View
              style={{
                paddingVertical: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>
                {index + 1}. {item.displayName || item.username}
              </Text>

              {item.uid !== user.uid && (
                <Pressable
                  onPress={async () => {
                    await sendChallenge(user.uid, item.uid);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: "#FFD700",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Challenge</Text>
                </Pressable>
              )}
            </View>
          )}
          ListEmptyComponent={
        <Text
  style={{
    textAlign: "center",
    marginTop: 48,
    opacity: 0.6,
    lineHeight: 20,
  }}
>
  No friends yet 👋{"\n"}
  Add friends to see their rankings here.
</Text>

          }
        />
      )}
    </View>
  );
}
