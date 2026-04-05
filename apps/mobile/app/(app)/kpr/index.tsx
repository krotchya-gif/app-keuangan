import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  calculateKPR,
  calculateAdditionalCosts,
  calculateInstallmentRatio,
} from '@keuangan/shared';
import { supabase } from '../../../src/lib/supabase';

interface FloatingPhase {
  durationYears: number;
  rateAnnual: number;
}

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export default function KPRScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    propertyPrice: '900000000',
    downPayment: '100000000',
    loanPeriodYears: '15',
    fixedRateAnnual: '3.47',
    fixedPeriodYears: '4',
    floatingRateAnnual: '12.99',
    monthlyIncome: '30000000',
  });

  const [berjenjang, setBerjenjang] = useState(false);
  const [floatingPhases, setFloatingPhases] = useState<FloatingPhase[]>([
    { durationYears: 2, rateAnnual: 0.08 },
  ]);

  const [result, setResult] = useState<ReturnType<typeof calculateKPR> | null>(null);
  const [additionalCosts, setAdditionalCosts] = useState<ReturnType<typeof calculateAdditionalCosts> | null>(null);
  const [ratioResult, setRatioResult] = useState<ReturnType<typeof calculateInstallmentRatio> | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const calculate = useCallback(() => {
    const propertyPrice = Number(form.propertyPrice) || 0;
    const downPayment = Number(form.downPayment) || 0;
    const loanPeriodYears = Number(form.loanPeriodYears) || 0;
    const fixedRateAnnual = (Number(form.fixedRateAnnual) || 0) / 100;
    const fixedPeriodYears = Number(form.fixedPeriodYears) || 0;
    const floatingRateAnnual = (Number(form.floatingRateAnnual) || 0) / 100;
    const monthlyIncome = Number(form.monthlyIncome) || 0;

    const kprResult = calculateKPR({
      propertyPrice,
      downPayment,
      loanPeriodYears,
      fixedRateAnnual,
      fixedPeriodYears,
      floatingRateAnnual,
      floatingPhases: berjenjang ? floatingPhases : [],
    });

    const costs = calculateAdditionalCosts({ propertyPrice });
    const ratio = calculateInstallmentRatio(
      kprResult.summary.minInstallment,
      kprResult.summary.maxInstallment,
      monthlyIncome
    );

    setResult(kprResult);
    setAdditionalCosts(costs);
    setRatioResult(ratio);
  }, [form, berjenjang, floatingPhases]);

  const saveSimulation = async () => {
    if (!result) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Anda harus login terlebih dahulu');
        return;
      }

      const { error } = await supabase.from('kpr_simulations').insert({
        user_id: user.id,
        name: `Simulasi ${new Date().toLocaleDateString('id-ID')}`,
        property_price: Number(form.propertyPrice),
        down_payment: Number(form.downPayment),
        loan_principal: Number(form.propertyPrice) - Number(form.downPayment),
        loan_period_years: Number(form.loanPeriodYears),
        fixed_rate: (Number(form.fixedRateAnnual) || 0) / 100,
        fixed_period_years: Number(form.fixedPeriodYears),
        floating_rate: (Number(form.floatingRateAnnual) || 0) / 100,
        floating_period_years: Number(form.loanPeriodYears) - Number(form.fixedPeriodYears),
        monthly_income: Number(form.monthlyIncome),
        floating_phases: berjenjang ? JSON.stringify(floatingPhases) : null,
        monthly_installment_min: result.summary.minInstallment,
        monthly_installment_max: result.summary.maxInstallment,
        total_interest: result.summary.totalInterestPaid,
        remaining_principal_at_floating: result.summary.remainingAtFloating,
      });

      if (error) throw error;
      Alert.alert('Sukses', 'Simulasi berhasil disimpan!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const addPhase = () => {
    if (floatingPhases.length >= 5) return;
    setFloatingPhases((prev) => [...prev, { durationYears: 1, rateAnnual: 0.09 }]);
  };

  const updatePhase = (idx: number, field: keyof FloatingPhase, value: number) => {
    setFloatingPhases((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const removePhase = (idx: number) => {
    setFloatingPhases((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Properti</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Harga Properti (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.propertyPrice}
            onChangeText={(v) => handleChange('propertyPrice', v)}
            placeholder="900000000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Uang Muka / DP (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.downPayment}
            onChangeText={(v) => handleChange('downPayment', v)}
            placeholder="100000000"
          />
          <Text style={styles.helper}>
            {Number(form.propertyPrice) > 0
              ? `${((Number(form.downPayment) / Number(form.propertyPrice)) * 100).toFixed(1)}% dari harga properti`
              : ''}
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Periode KPR (Tahun)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.loanPeriodYears}
            onChangeText={(v) => handleChange('loanPeriodYears', v)}
            placeholder="15"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suku Bunga</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Mode Bunga Berjenjang</Text>
          <Switch value={berjenjang} onValueChange={setBerjenjang} />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Bunga Fix (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.fixedRateAnnual}
              onChangeText={(v) => handleChange('fixedRateAnnual', v)}
              placeholder="3.47"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Periode Fix (Thn)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.fixedPeriodYears}
              onChangeText={(v) => handleChange('fixedPeriodYears', v)}
              placeholder="4"
            />
          </View>
        </View>

        {!berjenjang && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bunga Floating Cap (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.floatingRateAnnual}
              onChangeText={(v) => handleChange('floatingRateAnnual', v)}
              placeholder="12.99"
            />
          </View>
        )}

        {berjenjang && (
          <View style={styles.phasesContainer}>
            <Text style={styles.subTitle}>Fase Transisi</Text>
            {floatingPhases.map((phase, idx) => (
              <View key={idx} style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseTitle}>Transisi {idx + 1}</Text>
                  {floatingPhases.length > 1 && (
                    <TouchableOpacity onPress={() => removePhase(idx)}>
                      <Text style={styles.removeText}>Hapus</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Durasi (Tahun)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={String(phase.durationYears)}
                      onChangeText={(v) => updatePhase(idx, 'durationYears', Number(v) || 1)}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Bunga (%)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={String((phase.rateAnnual * 100).toFixed(2))}
                      onChangeText={(v) => updatePhase(idx, 'rateAnnual', (Number(v) || 0) / 100)}
                    />
                  </View>
                </View>
              </View>
            ))}
            {floatingPhases.length < 5 && (
              <TouchableOpacity style={styles.addButton} onPress={addPhase}>
                <Text style={styles.addButtonText}>+ Tambah Fase</Text>
              </TouchableOpacity>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bunga Floating Akhir (%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.floatingRateAnnual}
                onChangeText={(v) => handleChange('floatingRateAnnual', v)}
                placeholder="12.99"
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pendapatan</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pendapatan Bulanan (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.monthlyIncome}
            onChangeText={(v) => handleChange('monthlyIncome', v)}
            placeholder="30000000"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
        <Text style={styles.calculateButtonText}>🧮 Hitung Simulasi</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>📊 Hasil Simulasi</Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Pokok Pinjaman</Text>
            <Text style={styles.resultValue}>{formatRupiah(result.summary.loanPrincipal)}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Cicilan Minimum (Fix)</Text>
            <Text style={[styles.resultValue, { color: '#3ecf8e' }]}>
              {formatRupiah(result.summary.minInstallment)}/bln
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Cicilan Maksimum (Float)</Text>
            <Text style={[styles.resultValue, { color: '#f5a623' }]}>
              {formatRupiah(result.summary.maxInstallment)}/bln
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Total Bunga</Text>
            <Text style={[styles.resultValue, { color: '#ef4444' }]}>
              {formatRupiah(result.summary.totalInterestPaid)}
            </Text>
          </View>

          {ratioResult && (
            <View style={[styles.resultCard, { backgroundColor: getStatusColor(ratioResult.status) + '20' }]}>
              <Text style={styles.resultLabel}>Status Rasio Cicilan/Gaji</Text>
              <Text style={[styles.resultValue, { color: getStatusColor(ratioResult.status) }]}>
                {getStatusLabel(ratioResult.status)}
              </Text>
              <Text style={styles.resultSubtext}>
                Min: {formatPercent(ratioResult.minRatio)} | Max: {formatPercent(ratioResult.maxRatio)}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={saveSimulation}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Simpan</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push('/(app)/kpr/simulations')}
            >
              <Text style={styles.viewButtonText}>📋 Lihat Tersimpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'sehat':
      return '#3ecf8e';
    case 'aman':
      return '#635bff';
    case 'berat':
      return '#f5a623';
    case 'bahaya':
      return '#ef4444';
    default:
      return '#666';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'sehat':
      return '✅ Rasio Sehat';
    case 'aman':
      return '🟡 Batas Aman';
    case 'berat':
      return '⚠️ Membebani';
    case 'bahaya':
      return '🔴 Tidak Sehat';
    default:
      return '-';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phasesContainer: {
    marginTop: 8,
  },
  phaseCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeText: {
    color: '#ef4444',
    fontSize: 12,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#3ecf8e',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#3ecf8e',
    fontSize: 14,
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: '#3ecf8e',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    padding: 12,
    paddingBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  resultSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#635bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3ecf8e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#3ecf8e',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
