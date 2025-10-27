import React from 'react';
import { View, Text, Button } from 'react-native';
import { useStore } from '../context/storeContext';

export default function BoosterShop() {
  const { buyBooster, boosters } = useStore();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>⚡ Booster Shop</Text>
      <Button title="Buy Double Points (10 coins)" onPress={() => buyBooster('doublePoints')} />
      <Button title="Buy Skip Question (5 coins)" onPress={() => buyBooster('skipQuestion')} />

      <Text style={{ marginTop: 20 }}>Inventory:</Text>
      <Text>Double Points: {boosters.doublePoints}</Text>
      <Text>Skip Question: {boosters.skipQuestion}</Text>
    </View>
  );
}