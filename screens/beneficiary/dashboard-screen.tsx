import { useCallback, useEffect, useMemo, useState } from 'react';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useAppLocale, useT } from 'lingo.dev/react';

import { AppIcon } from '@/components/atoms/app-icon';
import type { IconName } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import { InfoCard } from '@/components/molecules/info-card';
import { useAuthStore } from '@/state/authStore';
import { governmentUpdatesClient, type GovernmentUpdate } from '@/services/ai/governmentUpdates';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import { useTheme } from '@/hooks/use-theme';

type BeneficiaryNavigation = DrawerNavigationProp<BeneficiaryDrawerParamList>;

const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
] as const;

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
type CalculatorRoute = 'EmiCalculator' | 'SubsidyCalculator' | 'EligibilityPrediction';

type MenuItemKey = 'trackLoan' | 'uploadEvidence' | 'geoCamera' | 'notifications' | 'contactOfficer' | 'myProfile';

const menuItems: Array<{ key: MenuItemKey; title: string; icon: IconName; color: string }> = [
    { key: 'trackLoan', title: 'Track Loan', icon: 'clipboard-text-clock-outline', color: '#A855F7' },
    { key: 'uploadEvidence', title: 'Upload Evidence', icon: 'cloud-upload-outline', color: '#A855F7' },
    { key: 'geoCamera', title: 'Geo-Camera', icon: 'camera-marker-outline', color: '#A855F7' },
    { key: 'notifications', title: 'Notifications', icon: 'bell-outline', color: '#A855F7' },
    { key: 'contactOfficer', title: 'Contact Officer', icon: 'card-account-phone-outline', color: '#A855F7' },
    { key: 'myProfile', title: 'My Profile', icon: 'account-circle-outline', color: '#A855F7' },
];

