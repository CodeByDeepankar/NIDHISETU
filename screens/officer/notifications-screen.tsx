import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FlatList, StyleSheet, View } from 'react-native';

const sample = new Array(6).fill(null).map((_, i) => ({ id: String(i), title: `System update ${i + 1}`, body: 'Important update regarding verification flows.' }));

export const NotificationsScreen = () => {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <AppText variant="headlineMedium" color="text">Notifications</AppText>
      <FlatList
        contentContainerStyle={{ gap: 12, paddingTop: 12 }}
        data={sample}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}>
            <AppText variant="titleSmall" color="text">{item.title}</AppText>
            <AppText variant="bodySmall" color="muted">{item.body}</AppText>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 12,
    gap: 6,
  },
});
