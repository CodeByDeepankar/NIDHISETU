import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useT } from 'lingo.dev/react';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppTheme } from '@/constants/theme';

export const ContactOfficerScreen = ({ navigation }: any) => {
  const t = useT();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const officer = {
    name: 'Rajesh Gupta',
    role: 'Nodal Officer',
    district: 'South Delhi',
    phone: '+91 98765 00000',
    email: 'rajesh.gupta@nidhi.gov.in',
    officeAddress: 'District Industries Centre, Okhla Phase III, New Delhi - 110020',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  };

  const handleCall = () => {
    Linking.openURL(`tel:${officer.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${officer.email}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.icon} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{t('Contact Officer')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.profileSection}>
            <Image source={{ uri: officer.avatar }} style={styles.avatar} />
            <AppText style={styles.name} translate={false}>{officer.name}</AppText>
            <AppText style={styles.role}>{t(officer.role)}</AppText>
            <View style={styles.badge}>
              <AppText style={styles.badgeText} translate={false}>{officer.district}</AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={theme.colors.subtext} />
              <AppText style={styles.infoText} translate={false}>{officer.phone}</AppText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.subtext} />
              <AppText style={styles.infoText} translate={false}>{officer.email}</AppText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={theme.colors.subtext} />
              <AppText style={styles.infoText} translate={false}>{officer.officeAddress}</AppText>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <AppButton 
              label={t('Call Officer')}
              onPress={handleCall} 
              icon="phone"
              tone="primary"
            />
            <AppButton 
              label={t('Send Email')}
              onPress={handleEmail} 
              variant="outline"
              tone="primary"
              icon="email-outline"
            />
          </View>
        </View>

        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={32} color={theme.colors.primary} />
          <AppText style={styles.helpTitle}>{t('Need more help?')}</AppText>
          <AppText style={styles.helpText}>
            {t('You can also visit the nearest Common Service Centre (CSC) for assistance with your application.')}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
  backButton: {
    padding: 8,
  },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    content: {
      padding: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 20,
    },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    role: {
      fontSize: 16,
      color: theme.colors.subtext,
      marginBottom: 12,
    },
    badge: {
      backgroundColor: theme.mode === 'dark' ? `${theme.colors.primary}33` : theme.colors.primaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    divider: {
      width: '100%',
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginBottom: 20,
    },
    infoSection: {
      width: '100%',
      gap: 16,
      marginBottom: 24,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    actionButtons: {
      width: '100%',
      gap: 12,
    },
    helpCard: {
      backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceVariant : theme.colors.infoContainer,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    helpText: {
      fontSize: 14,
      color: theme.colors.subtext,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
