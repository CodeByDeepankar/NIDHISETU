import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerTasks } from '@/hooks/use-officer-tasks';

export const VerificationTasksScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  
  const { tasks: submissions, isLoading, refetch, isRefetching } = useOfficerTasks();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const SubmissionCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={() => navigation.navigate('OfficerSubmissionDetail', { submission: item, beneficiaryId: item.beneficiaryId })}
    >
      <View style={styles.cardRow}>
        <Image 
          source={{ uri: item.thumbnailUrl || item.mediaUrl || 'https://placehold.co/100x100/png' }} 
          style={styles.thumbnail}
        />
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <AppText style={styles.assetName} numberOfLines={1}>{item.assetName}</AppText>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <AppText style={styles.timeText}>{new Date(item.submittedAt || item.capturedAt).toLocaleDateString()}</AppText>
            </View>
          </View>
          
          <AppText style={styles.beneficiaryName} numberOfLines={1}>
            {item.beneficiary?.fullName || 'Unknown Beneficiary'}
          </AppText>
          <AppText style={styles.villageName} numberOfLines={1}>
            {item.beneficiary?.village || 'Village N/A'}
          </AppText>

          <View style={styles.footerRow}>
             <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <AppText style={styles.statusText}>Pending Review</AppText>
             </View>
             
             <TouchableOpacity 
               style={styles.verifyButton}
               onPress={() => navigation.navigate('OfficerSubmissionDetail', { submission: item, beneficiaryId: item.beneficiaryId })}
             >
                <AppText style={styles.verifyButtonText}>Verify</AppText>
                <Ionicons name="arrow-forward" size={14} color="white" />
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <WaveHeader title="Verification Tasks" onBack={() => navigation.goBack()} />
      
      <View style={styles.contentContainer}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={submissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SubmissionCard item={item} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                <AppText style={styles.emptyText}>No pending verifications.</AppText>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    marginTop: 100,
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  beneficiaryName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  villageName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
