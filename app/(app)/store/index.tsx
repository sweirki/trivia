// app/(app)/store/index.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useCosmeticsStore } from '../../../src/cosmetics/store/useCosmeticsStore';
import { useEffect } from 'react';
import { initialCosmetics } from '../../../src/cosmetics/data';
import { loadItem, StorageKeys } from '../../../src/storage/storage';

export default function StoreScreen() {
  const cosmetics = useCosmeticsStore((state) => state.cosmetics);
  const setCosmetics = useCosmeticsStore((state) => state.setCosmetics);
const buyCosmetic = useCosmeticsStore((state) => state.buyCosmetic);
const isOwned = useCosmeticsStore((state) => state.isOwned);

 useEffect(() => {
  const hydrate = async () => {
    const stored = await loadItem(initialCosmetics[0].id ? StorageKeys.COSMETICS : '');
    if (stored && Array.isArray(stored)) {
      setCosmetics(stored);
    } else if (cosmetics.length === 0) {
      setCosmetics(initialCosmetics);
    }
  };

  hydrate();
}, []);



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store</Text>

      {cosmetics.length === 0 ? (
        <Text style={styles.emptyText}>
          No items available yet.
        </Text>
      ) : (
        <FlatList
          data={cosmetics}
          keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
  const owned = isOwned(item.id);

  return (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemMeta}>
        {item.rarity.toUpperCase()} · {item.type}
      </Text>

      <TouchableOpacity
        style={[
          styles.buyButton,
          owned && styles.buyButtonOwned,
        ]}
        disabled={owned}
        onPress={() => buyCosmetic(item.id)}
      >
        <Text style={styles.buyButtonText}>
          {owned ? 'Owned' : `Buy (${item.price})`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}}

        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#111',
    marginBottom: 12,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  itemMeta: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  buyButton: {
  marginTop: 10,
  paddingVertical: 8,
  borderRadius: 6,
  backgroundColor: '#333',
  alignItems: 'center',
},
buyButtonOwned: {
  backgroundColor: '#1e7f4f',
},
buyButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
},

});
