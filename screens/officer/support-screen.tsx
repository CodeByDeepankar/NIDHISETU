import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';

type FaqKey = 'password' | 'beneficiary' | 'sync' | 'supervisor';

const faqs: Record<FaqKey, { title: string; steps: string[] }> = {
  password: {
    title: 'How to reset password?',
    steps: [
      'Open Settings → Security → Change password/PIN.',
      'Enter your current password, then set a new one.',
      'Use at least 6 characters with numbers and a symbol.',
    ],
  },
  beneficiary: {
    title: 'How to update beneficiary details?',
    steps: [
      'Go to Beneficiaries and select the beneficiary record.',
      'Tap Edit and update address, contact, or documents.',
      'Save changes and sync when online to update HQ.',
    ],
  },
  sync: {
    title: 'App is not syncing offline data?',
    steps: [
      'Check network and keep the app open during sync.',
      'Go to Sync Status and tap Retry sync.',
      'If pending items remain, log out/in to refresh session.',
    ],
  },
  supervisor: {
    title: 'How to contact supervisor?',
    steps: [
      'Open Support and choose Helpline or WhatsApp.',
      'Share your officer ID and task reference.',
      'Escalations are routed to your assigned supervisor.',
    ],
  },
};

export const SupportScreen = () => {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState<FaqKey | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return Object.entries(faqs);
    const term = search.toLowerCase();
    return Object.entries(faqs).filter(([, value]) => value.title.toLowerCase().includes(term));
  }, [search]);

  const toggleFaq = (key: FaqKey) => setExpanded((prev) => (prev === key ? null : key));

  const quickActions = [
    {
      key: 'helpline',
      title: 'Helpline',
      detail: '1800-123-4567',
      availability: 'Available 9 AM – 6 PM',
      icon: 'phone',
      actionLabel: 'Call Now',
      onPress: () => Alert.alert('Calling helpline', 'Dial 1800-123-4567'),
    },
    {
      key: 'email',
      title: 'Email Support',
      detail: 'support@nidhisetu.gov.in',
      availability: 'Response time: 24×7',
      icon: 'email',
      actionLabel: 'Send Email',
      onPress: () => Alert.alert('Compose email', 'support@nidhisetu.gov.in'),
    },
    {
      key: 'whatsapp',
      title: 'WhatsApp Chat',
      detail: '+91 98765 43210',
      availability: 'Replies within 10 minutes',
      icon: 'whatsapp',
      actionLabel: 'Start Chat',
      onPress: () => Alert.alert('Open WhatsApp', '+91 98765 43210'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <WaveHeader title="Support" subtitle="We're here to help you anytime." height={160} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topCopy}>
          <AppText variant="titleLarge" weight="700" color="text" style={styles.heading}>
            Support
          </AppText>
          <AppText variant="bodyMedium" color="muted">
            We’re here to help you anytime.
          </AppText>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <View key={item.key} style={[styles.quickCard, { backgroundColor: theme.colors.surface }]}> 
              <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.primary}12` }]}> 
                <AppIcon name={item.icon as any} size={32} color="primary" />
              </View>
              <AppText variant="titleMedium" weight="700" color="text" style={{ fontSize: 18 }}>
                {item.title}
              </AppText>
              <AppText variant="bodyMedium" weight="600" color="text">{item.detail}</AppText>
              <AppText variant="bodySmall" color="muted" style={{ marginTop: 2 }}>
                {item.availability}
              </AppText>
              <AppButton
                label={item.actionLabel}
                variant="primary"
                onPress={item.onPress}
                compact
                style={{ alignSelf: 'stretch', marginTop: 8 }}
              />
            </View>
          ))}
        </View>

        <View style={[styles.searchCard, { backgroundColor: theme.colors.surface }]}> 
          <InputField
            label="Search FAQs"
            placeholder="Search FAQs (password, sync, update details…)"
            value={search}
            onChangeText={setSearch}
            leftIcon="magnify"
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.sectionHeader}>
            <AppText variant="titleMedium" weight="700" color="text" style={{ fontSize: 18 }}>
              Frequently Asked Questions
            </AppText>
            <AppText variant="bodySmall" color="muted">Tap to expand and view steps</AppText>
          </View>

          {filteredFaqs.map(([key, value]) => {
            const isOpen = expanded === key;
            return (
              <View key={key} style={styles.faqItem}>
                <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(key as FaqKey)}>
                  <View style={styles.faqTitleRow}>
                    <AppIcon name={isOpen ? 'chevron-down' : 'chevron-right'} size={18} color="primary" />
                    <AppText variant="bodyMedium" weight="700" color="text" style={{ fontSize: 16 }}>
                      {value.title}
                    </AppText>
                  </View>
                  <AppIcon name={isOpen ? 'minus-circle-outline' : 'plus-circle-outline'} size={20} color="muted" />
                </TouchableOpacity>
                {isOpen ? (
                  <View style={styles.faqBody}>
                    {value.steps.map((step, idx) => (
                      <View key={idx} style={styles.bulletRow}>
                        <View style={[styles.bulletDot, { backgroundColor: theme.colors.primary }]} />
                        <AppText variant="bodySmall" color="text" style={{ flex: 1 }}>
                          {step}
                        </AppText>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => Alert.alert('Support', 'We will connect you with support')}>
                      <AppText variant="bodySmall" weight="700" color="primary" style={{ marginTop: 8 }}>
                        Still need help? Contact Support
                      </AppText>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.sectionHeader}>
            <AppText variant="titleMedium" weight="700" color="text" style={{ fontSize: 18 }}>
              User Manual
            </AppText>
            <AppText variant="bodySmall" color="muted">Download PDF or watch the tutorial</AppText>
          </View>
          <View style={styles.manualRow}>
            <AppButton
              label="Download PDF"
              variant="outline"
              icon="file-pdf-box"
              onPress={() => Alert.alert('Download', 'Downloading User Manual PDF')}
              style={{ flex: 1 }}
            />
            <AppButton
              label="Watch Tutorial"
              variant="ghost"
              icon="play-circle"
              onPress={() => Alert.alert('Watch tutorial', 'Opening video guide')}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 20, paddingBottom: 48 },
  topCopy: { gap: 4 },
  heading: { fontSize: 22 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    flexGrow: 1,
    minWidth: '48%',
    borderRadius: 22,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: { gap: 4 },
  faqItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 10,
    gap: 6,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  faqTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  faqBody: { gap: 6, paddingLeft: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  manualRow: { flexDirection: 'row', gap: 12 },
});
