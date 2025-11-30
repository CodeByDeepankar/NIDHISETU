import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

export const SupportScreen = () => {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <AppText variant="headlineMedium" color="text">Support</AppText>
      <AppText variant="bodyMedium" color="muted">Contact support or view FAQs.</AppText>
      <View style={{ marginTop: 16 }}>
        <AppButton label="Contact Support" icon="phone" />
        <AppButton label="FAQ" icon="help-circle" variant="secondary" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
