import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/authStore';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {user.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : null}
      <Text style={styles.name}>{user.displayName || 'Anonymous'}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.uid}>UID: {user.uid}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 16, marginBottom: 10 },
  uid: { fontSize: 12, color: 'gray', marginBottom: 20 },
});

export default ProfileScreen;