import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useT } from 'lingo.dev/react';

type LoanBurden = 'No' | 'Yes';

type EligibilityResult = {
  score: number;
  verdict: 'Likely Approved' | 'Needs Clarification' | 'High Risk';
  summaryKey: 'eligibility.summary.strong' | 'eligibility.summary.medium' | 'eligibility.summary.weak';
  recommendationKeys: (
    | 'eligibility.rec.improve-score'
    | 'eligibility.rec.boost-revenue'
    | 'eligibility.rec.noc'
    | 'eligibility.rec.vintage'
  )[];
};

const { width } = Dimensions.get('window');

export const EligibilityPredictionScreen = ({ navigation }: any) => {
  const t = useT();
  const [loanAmount, setLoanAmount] = useState('300000');
  const [monthlyRevenue, setMonthlyRevenue] = useState('95000');
  const [creditScore, setCreditScore] = useState('720');
  const [businessVintage, setBusinessVintage] = useState('3');
  const [existingLoans, setExistingLoans] = useState<LoanBurden>('No');
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const helperCopy = useMemo(
    () =>
      existingLoans === 'Yes'
        ? t('Keep repayment history handy — officers check DSCR when other loans exist.')
        : t('Great! Low leverage improves eligibility.'),
    [existingLoans, t]
  );

  const computeEligibility = () => {
    const amount = parseFloat(loanAmount);
    const revenue = parseFloat(monthlyRevenue);
    const score = parseFloat(creditScore);
    const vintage = parseFloat(businessVintage);

    if ([amount, revenue, score, vintage].some((value) => Number.isNaN(value) || value <= 0)) {
      setResult(null);
      return;
    }

    let aggregate = 50;

    if (score >= 760) aggregate += 25;
    else if (score >= 700) aggregate += 18;
    else if (score >= 650) aggregate += 8;
    else aggregate -= 10;

    if (revenue >= amount / 15) aggregate += 18;
    else if (revenue >= amount / 20) aggregate += 10;
    else aggregate -= 6;

    if (vintage >= 5) aggregate += 12;
    else if (vintage >= 3) aggregate += 6;
    else aggregate -= 8;

    aggregate += existingLoans === 'Yes' ? -10 : 8;

    const boundedScore = Math.max(10, Math.min(aggregate, 100));
    let verdict: EligibilityResult['verdict'];
    let summaryKey: EligibilityResult['summaryKey'];
    const recommendationKeys: EligibilityResult['recommendationKeys'] = [];

    if (boundedScore >= 80) {
      verdict = 'Likely Approved';
      summaryKey = 'eligibility.summary.strong';
    } else if (boundedScore >= 60) {
      verdict = 'Needs Clarification';
      summaryKey = 'eligibility.summary.medium';
    } else {
      verdict = 'High Risk';
      summaryKey = 'eligibility.summary.weak';
    }

    if (score < 700) recommendationKeys.push('eligibility.rec.improve-score');
    if (revenue < amount / 15) recommendationKeys.push('eligibility.rec.boost-revenue');
    if (existingLoans === 'Yes') recommendationKeys.push('eligibility.rec.noc');
    if (vintage < 3) recommendationKeys.push('eligibility.rec.vintage');

    setResult({ score: boundedScore, verdict, summaryKey, recommendationKeys });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient colors={['#4C1D95', '#6D28D9']} style={styles.gradientHeader} />
        <View style={styles.waveContainer}>
          <Svg height="100" width={width} viewBox="0 0 1440 320" style={styles.wave}>
            <Path
              fill="#F3F4F6"
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
          <AppText style={styles.headerTitle}>{t('Eligibility Prediction')}</AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Loan Amount Needed (₹)')}</AppText>
            <TextInput
              style={styles.input}
              value={loanAmount}
              onChangeText={setLoanAmount}
              keyboardType="numeric"
              placeholder={t('Requested amount')}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Monthly Revenue (₹)')}</AppText>
            <TextInput
              style={styles.input}
              value={monthlyRevenue}
              onChangeText={setMonthlyRevenue}
              keyboardType="numeric"
              placeholder={t('Average monthly sales')}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Credit Score')}</AppText>
            <TextInput
              style={styles.input}
              value={creditScore}
              onChangeText={setCreditScore}
              keyboardType="numeric"
              placeholder={t('CIBIL or equivalent')}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Business Vintage (years)')}</AppText>
            <TextInput
              style={styles.input}
              value={businessVintage}
              onChangeText={setBusinessVintage}
              keyboardType="numeric"
              placeholder={t('Years in operation')}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{t('Other Active Loans')}</AppText>
            <View style={styles.toggleContainer}>
              {(['No', 'Yes'] as LoanBurden[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.toggleButton, existingLoans === option && styles.toggleActive]}
                  onPress={() => setExistingLoans(option)}
                >
                  <AppText style={[styles.toggleText, existingLoans === option && styles.toggleTextActive]}>
                    {t(option)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            <AppText style={styles.helperText}>{helperCopy}</AppText>
          </View>

          <AppButton
            label={t('Predict Eligibility')}
            onPress={computeEligibility}
            style={styles.calculateButton}
            labelStyle={styles.calculateButtonText}
          />
        </View>

        {result && (
          <View style={styles.resultCard}>
            <AppText style={styles.resultTitle}>{t(result.verdict)}</AppText>
            <AppText style={styles.scoreLabel}>{`${t('Composite score')}: ${result.score}/100`}</AppText>
            <AppText style={styles.summaryText}>{t(result.summaryKey)}</AppText>

            {result.recommendationKeys.length > 0 && (
              <View style={styles.listContainer}>
                {result.recommendationKeys.map((item) => (
                  <View style={styles.listItem} key={item}>
                    <View style={styles.bullet} />
                    <AppText style={styles.listText}>{t(item)}</AppText>
                  </View>
                ))}
              </View>
            )}
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#7C3AED',
    marginTop: 10,
    borderRadius: 12,
  },
  calculateButtonText: {
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 18,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
});
