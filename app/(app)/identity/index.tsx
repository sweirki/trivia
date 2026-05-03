import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { Text } from "@/theme";
import { usePlayerStore } from "@/store/usePlayerStore";
import { AVATARS } from "@/identity/avatars";

export default function IdentityScreen() {
  const {
    nickname,
    avatarId,
    setNickname,
    setAvatar,
  } = usePlayerStore();

  const [localName, setLocalName] = useState(nickname ?? "");

  const [localAvatarId, setLocalAvatarId] = useState(
  avatarId ?? AVATARS[0].id
);

const selectedAvatar =
  AVATARS.find((a) => a.id === localAvatarId)!;


  const onSave = () => {
    setNickname(localName);
    setAvatar(selectedAvatar.id);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.subtitle}>
          This is how others see you
        </Text>
      </View>

      {/* ===== AVATAR PREVIEW ===== */}
      <View style={styles.avatarPreview}>
        <Image
          source={selectedAvatar.source}
          style={styles.avatarLarge}
        />
      </View>

      {/* ===== AVATAR GRID ===== */}
      <View style={styles.avatarGrid}>
        {AVATARS.map((avatar) => {
          const selected = avatar.id === selectedAvatar.id;

          return (
            <Pressable
              key={avatar.id}
             onPress={() => setLocalAvatarId(avatar.id)}

              style={[
                styles.avatarCard,
                selected && styles.avatarSelected,
              ]}
            >
              <Image
                source={avatar.source}
                style={styles.avatarSmall}
              />
            </Pressable>
          );
        })}
      </View>

      {/* ===== NICKNAME ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Nickname</Text>
        <TextInput
          value={localName}
          onChangeText={setLocalName}
          placeholder="Enter a nickname"
          placeholderTextColor="#6B7280"
          style={styles.input}
          maxLength={16}
        />
        <Text style={styles.hint}>
          You can change this later
        </Text>
      </View>

      {/* ===== SAVE BUTTON ===== */}
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.saveText}>Save profile</Text>
      </Pressable>
    </ScrollView>
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
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#F6C453",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#9AA3B2",
    textAlign: "center",
  },

  avatarPreview: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
  },

  avatarCard: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#141C2E",
    borderWidth: 1,
    borderColor: "#24304C",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarSelected: {
    borderColor: "#F6C453",
    borderWidth: 2,
  },

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  card: {
    backgroundColor: "#141C2E",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#24304C",
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F6C453",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#1B243A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#24304C",
    fontSize: 13,
  },

  hint: {
    marginTop: 6,
    fontSize: 10,
    color: "#9AA3B2",
  },

  saveBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F6C453",
  },

  saveText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#0B1220",
  },
});

