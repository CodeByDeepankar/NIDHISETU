import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { BrandLogo } from '@/components/atoms/brand-logo';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AuthStackParamList } from '@/navigation/types';

export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessibilityLabel="Welcome screen"
    >
      <BrandLogo size={96} align="left" />
      <View style={styles.hero}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80' }}
          style={[styles.heroImage, { borderRadius: theme.radii.lg }]}
        />
      </View>
      <View style={styles.content}>
        <AppText variant="titleMedium" color="primary">
          Loan Utilization Verification
        </AppText>
        <AppText variant="headlineLarge" color="text" style={styles.headline}>
          Capture, Sync & Verify assets on the field
        </AppText>
        <AppText variant="bodyMedium" color="muted">
          Upload geo-tagged media proof even while offline. Officers and reviewers can approve remotely.
        </AppText>
        <AppButton label="Get Started" onPress={() => navigation.navigate('MobileInput')} style={styles.cta} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  content: {
    gap: 12,
  },
  headline: {
    marginTop: 12,
  },
  cta: {
    marginTop: 12,
  },
});
