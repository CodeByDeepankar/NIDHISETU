import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, type ColorValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import { useT } from 'lingo.dev/react';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppTheme } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const EmiCalculatorScreen = ({ navigation }: any) => {
  const t = useT();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo<readonly [ColorValue, ColorValue]>(
    () => (theme.mode === 'dark' ? [theme.colors.gradientStart, theme.colors.gradientEnd] : ['#008080', '#20B2AA']),
    [theme]
  );
  const waveFill = theme.colors.background;
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
          colors={gradientColors}
          style={styles.gradientHeader}
        />
        <View style={styles.waveContainer}>
          <Svg height="100" width={width} viewBox="0 0 1440 320" style={styles.wave}>
            <Path
              fill={waveFill}
              d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"
            />
          </Svg>
        </View>
      </View>

      <SafeAreaView edges={['top']} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onPrimary} />
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
              placeholderTextColor={theme.colors.subtext}
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
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Tenure')}</AppText>
            <View style={styles.tenureContainer}>
                <TextInput
                    style={[styles.input, styles.tenureInput]}
                    value={tenure}
                    onChangeText={setTenure}
                    keyboardType="numeric"
                    placeholder={t('Enter tenure')}
                  placeholderTextColor={theme.colors.subtext}
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
            tone="secondary"
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      color: theme.colors.onPrimary,
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
      gap: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 20,
    },
    inputGroup: {
      gap: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    tenureInput: {
      flex: 1,
      marginBottom: 0,
    },
    tenureContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 4,
    },
    toggleButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    toggleActive: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toggleText: {
      fontSize: 14,
      color: theme.colors.subtext,
      fontWeight: '500',
    },
    toggleTextActive: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    calculateButton: {
      marginTop: 10,
      borderRadius: 12,
    },
    calculateButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    resultCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 16,
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultLabel: {
      fontSize: 16,
      color: theme.colors.subtext,
    },
    resultValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
  });
