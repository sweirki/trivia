import { StyleSheet } from 'react-native';
import { Text, View } from '@/theme';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Text style={styles.subtitle}>Screen repaired and themed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 10, fontSize: 16 }
});



