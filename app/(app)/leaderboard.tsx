import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { getFriendsLeaderboard } from "@/social/getFriendsLeaderboard";
import { useAuthStore } from "@/store/useAuthStore"; // adjust if your auth hook path differs
import { sendChallenge } from "@/social/sendChallenge";

export default function LeaderboardScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    getFriendsLeaderboard(user.uid)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (!user) {
    return <Text>Not signed in</Text>;
  }

 if (loading) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ opacity: 0.6 }}>
        Loading friends leaderboard…
      </Text>
    </View>
  );
}


  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        Friends Leaderboard
      </Text>

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
        marginTop: 40,
        opacity: 0.6,
      }}
    >
     No friends yet 👋  
Add friends to unlock challenges and compete!

    </Text>
  }
/>

    </View>
  );
}
