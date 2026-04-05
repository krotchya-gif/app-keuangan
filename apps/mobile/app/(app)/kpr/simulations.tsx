import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';

interface Simulation {
  id: string;
  name: string;
  property_price: number;
  down_payment: number;
  loan_period_years: number;
  fixed_rate: number;
  monthly_installment_min: number;
  monthly_installment_max: number;
  created_at: string;
}

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function SimulationsScreen() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSimulations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('kpr_simulations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulations(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSimulations();
  };

  const deleteSimulation = async (id: string) => {
    Alert.alert(
      'Konfirmasi',
      'Yakin ingin menghapus simulasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('kpr_simulations')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchSimulations();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Simulation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(app)/kpr/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => deleteSimulation(item.id)}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardPrice}>{formatRupiah(Number(item.property_price))}</Text>

      <View style={styles.cardDetails}>
        <Text style={styles.cardDetail}>
          DP: {formatRupiah(Number(item.down_payment))}
        </Text>
        <Text style={styles.cardDetail}>•</Text>
        <Text style={styles.cardDetail}>{item.loan_period_years} tahun</Text>
      </View>

      <View style={styles.installmentRow}>
        <View>
          <Text style={styles.installmentLabel}>Cicilan Min</Text>
          <Text style={[styles.installmentValue, { color: '#3ecf8e' }]}>
            {formatRupiah(Number(item.monthly_installment_min || 0))}
          </Text>
        </View>
        <View>
          <Text style={styles.installmentLabel}>Cicilan Max</Text>
          <Text style={[styles.installmentValue, { color: '#f5a623' }]}>
            {formatRupiah(Number(item.monthly_installment_max || 0))}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDate}>
        {new Date(item.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={simulations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Belum ada simulasi tersimpan</Text>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => router.push('/(app)/kpr')}
            >
              <Text style={styles.newButtonText}>+ Buat Simulasi Baru</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  deleteText: {
    fontSize: 18,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3ecf8e',
    marginBottom: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  cardDetail: {
    fontSize: 13,
    color: '#666',
  },
  installmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  installmentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  installmentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  newButton: {
    backgroundColor: '#3ecf8e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
