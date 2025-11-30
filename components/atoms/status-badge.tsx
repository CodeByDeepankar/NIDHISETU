import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';
import { AppText } from './app-text';

export const StatusBadge = ({ status }: { status: string }) => {
  const theme = useAppTheme();
  const tone = (status || '').toLowerCase();
  const colorMap: Record<string, string> = {
    pending: theme.colors.warningContainer,
    approved: theme.colors.successContainer,
    rejected: theme.colors.errorContainer,
    sanctioned: theme.colors.primaryContainer,
    overdue: theme.colors.errorContainer,
  };
  const textColorMap: Record<string, string> = {
    pending: theme.colors.warning,
    approved: theme.colors.success,
    rejected: theme.colors.error,
    sanctioned: theme.colors.primary,
    overdue: theme.colors.error,
  };
  const bg = colorMap[tone] ?? theme.colors.surfaceVariant;
  const fg = textColorMap[tone] ?? theme.colors.muted;
  return (
    <View style={[styles.container, { backgroundColor: bg, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }]}>
      <AppText variant="labelSmall" color={fg}>
        {status}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});
