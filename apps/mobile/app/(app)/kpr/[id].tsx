import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';

interface Simulation {
  id: string;
  name: string;
  property_price: number;
  down_payment: number;
  loan_principal: number;
  loan_period_years: number;
  fixed_rate: number;
  fixed_period_years: number;
  floating_rate: number;
  floating_period_years: number;
  floating_phases: string | null;
  monthly_income: number;
  monthly_installment_min: number;
  monthly_installment_max: number;
  total_interest: number;
  remaining_principal_at_floating: number;
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

export default function SimulationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulation();
  }, [id]);

  const fetchSimulation = async () => {
    try {
      const { data, error } = await supabase
        .from('kpr_simulations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSimulation(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSimulation = async () => {
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
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const getFloatingPhases = () => {
    if (!simulation?.floating_phases) return [];
    try {
      const phases = JSON.parse(simulation.floating_phases);
      return Array.isArray(phases) ? phases : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3ecf8e" />
      </View>
    );
  }

  if (!simulation) {
    return (
      <View style={styles.center}>
        <Text>Simulasi tidak ditemukan</Text>
      </View>
    );
  }

  const phases = getFloatingPhases();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{simulation.name}</Text>
        <Text style={styles.date}>
          Dibuat: {new Date(simulation.created_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Data Properti */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Data Properti</Text>
        <View style={styles.card}>
          <Row label="Harga Properti" value={formatRupiah(Number(simulation.property_price))} />
          <Row label="Uang Muka (DP)" value={formatRupiah(Number(simulation.down_payment))} />
          <Row label="Pokok Pinjaman" value={formatRupiah(Number(simulation.loan_principal))} />
          <Row label="Tenor" value={`${simulation.loan_period_years} tahun`} />
        </View>
      </View>

      {/* Struktur Bunga */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Struktur Bunga</Text>
        <View style={styles.card}>
          <Row 
            label={`Fix (${simulation.fixed_period_years} thn)`} 
            value={`${(Number(simulation.fixed_rate) * 100).toFixed(2)}%`}
            highlight
          />
          {phases.map((p: any, i: number) => (
            <Row
              key={i}
              label={`Transisi ${i + 1} (${p.durationYears} thn)`}
              value={`${(p.rateAnnual * 100).toFixed(2)}%`}
              highlight
            />
          ))}
          <Row
            label={`Floating (${simulation.floating_period_years} thn)`}
            value={`${(Number(simulation.floating_rate) * 100).toFixed(2)}%`}
            highlight
          />
        </View>
      </View>

      {/* Hasil Perhitungan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Hasil Perhitungan</Text>
        <View style={styles.card}>
          <Row 
            label="Cicilan Minimum (Fix)" 
            value={formatRupiah(Number(simulation.monthly_installment_min || 0))}
            valueColor="#3ecf8e"
          />
          <Row 
            label="Cicilan Maksimum (Float)" 
            value={formatRupiah(Number(simulation.monthly_installment_max || 0))}
            valueColor="#f5a623"
          />
          <Row 
            label="Total Bunga" 
            value={formatRupiah(Number(simulation.total_interest || 0))}
            valueColor="#ef4444"
          />
          <Row 
            label="Sisa Pokok saat Floating" 
            value={formatRupiah(Number(simulation.remaining_principal_at_floating || 0))}
          />
        </View>
      </View>

      {/* Analisis Pendapatan */}
      {simulation.monthly_income > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Analisis Pendapatan</Text>
          <View style={styles.card}>
            <Row 
              label="Pendapatan Bulanan" 
              value={formatRupiah(Number(simulation.monthly_income))}
            />
            <Row 
              label="Rasio Cicilan/Gaji (Min)" 
              value={`${((Number(simulation.monthly_installment_min || 0) / Number(simulation.monthly_income)) * 100).toFixed(1)}%`}
            />
            <Row 
              label="Rasio Cicilan/Gaji (Max)" 
              value={`${((Number(simulation.monthly_installment_max || simulation.monthly_installment_min || 0) / Number(simulation.monthly_income)) * 100).toFixed(1)}%`}
            />
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteSimulation}>
          <Text style={styles.deleteButtonText}>🗑️ Hapus Simulasi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ 
  label, 
  value, 
  highlight,
  valueColor 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[
        styles.rowValue,
        highlight && styles.highlightValue,
        valueColor && { color: valueColor }
      ]}>
        {value}
      </Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    margin: 12,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: {
    fontSize: 14,
    color: '#666',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  highlightValue: {
    color: '#635bff',
  },
  actions: {
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
