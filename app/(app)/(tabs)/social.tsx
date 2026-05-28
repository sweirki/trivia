import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

const CARDS = [
  {
    title: "Challenges",
    subtitle: "Accept incoming battles, continue active matches, and chase revenge.",
    route: "/challenges",
    cta: "Open Challenges",
  },
  {
    title: "Friends",
    subtitle: "Add friends, send invites, and start direct trivia battles.",
    route: "/friends",
    cta: "Open Friends",
  },
  {
    title: "Leaderboard",
    subtitle: "See rank pressure and pick rivals to beat.",
    route: "/leaderboard",
    cta: "Open Leaderboard",
  },
];

export default function SocialTabScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>SOCIAL ARENA</Text>
        <Text style={styles.title}>Compete with real people</Text>
        <Text style={styles.subtitle}>
          Challenges, friends, rivals, and leaderboard pressure are now one tap away.
        </Text>
      </View>

      {CARDS.map((card) => (
        <Pressable
          key={card.title}
          onPress={() => router.push(card.route as never)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSub}>{card.subtitle}</Text>
          </View>
          <Text style={styles.cardCta}>{card.cta} →</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B12",
  },
  content: {
    padding: 18,
    paddingBottom: 42,
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: "#101722",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.22)",
    marginBottom: 16,
  },
  kicker: {
    color: "#8FB7D9",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#B7C7DA",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#101722",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  cardSub: {
    color: "#B7C7DA",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  cardCta: {
    color: "#8FB7D9",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 14,
  },
});


