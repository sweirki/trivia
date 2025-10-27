import React from 'react';
import { View, Text, Button } from 'react-native';
import { useStore } from '../context/storeContext';

export default function CoinStore() {
  const { buyCoins } = useStore();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>🪙 Coin Store</Text>
      <Button title="Buy 50 Coins" onPress={() => buyCoins(50)} />
      <Button title="Buy 100 Coins" onPress={() => buyCoins(100)} />
    </View>
  );
}