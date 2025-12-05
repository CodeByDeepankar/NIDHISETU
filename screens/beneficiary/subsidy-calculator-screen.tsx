import React, { useMemo, useState } from 'react';
import { ColorValue, Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useT } from 'lingo.dev/react';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppTheme } from '@/constants/theme';

const { width } = Dimensions.get('window');

type SubsidyResult = {
  subsidy: number;
  cappedSubsidy: number;
  netInvestment: number;
  effectiveRate: number;
};

type UnitCategory = 'General' | 'Priority (Women / SC-ST / Hills)';

export const SubsidyCalculatorScreen = ({ navigation }: any) => {
  const t = useT();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo<readonly [ColorValue, ColorValue]>(
    () => (theme.mode === 'dark' ? [theme.colors.gradientStart, theme.colors.gradientEnd] : ['#008080', '#20B2AA']),
    [theme]
  );
  const waveFill = theme.colors.background;
  const [projectCost, setProjectCost] = useState('250000');
  const [baseRate, setBaseRate] = useState('15');
  const [maxCap, setMaxCap] = useState('50000');
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('General');
  const [result, setResult] = useState<SubsidyResult | null>(null);

  const subsidyHint = useMemo(() => {
    return unitCategory === 'Priority (Women / SC-ST / Hills)'
      ? t('Priority units automatically get +10% support')
      : t('General category uses the entered base rate');
  }, [t, unitCategory]);

  const calculateSubsidy = () => {
    const cost = parseFloat(projectCost);
    const rate = parseFloat(baseRate);
    const cap = parseFloat(maxCap);

    if ([cost, rate, cap].some((value) => Number.isNaN(value) || value <= 0)) {
      setResult(null);
      return;
    }

    const effectiveRate = Math.min(rate + (unitCategory === 'General' ? 0 : 10), 90);
    const subsidy = (cost * effectiveRate) / 100;
    const cappedSubsidy = Math.min(subsidy, cap);
    const netInvestment = Math.max(cost - cappedSubsidy, 0);

    setResult({ subsidy, cappedSubsidy, netInvestment, effectiveRate });
  };

  const formatted = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient colors={gradientColors} style={styles.gradientHeader} />
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
          <AppText style={styles.headerTitle}>{t('Subsidy Calculator')}</AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Project Cost (₹)')}</AppText>
            <TextInput
              style={styles.input}
              value={projectCost}
              onChangeText={setProjectCost}
              keyboardType="numeric"
              placeholder={t('Enter project cost')}
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Eligible Subsidy Rate (%)')}</AppText>
            <TextInput
              style={styles.input}
              value={baseRate}
              onChangeText={setBaseRate}
              keyboardType="numeric"
              placeholder={t('Base rate')}
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Maximum Subsidy Cap (₹)')}</AppText>
            <TextInput
              style={styles.input}
              value={maxCap}
              onChangeText={setMaxCap}
              keyboardType="numeric"
              placeholder={t('Upper cap')}
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Unit Category')}</AppText>
            <View style={styles.toggleContainer}>
              {(['General', 'Priority (Women / SC-ST / Hills)'] as UnitCategory[]).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.toggleButton, unitCategory === category && styles.toggleActive]}
                  onPress={() => setUnitCategory(category)}
                >
                  <AppText style={[styles.toggleText, unitCategory === category && styles.toggleTextActive]}>
                    {category === 'General' ? t('General') : t('Priority')}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            <AppText style={styles.helperText}>{subsidyHint}</AppText>
          </View>

          <AppButton
            label={t('Estimate Subsidy')}
            onPress={calculateSubsidy}
            style={styles.calculateButton}
            labelStyle={styles.calculateButtonText}
            tone="secondary"
          />
        </View>

        {result && (
          <View style={styles.resultCard}>
            <AppText style={styles.resultTitle}>{t('Eligible Support')}</AppText>
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Calculated Subsidy')}</AppText>
              <AppText style={styles.resultValue} translate={false}>
                {formatted(result.subsidy)}
              </AppText>
            </View>
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Subsidy after Cap')}</AppText>
              <AppText style={styles.resultValue} translate={false}>
                {formatted(result.cappedSubsidy)}
              </AppText>
            </View>
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Net Investment (after subsidy)')}</AppText>
              <AppText style={styles.resultValue} translate={false}>
                {formatted(result.netInvestment)}
              </AppText>
            </View>
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>{t('Effective Rate Considered')}</AppText>
              <AppText style={styles.resultValue} translate={false}>
                {result.effectiveRate.toFixed(1)}%
              </AppText>
            </View>
            <AppText style={styles.caption}>{t('Use these figures while preparing DPR or uploading subsidy evidence.')}</AppText>
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
    helperText: {
      fontSize: 12,
      color: theme.colors.subtext,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 4,
      gap: 6,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
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
    caption: {
      fontSize: 12,
      color: theme.colors.subtext,
    },
  });
