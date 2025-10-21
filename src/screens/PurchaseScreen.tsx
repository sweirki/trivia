import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { usePacks } from '../context/packStore';

export default function PurchaseScreen() {
  const { packs, purchasePack } = usePacks();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛒 Premium Packs</Text>
      {packs.filter(p => p.isPremium).map((pack) => (
        <View key={pack.id} style={styles.card}>
          <Text style={styles.title}>{pack.title}</Text>
          <Text>Price: ${pack.price}</Text>
          <Button
            title={pack.purchased ? "Purchased ✅" : "Buy Now"}
            onPress={() => purchasePack(pack.id)}
            disabled={pack.purchased}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, marginBottom: 16 },
  card: { marginBottom: 12, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: 'bold' },
});