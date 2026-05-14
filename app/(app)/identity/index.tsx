import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Text } from "@/theme";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "@/firebase/firebase";
import { ThemedAccountModal } from "@/components/account/ThemedAccountModal";

export default function IdentityScreen() {
  const user = useAuthStore((s) => s.user);
  const { nickname, avatarId, avatarUri, setNickname, setAvatar, setAvatarUri, syncNow } = usePlayerStore();
  const [localName, setLocalName] = useState(nickname ?? "");
  const [localAvatarId, setLocalAvatarId] = useState(avatarId ?? AVATARS[0]?.id ?? "avatar_01");
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(avatarUri ?? null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);

  const selectedAvatar = AVATARS.find((a) => a.id === localAvatarId) ?? AVATARS[0];

  const pickCustomPhoto = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setModal({ title: "Permission needed", message: "Allow photo library access to choose a custom avatar." });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setLocalAvatarUri(uri);
    } catch (e: any) {
      setModal({ title: "Photo picker unavailable", message: "Install it first: npx expo install expo-image-picker" });
    }
  };

  const useBuiltInAvatar = (id: string) => {
    setLocalAvatarId(id);
    setLocalAvatarUri(null);
  };

  const onSave = async () => {
    const cleanName = localName.trim().slice(0, 16);
    if (!cleanName) {
      setModal({ title: "Name required", message: "Add a player name." });
      return;
    }

    setSaving(true);
    try {
      setNickname(cleanName);
      if (localAvatarUri) {
        setAvatarUri(localAvatarUri);
      } else {
        setAvatar(selectedAvatar.id);
      }

      if (user) {
        await updateProfile(user, { displayName: cleanName, photoURL: localAvatarUri ?? undefined });
        await setDoc(doc(db, "users", user.uid), {
          displayName: cleanName,
          avatarId: localAvatarUri ? null : selectedAvatar.id,
          avatarUri: localAvatarUri ?? null,
          photoURL: localAvatarUri ?? null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        await setDoc(doc(db, "players", user.uid, "identity", "core"), {
          avatarId: localAvatarUri ? null : selectedAvatar.id,
          avatarUri: localAvatarUri ?? null,
          badgeId: null,
          updatedAt: Date.now(),
        }, { merge: true });
        await syncNow();
      }

      setModal({ title: "Saved", message: "Your profile was updated." });
    } catch (e: any) {
      setModal({ title: "Save failed", message: e?.message ?? "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.subtitle}>Choose your public name and avatar</Text>
      </View>

      <View style={styles.avatarPreview}>
        {localAvatarUri ? <Image source={{ uri: localAvatarUri }} style={styles.avatarLarge} /> : <Image source={selectedAvatar.asset} style={styles.avatarLarge} />}
      </View>

      <Pressable onPress={pickCustomPhoto} disabled={saving} style={styles.customBtn}>
        <Text style={styles.customText}>Choose custom photo</Text>
      </Pressable>

      <Text style={styles.sectionHint}>Or use an app avatar</Text>
      <View style={styles.avatarGrid}>
        {AVATARS.map((avatar) => {
          const selected = !localAvatarUri && avatar.id === selectedAvatar.id;
          return (
            <Pressable key={avatar.id} onPress={() => useBuiltInAvatar(avatar.id)} style={[styles.avatarCard, selected && styles.avatarSelected]}>
              <Image source={avatar.asset} style={styles.avatarSmall} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Player name</Text>
        <TextInput value={localName} onChangeText={setLocalName} placeholder="Enter a name" placeholderTextColor="#6B7280" style={styles.input} maxLength={16} />
        <Text style={styles.hint}>This name appears in your profile and future leaderboards.</Text>
      </View>

      <Pressable onPress={onSave} disabled={saving} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "Save profile"}</Text>
      </Pressable>

      <ThemedAccountModal
        visible={modal !== null}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        actions={[{ label: "OK", variant: "primary", onPress: () => setModal(null) }]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 12 },
  title: { fontSize: 19, fontWeight: "800", color: "#F6C453" },
  subtitle: { marginTop: 4, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
  avatarPreview: { alignItems: "center", marginBottom: 14 },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#1B243A" },
  customBtn: { alignSelf: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: "#1B243A", borderWidth: 1, borderColor: "#24304C", marginBottom: 14 },
  customText: { color: "#F6C453", fontSize: 12, fontWeight: "800" },
  sectionHint: { color: "#9AA3B2", textAlign: "center", fontSize: 11, marginBottom: 10 },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 20 },
  avatarCard: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#141C2E", borderWidth: 1, borderColor: "#24304C", alignItems: "center", justifyContent: "center" },
  avatarSelected: { borderColor: "#F6C453", borderWidth: 2 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20 },
  card: { backgroundColor: "#141C2E", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#24304C", marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "700", color: "#F6C453", marginBottom: 6 },
  input: { backgroundColor: "#1B243A", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, color: "#FFFFFF", borderWidth: 1, borderColor: "#24304C", fontSize: 13 },
  hint: { marginTop: 6, fontSize: 10, color: "#9AA3B2" },
  saveBtn: { paddingVertical: 12, borderRadius: 16, backgroundColor: "#F6C453" },
  saveText: { textAlign: "center", fontSize: 14, fontWeight: "800", color: "#0B1220" },
});

