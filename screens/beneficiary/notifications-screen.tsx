import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useT } from 'lingo.dev/react';
import { AppText } from '@/components/atoms/app-text';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Loan Application Approved',
    message: 'Your loan application #LN-2024-001 has been approved by the officer.',
    date: '2 hours ago',
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'Document Verification Pending',
    message: 'Please upload your Aadhaar card for verification.',
    date: '1 day ago',
    read: true,
    type: 'warning'
  },
  {
    id: '3',
    title: 'New Scheme Available',
    message: 'Check out the new PM Vishwakarma scheme for artisans.',
    date: '2 days ago',
    read: true,
    type: 'info'
  }
];

export const NotificationsScreen = ({ navigation }: any) => {
  const t = useT();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) }]}>
        <Ionicons name={getIconName(item.type)} size={24} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <AppText style={styles.title}>{t(item.title)}</AppText>
          <AppText style={styles.date}>{t(item.date)}</AppText>
        </View>
        <AppText style={styles.message} numberOfLines={2}>{t(item.message)}</AppText>
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'info': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{t('Notifications')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <AppText style={styles.emptyText}>{t('No notifications yet')}</AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
