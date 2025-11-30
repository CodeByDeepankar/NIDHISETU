import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

interface VerificationProgressProps {
  percentage: number;
}

export const VerificationProgress = ({ percentage }: VerificationProgressProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="titleSmall">Verification Progress</AppText>
        <AppText variant="titleSmall" color="primary">{percentage}%</AppText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View 
            style={[
                styles.fill, 
                { 
                    width: `${percentage}%`, 
                    backgroundColor: theme.colors.primary 
                }
            ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