const trainingItems = [
    { title: 'Job programs', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80' },
    { title: 'Learning videos', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
    { title: 'Government skill centres', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80' },
];

const calculatorItems: Array<{ title: string; desc: string; image: string; route: CalculatorRoute }> = [
    {
        title: 'EMI calculator',
        desc: 'Plan your repayment.',
        image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
        route: 'EmiCalculator',
    },
    {
        title: 'Subsidy calculator',
        desc: 'Check your benefits.',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        route: 'SubsidyCalculator',
    },
    {
        title: 'Eligibility prediction',
        desc: 'Know your chances.',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
        route: 'EligibilityPrediction',
    },
];

const grievanceItems = [
    {
        title: 'Submit issue',
        desc: 'Face any problem? Let us know.',
        image: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=800&q=80',
    },
    {
        title: 'Track complaint',
        desc: 'Check status of your tickets.',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    },
    {
        title: 'Officer response',
        desc: 'View replies from officials.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    },
];

export const BeneficiaryDashboardScreen = () => {
    const navigation = useNavigation<BeneficiaryNavigation>();
    const { mode, toggleTheme } = useTheme();
    const profile = useAuthStore((state) => state.profile);
    const t = useT();
    const { locale, setLocale } = useAppLocale();

    const defaultGovUpdates: GovernmentUpdate[] = [
        {
            title: 'MSME Digi-SIP launches AI monitoring',
            description: 'DIN laterals connect NIDHI SETU dashboards with state facilitation cells to fast-track FY25 claims.',
            imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
        },
        {
            title: 'Green credit window for rural clusters',
            description: 'SIDBI adds 4% interest subsidy for solar-powered looms under the 2025 MSME decarbonisation package.',
            imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        },
    ];

    const [governmentUpdates, setGovernmentUpdates] = useState<GovernmentUpdate[]>(defaultGovUpdates);
    const [updatesLoading, setUpdatesLoading] = useState(false);
    const [updatesError, setUpdatesError] = useState<string | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [selectedUpdate, setSelectedUpdate] = useState<GovernmentUpdate | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const iconColor = mode === 'dark' ? '#F9FAFB' : '#333';
    const iconBackground = mode === 'dark' ? '#1F2937' : '#FFFFFF';

    const cardWidth = useMemo(() => {
        const width = Dimensions.get('window').width;
        return Math.max(220, Math.min(320, width - 80));
    }, []);

    const fetchGovernmentUpdates = useCallback(async (focusTopic?: string) => {
        setUpdatesLoading(true);
        setUpdatesError(null);
        try {
            const updates = await governmentUpdatesClient.fetchLatest(focusTopic);
            setGovernmentUpdates(updates);
            setLastUpdatedAt(new Date().toISOString());
        } catch (error) {
            console.error('Government updates fetch error:', error);
            setUpdatesError('Unable to refresh live policy feed. Showing cached briefs.');
        } finally {
            setUpdatesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGovernmentUpdates();
    }, [fetchGovernmentUpdates]);

    const lastUpdatedLabel = useMemo(() => {
        if (!lastUpdatedAt) return null;
        const date = new Date(lastUpdatedAt);
        return `${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • ${date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    }, [lastUpdatedAt]);

    const formatPublishedAt = useCallback((value?: string) => {
        if (!value) return t('Live policy brief');
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [t]);

    const openUpdateDetail = (item: GovernmentUpdate) => {
        setSelectedUpdate(item);
        setIsModalVisible(true);
        fetchGovernmentUpdates(item.title);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleLanguageSelect = (code: LanguageCode) => {
        setLocale(code);
        setLanguageModalVisible(false);
    };

        const handleMenuPress = (key: MenuItemKey) => {
        switch (key) {
            case 'trackLoan':
                    navigation.navigate('PreviousSubmissions' as never);
                    break;
            case 'uploadEvidence':
                    navigation.navigate('UploadEvidence' as never);
                    break;
            case 'geoCamera':
                    navigation.navigate('LoanEvidenceCamera' as never);
                    break;
            case 'notifications':
                    navigation.navigate('Notifications' as never);
                    break;
            case 'contactOfficer':
                    navigation.navigate('ContactOfficer' as never);
                    break;
            case 'myProfile':
                    navigation.navigate('BeneficiaryProfile' as never);
                    break;
                default:
                    console.warn('Unknown menu item:', key);
            }
        };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <AppIcon name="menu" size={28} color="#333" />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: profile?.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userDetails}>
                        <AppText style={styles.userName} numberOfLines={1}>
                            {profile?.name ?? 'Gokul Kumari'}
                        </AppText>
                        <AppText style={styles.greeting} numberOfLines={1}>
                            {t('Good morning')}
                        </AppText>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.iconButton, { backgroundColor: iconBackground }]}
                        accessibilityLabel="Toggle dark mode"
                    >
                        <AppIcon name={mode === 'light' ? 'weather-night' : 'white-balance-sunny'} size={22} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setLanguageModalVisible(true)}
                        style={[styles.iconButton, { backgroundColor: iconBackground }]}
                        accessibilityLabel="Change language"
                    >
                        <AppIcon name="earth" size={22} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Notifications' as never)}
                        style={[styles.iconButton, { backgroundColor: iconBackground }]}
                        accessibilityLabel="Notifications"
                    >
                        <AppIcon name="bell-outline" size={24} color={iconColor} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.key} style={styles.card} onPress={() => handleMenuPress(item.key)}>
                            <View style={styles.iconContainer}>
                                <AppIcon name={item.icon} size={32} color={item.color} />
                            </View>
                            <AppText style={styles.cardTitle}>{t(item.title)}</AppText>
                            <AppText style={styles.viewStatus}>{t('View Status')}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <AppText style={styles.sectionTitle}>{t('Government Updates')}</AppText>
                        <TouchableOpacity onPress={() => fetchGovernmentUpdates()} disabled={updatesLoading} style={styles.refreshButton}>
                            <AppIcon name="refresh" size={18} color={updatesLoading ? '#A1A1AA' : '#2563EB'} />
                            <AppText style={[styles.refreshText, updatesLoading && styles.refreshDisabled]}>
                                {updatesLoading ? t('Refreshing…') : t('Refresh')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                    {lastUpdatedLabel && (
                      <AppText style={styles.statusText}>
                        {t('Updated')} {lastUpdatedLabel}
                      </AppText>
                    )}
                    {updatesError && <AppText style={styles.errorText}>{t(updatesError)}</AppText>}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {governmentUpdates.map((item, index) => (
                            <View key={`${item.title}-${index}`} style={[styles.horizontalCardWrapper, { width: cardWidth }]}>
                                <InfoCard
                                    title={item.title}
                                    description={item.description}
                                    image={item.imageUrl}
                                    variant="standard"
                                    onPress={() => openUpdateDetail(item)}
                                />
                            </View>
                        ))}
                        {updatesLoading && (
                            <View style={[styles.horizontalCardWrapper, styles.loadingCard]}>
                                <ActivityIndicator color="#2563EB" />
                            </View>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>{t('Training & Skill Development')}</AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {trainingItems.map((item, index) => (
                            <View key={index} style={styles.horizontalCardWrapper}>
                                <InfoCard title={t(item.title)} image={item.image} variant="overlay" />
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>{t('Financial Calculator')}</AppText>
                    <View style={styles.verticalList}>
                        {calculatorItems.map((item, index) => (
                            <InfoCard
                                key={index}
                                title={t(item.title)}
                                description={t(item.desc)}
                                image={item.image}
                                variant="standard"
                                style={{ marginBottom: 16 }}
                                onPress={() => navigation.navigate(item.route)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>{t('Complaint / Grievance Redressal')}</AppText>
                    <View style={styles.verticalList}>
                        {grievanceItems.map((item, index) => (
                            <InfoCard
                                key={index}
                                title={t(item.title)}
                                description={t(item.desc)}
                                image={item.image}
                                variant="standard"
                                style={{ marginBottom: 16 }}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal visible={isModalVisible && Boolean(selectedUpdate)} transparent animationType="slide" onRequestClose={closeModal}>
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <AppText style={styles.modalTitle}>{t('Government Update')}</AppText>
                                    <TouchableOpacity onPress={closeModal}>
                                        <AppIcon name="close" size={22} color="#111827" />
                                    </TouchableOpacity>
                                </View>
                                {selectedUpdate && (
                                    <>
                                        <Image source={{ uri: selectedUpdate.imageUrl }} style={styles.modalImage} resizeMode="cover" />
                                        <AppText style={styles.modalUpdateTitle}>{selectedUpdate.title}</AppText>
                                        <AppText style={styles.modalMeta}>
                                            {selectedUpdate.source || t('MSME Ministry')} • {formatPublishedAt(selectedUpdate.publishedAt)}
                                        </AppText>
                                        <AppText style={styles.modalDescription}>{selectedUpdate.description}</AppText>
                                        <AppButton
                                            label={t('Get Similar Updates')}
                                            onPress={() => {
                                                fetchGovernmentUpdates(selectedUpdate.title);
                                                closeModal();
                                            }}
                                            style={styles.modalButton}
                                            labelStyle={styles.modalButtonLabel}
                                            icon="refresh"
                                        />
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.languageModalContent}>
                                <AppText style={styles.languageModalTitle}>{t('Choose your language')}</AppText>
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={[styles.languageOption, locale === lang.code && styles.languageOptionActive]}
                                        onPress={() => handleLanguageSelect(lang.code)}
                                    >
                                        <AppText style={styles.languageLabel}>{lang.label}</AppText>
                                        {locale === lang.code ? <AppIcon name="check" size={18} color="#22C55E" /> : null}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginLeft: 10,
    },
    userDetails: {
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        flexShrink: 1,
    },
    greeting: {
        fontSize: 12,
        color: '#666',
        flexShrink: 1,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },
    iconButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        position: 'relative',
        elevation: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        marginBottom: 10,
    },
    iconContainer: {
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    viewStatus: {
        fontSize: 10,
        color: '#999',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1F2937',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    refreshText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563EB',
    },
    refreshDisabled: {
        color: '#A1A1AA',
    },
    statusText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        marginBottom: 8,
    },
    horizontalScroll: {
        paddingRight: 20,
    },
    horizontalCardWrapper: {
        width: 280,
        marginRight: 16,
    },
    loadingCard: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalList: {
        gap: 0,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    modalImage: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        marginBottom: 16,
    },
    modalUpdateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    modalMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
    },
    modalButtonLabel: {
        textTransform: 'none',
        fontWeight: '600',
    },
    languageModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },
    languageModalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E7EB',
    },
    languageOptionActive: {
        borderColor: '#A855F7',
    },
    languageLabel: {
        fontSize: 14,
        color: '#1F2937',
    },
});
