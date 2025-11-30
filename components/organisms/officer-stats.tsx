import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

export const StatsRow = ({ stats }: { stats: { label: string; value: number }[] }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      {stats.map((s) => (
        <View key={s.label} style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}>
          <AppText variant="labelSmall" color="muted">
            {s.label}
          </AppText>
          <AppText variant="headlineMedium" color="text" weight="600">
            {s.value}
          </AppText>
        </View>
      ))}
    </View>
  );
};

export const QuickActions = ({ onAdd }: { onAdd: () => void }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.actions, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}>
      <View style={styles.actionRow}>
        <AppButton label="Add Beneficiary" icon="account-plus" onPress={onAdd} />
        <AppButton label="Scan Documents" icon="camera" variant="secondary" />
      </View>
      <View style={styles.actionRow}>
        <AppButton label="Start Verification" icon="playlist-check" />
        <AppButton label="Generate Report" icon="download" variant="secondary" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  actions: {
    padding: 12,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
