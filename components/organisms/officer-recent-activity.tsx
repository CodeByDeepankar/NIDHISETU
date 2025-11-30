import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  isSynced: boolean;
}

const ActivityNode = ({ item, isLast }: { item: ActivityItem; isLast: boolean }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.nodeContainer}>
      <View style={styles.timelineColumn}>
        <View style={[styles.dot, { backgroundColor: theme.colors.secondary }]} />
        {!isLast && <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />}
      </View>
      <View style={[styles.contentCard, { backgroundColor: theme.colors.card }]}>
        <AppText variant="bodyMedium" color="text" weight="500">
          {item.title}
        </AppText>
        <View style={styles.metaRow}>
          <AppText variant="labelSmall" color="muted">
            {item.timestamp}
          </AppText>
          {item.isSynced && (
            <>
              <AppText variant="labelSmall" color="muted">
                •
              </AppText>
              <AppText variant="labelSmall" color="primary">
                Auto-synced
              </AppText>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export const OfficerRecentActivity = () => {
  const theme = useAppTheme();

  const activities: ActivityItem[] = [
    { id: '1', title: 'Verification completed for Rajesh Kumar', timestamp: '2:15 PM', isSynced: true },
    { id: '2', title: 'New beneficiary assigned: Amit Singh', timestamp: '12:45 PM', isSynced: true },
    { id: '3', title: 'Document upload failed for Priya', timestamp: '11:30 AM', isSynced: false },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surfaceVariant, theme.colors.background]}
        style={styles.header}
      >
        <AppText variant="titleMedium" color="text">
          Recent Activity
        </AppText>
        <TouchableOpacity>
          <AppText variant="labelMedium" color="primary">
            Mark all as read
          </AppText>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.list}>
        {activities.map((item, index) => (
          <ActivityNode key={item.id} item={item} isLast={index === activities.length - 1} />
        ))}
      </View>

      <TouchableOpacity style={styles.loadMore}>
        <AppText variant="labelMedium" color="muted">
          View Earlier Activity
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  nodeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    opacity: 0.3,
  },
  contentCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  loadMore: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
