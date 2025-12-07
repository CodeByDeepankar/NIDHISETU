import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/state/authStore';
import { AppText } from '@/components/atoms/app-text';
import { useT } from 'lingo.dev/react';

const { width } = Dimensions.get('window');

export const BeneficiaryProfileScreen = ({ navigation }: any) => {
  const profile = useAuthStore((state) => state.profile);
  const t = useT();

  // Force refresh image by appending timestamp if avatarUrl exists
  const avatarUrl = useMemo(() => {
      if (!profile?.avatarUrl) return null;
      // If url already has query params, append with &, else ?
      const separator = profile.avatarUrl.includes('?') ? '&' : '?';
      return `${profile.avatarUrl}${separator}refresh=${Date.now()}`; // Force refresh on mount
  }, [profile?.avatarUrl]);

  // Mock data if profile is missing some fields
    const userProfile = useMemo(() => ({
        name: profile?.name || 'Ramesh Kumar',
        id: profile?.id || 'BEN-2024-001',
        loanCategory: (profile as any)?.scheme || 'PM SVANidhi - Street Vendor',
        phone: profile?.mobile || '+91 98765 43210',
        email: (profile as any)?.email || 'ramesh.kumar@example.com',
        address: (profile as any)?.village
            ? `${(profile as any).village}, ${(profile as any).district}`
            : '123, Market Road, Sector 4, New Delhi - 110001',
        kycStatus: (profile as any)?.kycStatus || 'Verified',
        avatar: avatarUrl || `https://randomuser.me/api/portraits/men/${parseInt(profile?.mobile?.slice(-2) || '32') % 100}.jpg`, // Placeholder
    }), [profile, avatarUrl]);

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
                        fill="#F5F5F5"
                        d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"
                    />
                </Svg>
            </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
                <Image source={{ uri: userProfile.avatar }} style={styles.profileImage} />
                <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
            </View>

            {/* Name and ID */}
            <View style={styles.nameSection}>
                <AppText style={styles.nameText} translate={false}>
                    {userProfile.name}
                </AppText>
                <AppText style={styles.idText} translate={false}>
                    {`${t('ID')}: ${userProfile.id}`}
                </AppText>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
                <InfoRow icon="briefcase-outline" label={t('Loan Category')} value={userProfile.loanCategory} />
                <InfoRow icon="call-outline" label={t('Phone')} value={userProfile.phone} />
                <InfoRow icon="mail-outline" label={t('Email')} value={userProfile.email} />
                <InfoRow icon="location-outline" label={t('Address')} value={userProfile.address} />
                <InfoRow
                    icon="shield-checkmark-outline"
                    label={t('KYC Status')}
                    value={t(userProfile.kycStatus, userProfile.kycStatus)}
                    isStatus
                />
            </View>
        </ScrollView>

        {/* Floating Header Buttons */}
        <SafeAreaView edges={['top']} style={styles.floatingHeader}>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>{t('My Profile')}</AppText>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
                    <Ionicons name="create-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
        </View>
    );
};

const InfoRow = ({ icon, label, value, isStatus }: any) => (
    <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#008080" />
        </View>
        <View style={styles.infoContent}>
            <AppText style={styles.infoLabel}>{label}</AppText>
            <AppText style={[styles.infoValue, isStatus && styles.statusValue]} translate={false}>
                {value}
            </AppText>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 240,
        zIndex: 0,
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    gradientHeader: {
        flex: 1,
        paddingBottom: 40, // Space for wave
    },
    safeAreaHeader: {
        flex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    backButton: {
        padding: 8,
    },
    editButton: {
        padding: 8,
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
    scrollContent: {
        paddingTop: 160, // Push content down to overlap header correctly
        paddingBottom: 40,
        alignItems: 'center',
        zIndex: 10,
    },
    profileImageContainer: {
        // No negative margin needed with padding strategy, or adjust slightly if needed
        marginBottom: 16,
        position: 'relative',
        zIndex: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'white',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    nameSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    idText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    infoSection: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    statusValue: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    actionSection: {
        width: '90%',
    }
});
