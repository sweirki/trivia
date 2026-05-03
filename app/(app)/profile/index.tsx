import React from "react";
import {
  StyleSheet,
  Image,
  View,
  ScrollView,
  Pressable,
} from "react-native";

import { Text } from "@/theme";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";


export default function ProfileScreen() {
   console.log("PROFILE SCREEN LOADED");
  const equipped = usePlayerStore((s) => s.cosmetics?.equipped ?? {});


 const router = useRouter();

const {
  level,
  xp,
  nickname,
  tournamentsPlayed,
  tournamentsWon,
  bestTournamentFinish,
  titles,
  tournamentHistory,
} = usePlayerStore();

const xpRequired = level * 150 + level * level * 6;
const displayName = nickname ?? "Player";

const avatarId =
  typeof (equipped as any)?.avatar === "string"
    ? (equipped as any).avatar
    : null;
const avatar = AVATARS.find((a) => a.id === avatarId);


  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const xpPercent =
    xpRequired > 0 ? Math.min(xp / xpRequired, 1) : 0;

  return (
   <View style={styles.container}>
    {typeof equipped.PROFILE_BACKGROUND === "string" &&
  equipped.PROFILE_BACKGROUND.startsWith("http") && (
    <Image
      source={{ uri: equipped.PROFILE_BACKGROUND }}
      style={styles.profileBackground}
      resizeMode="cover"
    />
  )}


  <ScrollView
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
  >

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
  <View style={styles.avatarFrame}>
{avatar ? (
  <Image source={avatar.asset} style={styles.avatar} />
) : (
  <View
    style={[
      styles.avatar,
      { backgroundColor: "#1B243A" },
    ]}
  />
)}

</View>



<Text style={styles.title}>{displayName}</Text>

{equipped.BADGE && (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>🏅</Text>
  </View>
)}

<Text style={styles.sub}>
  Level {level} • {xp} XP
</Text>

{/* ================= ACCOUNT ================= */}
<View style={styles.accountBox}>
  {user ? (
    <>
      <Text style={styles.accountText}>
        Signed in as {user.email}
      </Text>
<Pressable
  onPress={() => router.push("/identity/avatarPicker")}
  style={({ pressed }) => [
    styles.accountButton,
    pressed && { opacity: 0.85 },
  ]}
>

  <Text style={styles.accountButtonText}>
    Edit profile
  </Text>
</Pressable>

      <Pressable
        onPress={logout}
        style={({ pressed }) => [
          styles.accountButton,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.accountButtonText}>Log out</Text>
      </Pressable>
    </>
  ) : (
    <>
      <Text style={styles.accountText}>
        Playing as Guest
      </Text>
      <Text style={styles.accountSub}>
       Progress is saved on this device
Sign in to back it up
      </Text>

      <Pressable
        onPress={() => router.push("/login")}
        style={({ pressed }) => [
          styles.accountButton,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.accountButtonText}>
          Sign in / Create account
        </Text>
      </Pressable>
    </>
  )}
</View>

        <View style={styles.xpBar}>
          <View
            style={[
              styles.xpFill,
              { width: `${xpPercent * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.xpText}>
          {xp} / {xpRequired} XP
        </Text>
      </View>

      {/* ================= STATS ================= */}
      <View style={styles.statsRow}>
        <Stat label="Tournaments" value={tournamentsPlayed} />
        <Stat label="Wins" value={tournamentsWon} />
        <Stat
          label="Best Finish"
          value={bestTournamentFinish ?? "—"}
        />
      </View>

      {/* ================= QUICK LINKS ================= */}
      <Section title="Quick Access">
        <Grid>
          <Tile
            title="Achievements"
            sub="Your milestones"
            onPress={() => router.push("/achievements")}
          />
          <Tile
            title="Leaderboard"
            sub="Global rankings"
            onPress={() => router.push("/leaderboard")}
          />
        </Grid>
      </Section>

      {/* ================= PROFILE ================= */}
      <Section title="Profile">
        <Grid>
          <Tile
            title="Statistics"
            sub="Performance breakdown"
            onPress={() => router.push("/statistics" as any)}
          />
          <Tile
            title="Friends"
            sub="Social & invites"
            onPress={() => router.push("/friends")}
          />
        </Grid>
      </Section>

      {/* ================= TITLES ================= */}
      <Section title="Titles">
        {titles.length === 0 ? (
          <Text style={styles.empty}>
            No titles yet — place high in tournaments to earn some.
          </Text>
        ) : (
          <View style={styles.pills}>
            {titles.map((t) => (
              <View key={t} style={styles.pill}>
                <Text style={styles.pillText}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </Section>

      {/* ================= HISTORY ================= */}
      <Section title="Tournament History">
        {tournamentHistory.length === 0 ? (
          <Text style={styles.empty}>
            You haven’t completed any tournaments yet.
          </Text>
        ) : (
          tournamentHistory.map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyText}>
                {h.position === 1 ? "🏆 Champion" : `#${h.position}`} •{" "}
                {h.totalPlayers} players
              </Text>
              <Text style={styles.historyDate}>
                {new Date(h.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </Section>

     
     
    </ScrollView>
    </View> 
  );
}

/* ================= COMPONENTS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

function Tile({
  title,
  sub,
  onPress,
}: {
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.tileTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.tileSub} numberOfLines={2}>
        {sub}
      </Text>
    </Pressable>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    
  );
  
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  content: {
    padding: 20,
    paddingBottom: 48,
  },

  header: {
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
avatarFrame: {
  padding: 4,
  borderRadius: 52,
  borderWidth: 2,
  borderColor: "#F6C453",
  marginBottom: 12,
  backgroundColor: "#0B1220",
},




 title: {
  fontSize: 19,
  fontWeight: "800",
  color: "#F6C453",
},


  sub: {
  fontSize: 10,
  color: "#9AA3B2",
  marginTop: 2,
},


  xpBar: {
    marginTop: 14,
    width: "100%",
    height: 10,
    backgroundColor: "#1B243A",
    borderRadius: 8,
    overflow: "hidden",
  },

  xpFill: {
    height: "100%",
    backgroundColor: "#F6C453",
  },

  xpText: {
    marginTop: 4,
    fontSize: 10,
    color: "#9AA3B2",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
badge: {
  marginTop: 6,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: "#1B243A",
  borderWidth: 1,
  borderColor: "#24304C",
},

badgeText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#F6C453",
},

  stat: {
  flex: 1,
  backgroundColor: "#141C2E",
  borderRadius: 14,
  paddingVertical: 10,
  marginHorizontal: 4,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#24304C",
},


  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#9AA3B2",
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

 tile: {
  width: "48%",
  backgroundColor: "#141C2E",
  borderRadius: 16,
  padding: 12,
  borderWidth: 1,
  borderColor: "#24304C",
},


  tileTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F6C453",
  },

  tileSub: {
    marginTop: 4,
    fontSize: 10,
    color: "#9AA3B2",
  },

  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1B243A",
    borderWidth: 1,
    borderColor: "#24304C",
  },

  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F6C453",
  },

  historyRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#24304C",
  },

  historyText: {
    fontSize: 12,
    color: "#FFFFFF",
  },

  historyDate: {
    marginTop: 2,
    fontSize: 12,
    color: "#9AA3B2",
  },

  empty: {
    fontSize: 10,
    color: "#9AA3B2",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#4B556A",
    marginTop: 12,
  },

  accountBox: {
  marginTop: 12,
  alignItems: "center",
},

accountText: {
  fontSize: 11,
  color: "#9AA3B2",
},

accountSub: {
  marginTop: 2,
  fontSize: 10,
  color: "#6B7280",
  textAlign: "center",
},

accountButton: {
  marginTop: 8,
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 14,
  backgroundColor: "#1B243A",
  borderWidth: 1,
  borderColor: "#24304C",
},

accountButtonText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#F6C453",
},
profileBackground: {
  ...StyleSheet.absoluteFillObject,
  opacity: 0.12,
},

});

