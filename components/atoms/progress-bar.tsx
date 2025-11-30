import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

export const ProgressBar = ({ value = 0 }: { value?: number }) => {
  const theme = useAppTheme();
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.colors.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
