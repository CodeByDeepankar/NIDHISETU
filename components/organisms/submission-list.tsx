import type { FlatListProps } from 'react-native';
import { FlatList, RefreshControl, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { SubmissionCard } from '@/components/molecules/submission-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { SubmissionEvidence } from '@/types/entities';

export interface SubmissionListProps {
  submissions: SubmissionEvidence[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onPressView?: (submission: SubmissionEvidence) => void;
  onPressRetry?: (submission: SubmissionEvidence) => void;
  onPressApprove?: (submission: SubmissionEvidence) => void;
  onPressReject?: (submission: SubmissionEvidence) => void;
  role?: 'beneficiary' | 'reviewer';
  ListHeaderComponent?: FlatListProps<SubmissionEvidence>['ListHeaderComponent'];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export const SubmissionList = ({
  submissions,
  refreshing,
  onRefresh,
  role,
  ListHeaderComponent,
  contentContainerStyle,
  style,
  ...handlers
}: SubmissionListProps) => {
  const theme = useAppTheme();

  return (
    <FlatList
      style={style}
      data={submissions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        { gap: theme.spacing.md, paddingBottom: 120, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
        contentContainerStyle,
      ]}
      renderItem={({ item }) => (
        <SubmissionCard submission={item} role={role} {...handlers} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <AppText variant="titleMedium" color="muted">
            No submissions yet
          </AppText>
          <AppText variant="bodyMedium" color="muted">
            Capture and upload evidence to see them here.
          </AppText>
        </View>
      }
      refreshControl={<RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh ?? (() => undefined)} />}
    />
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
});
