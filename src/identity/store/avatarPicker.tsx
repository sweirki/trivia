import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { AVATARS } from 'src/identity/avatars/avatarDefinitions';
import { useIdentityStore } from 'src/identity/store/useIdentityStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function AvatarPicker() {
 const identity = useIdentityStore((s) => s.identity);
const setAvatar = useIdentityStore((s) => s.setAvatar);

  const uid = useAuthStore((s) => s.user?.uid);

 if (!uid) return null;
if (!identity) return <View />;

  return (
    <View style={styles.grid}>
      {AVATARS.map((a) => {
        const selected = identity.avatarId === a.id;

        return (
          <TouchableOpacity
            key={a.id}
            onPress={() => setAvatar(uid, a.id)}
            style={[styles.item, selected && styles.selected]}
          >
            <Image source={a.asset} style={styles.avatar} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  item: {
    borderRadius: 50,
    padding: 4,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
});

