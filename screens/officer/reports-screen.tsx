import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

export const ReportsScreen = () => {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <AppText variant="headlineMedium" color="text">Reports</AppText>
      <AppText variant="bodyMedium" color="muted">Monthly summary, approvals vs rejections and other analytics.</AppText>
      <View style={{ marginTop: 16 }}>
        <AppButton label="Download PDF" icon="download" />
        <AppButton label="Export CSV" icon="download" variant="secondary" />
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
