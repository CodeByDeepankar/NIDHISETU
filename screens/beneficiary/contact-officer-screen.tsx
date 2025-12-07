import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useT } from 'lingo.dev/react';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';

export const ContactOfficerScreen = ({ navigation }: any) => {
  const t = useT();
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
          <Ionicons name="arrow-back" size={24} color="#333" />
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
              <Ionicons name="call-outline" size={20} color="#666" />
              <AppText style={styles.infoText} translate={false}>{officer.phone}</AppText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <AppText style={styles.infoText} translate={false}>{officer.email}</AppText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <AppText style={styles.infoText} translate={false}>{officer.officeAddress}</AppText>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <AppButton 
              label={t('Call Officer')}
              onPress={handleCall} 
              style={styles.callButton}
              icon="phone"
            />
            <AppButton 
              label={t('Send Email')}
              onPress={handleEmail} 
              style={styles.emailButton}
              textStyle={{ color: '#008080' }}
              icon="email-outline"
            />
          </View>
        </View>

        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={32} color="#008080" />
          <AppText style={styles.helpTitle}>{t('Need more help?')}</AppText>
          <AppText style={styles.helpText}>
            {t('You can also visit the nearest Common Service Centre (CSC) for assistance with your application.')}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#008080',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
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
    color: '#444',
    lineHeight: 20,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  callButton: {
    backgroundColor: '#008080',
  },
  emailButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#008080',
  },
  helpCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00695C',
    marginTop: 8,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 20,
  },
});
