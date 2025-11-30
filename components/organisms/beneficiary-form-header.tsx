import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface BeneficiaryFormHeaderProps {
  onBack: () => void;
  completionPercent: number;
}

export const BeneficiaryFormHeader = ({ onBack, completionPercent }: BeneficiaryFormHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <AppIcon name="arrow-left" size={24} color="onPrimary" />
          </TouchableOpacity>
          <AppText variant="titleMedium" color="onPrimary" weight="600">
            New Application
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <AppText variant="headlineMedium" color="onPrimary" weight="700">
            Add Beneficiary
          </AppText>
          <AppText variant="bodyMedium" color="onPrimary" style={{ opacity: 0.9 }}>
            Complete the form to register a new beneficiary.
          </AppText>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <AppText variant="labelSmall" color="onPrimary">
              Form Completion
            </AppText>
            <AppText variant="labelSmall" color="onPrimary" weight="700">
              {completionPercent}%
            </AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${completionPercent}%`, backgroundColor: 'white' }]} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradient: {
    paddingTop: 60, // Safe area
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 4,
  },
  progressContainer: {
    gap: 8,
    marginTop: 8,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
