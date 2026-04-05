import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const features = [
    { icon: '🏡', title: 'Simulasi KPR', desc: 'Hitung cicilan & amortisasi KPR', route: '/(app)/kpr' },
    { icon: '💰', title: 'Net Worth', desc: 'Tracking aset & utang' },
    { icon: '💸', title: 'Arus Kas', desc: 'Kelola pemasukan & pengeluaran' },
    { icon: '📊', title: 'Checkup', desc: 'Cek kesehatan finansial' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat datang,</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => feature.route && router.push(feature.route as any)}
          >
            <Text style={styles.cardIcon}>{feature.icon}</Text>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDesc}>{feature.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
