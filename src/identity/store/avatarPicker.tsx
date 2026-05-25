import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from "react-native";

import { CosmeticCategory } from "@/cosmetics/types";
import { getCosmeticsByCategory } from "@/cosmetics/cosmeticSelectors";
import { getCosmeticAssetSource } from "@/cosmetics/cosmeticAssets";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { AVATARS } from "src/identity/avatars/avatarDefinitions";
import { useIdentityStore } from "src/identity/store/useIdentityStore";

export default function AvatarPicker() {
  const identity = useIdentityStore((s) => s.identity);
  const setIdentityAvatar = useIdentityStore((s) => s.setAvatar);
  const uid = useAuthStore((s) => s.user?.uid);

  const playerAvatarId = usePlayerStore((s) => s.avatarId);
  const setPlayerAvatar = usePlayerStore((s) => s.setAvatar);
  const cosmetics = usePlayerStore((s) => s.cosmetics);
  const equipCosmetic = usePlayerStore((s) => s.equipCosmetic);
  const unequipCosmetic = usePlayerStore((s) => s.unequipCosmetic);

  if (!uid) return null;
  if (!identity) return <View />;

  const ownedCosmeticAvatars = getCosmeticsByCategory(CosmeticCategory.AVATAR).filter(
    (item) => cosmetics.owned?.[item.id] === true
  );

  const equippedCosmeticAvatarId = cosmetics.equipped?.[CosmeticCategory.AVATAR];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Free Avatars</Text>
      <View style={styles.grid}>
        {AVATARS.map((avatar) => {
          const selected = identity.avatarId === avatar.id || playerAvatarId === avatar.id;

          return (
            <TouchableOpacity
              key={avatar.id}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${avatar.id} avatar`}
              accessibilityState={{ selected }}
              activeOpacity={0.72}
              onPress={() => {
                unequipCosmetic(CosmeticCategory.AVATAR);
                setIdentityAvatar(uid, avatar.id);
                setPlayerAvatar(avatar.id);
              }}
              style={[styles.item, selected && styles.selected]}
            >
              <Image source={avatar.asset} style={styles.avatar} resizeMode="cover" />
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Owned Cosmetic Avatars</Text>
      <View style={styles.grid}>
        {ownedCosmeticAvatars.map((item) => {
          const selected = equippedCosmeticAvatarId === item.id;
          const source = getCosmeticAssetSource(item.icon);

          if (!source) return null;

          return (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Equip ${item.name}`}
              accessibilityState={{ selected }}
              activeOpacity={0.72}
              onPress={() => {
                equipCosmetic(item.id);
              }}
              style={[styles.item, selected && styles.selected]}
            >
              <Image source={source} style={styles.avatar} resizeMode="cover" />
            </TouchableOpacity>
          );
        })}
      </View>

      {ownedCosmeticAvatars.length === 0 ? (
        <Text style={styles.emptyText}>Buy cosmetic avatars in the Store to unlock them here.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: "#F6C453",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  item: {
    borderRadius: 50,
    padding: 4,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#121A2A",
  },
  selected: {
    borderColor: "#FFD700",
    backgroundColor: "#2A230B",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  emptyText: {
    color: "#9AA3B2",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
});


