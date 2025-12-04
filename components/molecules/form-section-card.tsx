import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface FormSectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormSectionCard = ({ title, subtitle, children, icon }: FormSectionCardProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
      <View style={styles.header}>
        {icon && <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceVariant }]}>{icon}</View>}
        <View style={styles.headerText}>
          <AppText variant="titleMedium" color="text" weight="600">
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="bodySmall" color="muted">
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
      <View
        style={[
          styles.divider,
          { backgroundColor: theme.colors.gradientEnd },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
