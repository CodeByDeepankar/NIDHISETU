import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import { useT } from 'lingo.dev/react';

const { width } = Dimensions.get('window');

export const EmiCalculatorScreen = ({ navigation }: any) => {
  const t = useT();
  const [amount, setAmount] = useState('50000');
  const [rate, setRate] = useState('12');
  const [tenure, setTenure] = useState('12');
  const [tenureType, setTenureType] = useState<'Months' | 'Years'>('Months');
  const [result, setResult] = useState<{ emi: number; interest: number; total: number } | null>(null);

  const calculateEMI = () => {
    const P = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const time = parseFloat(tenure);

    if (isNaN(P) || isNaN(annualRate) || isNaN(time) || P <= 0 || annualRate <= 0 || time <= 0) {
        // Handle invalid input or reset
        setResult(null);
        return;
    }

    const r = annualRate / 12 / 100;
    const n = tenureType === 'Years' ? time * 12 : time;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    setResult({
      emi: Math.round(emi),
      interest: Math.round(totalInterest),
      total: Math.round(totalPayment)
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Wave */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#008080', '#20B2AA']} // Teal gradient
          style={styles.gradientHeader}
        />
        <View style={styles.waveContainer}>
          <Svg height="100" width={width} viewBox="0 0 1440 320" style={styles.wave}>
            <Path
              fill="#F3F4F6" // Matches background color
              d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"
            />
          </Svg>
        </View>
      </View>

      <SafeAreaView edges={['top']} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>{t('EMI Calculator')}</AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Loan Amount (₹)')}</AppText>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={t('Enter amount')}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Annual Interest Rate (%)')}</AppText>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              placeholder={t('Enter rate')}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Tenure')}</AppText>
            <View style={styles.tenureContainer}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={tenure}
                    onChangeText={setTenure}
                    keyboardType="numeric"
                    placeholder={t('Enter tenure')}
                />
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                    style={[styles.toggleButton, tenureType === 'Months' && styles.toggleActive]}
                    onPress={() => setTenureType('Months')}
                    >
                    <AppText style={[styles.toggleText, tenureType === 'Months' && styles.toggleTextActive]}>{t('Months')}</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={[styles.toggleButton, tenureType === 'Years' && styles.toggleActive]}
                    onPress={() => setTenureType('Years')}
                    >
                    <AppText style={[styles.toggleText, tenureType === 'Years' && styles.toggleTextActive]}>{t('Years')}</AppText>
                    </TouchableOpacity>
                </View>
            </View>
          </View>

          <AppButton
            label={t('Calculate EMI')}
            onPress={calculateEMI}
            style={styles.calculateButton}
            textStyle={styles.calculateButtonText}
          />
        </View>

        {result && (
          <View style={styles.resultCard}>
            <AppText style={styles.resultTitle}>{t('Results')}</AppText>
            
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Monthly EMI')}</AppText>
              <AppText style={styles.resultValue}>₹ {result.emi.toLocaleString()}</AppText>
            </View>
            
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Total Interest')}</AppText>
              <AppText style={styles.resultValue}>₹ {result.interest.toLocaleString()}</AppText>
            </View>
            
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Total Amount Payable')}</AppText>
              <AppText style={styles.resultValue}>₹ {result.total.toLocaleString()}</AppText>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    zIndex: 0,
  },
  gradientHeader: {
    flex: 1,
    paddingBottom: 40,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  wave: {
    width: '100%',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  tenureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: '#6200EE', // Purple color from image
    marginTop: 10,
    borderRadius: 12,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
