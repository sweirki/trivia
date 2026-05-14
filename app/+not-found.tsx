import { StyleSheet } from 'react-native';
import { Text, View } from '@/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404 - Not Found</Text>
      <Text style={styles.subtitle}>This page does not exist.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16
  }
});




