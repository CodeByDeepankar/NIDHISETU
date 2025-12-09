import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OfficerStackParamList } from '@/navigation/types';
import type { NavigationProp } from '@react-navigation/native';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent?: boolean;
}

const sampleSessions: Session[] = [
  { id: 'current', device: 'This device', location: 'Bhubaneswar, IN', lastActive: 'Just now', isCurrent: true },
  { id: 'a52', device: 'Samsung Galaxy A52', location: 'Cuttack, IN', lastActive: '2 hours ago' },
  { id: 'web', device: 'Web dashboard', location: 'Kolkata, IN', lastActive: 'Yesterday' },
];

const SessionCard = ({ session, onRevoke, busy }: { session: Session; onRevoke: (id: string) => void; busy: boolean }) => {
  const theme = useAppTheme();
  const badgeBg = session.isCurrent ? `${theme.colors.success}22` : `${theme.colors.warning}22`;
  const badgeText = session.isCurrent ? theme.colors.success : theme.colors.warning;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <AppIcon name={session.isCurrent ? 'cellphone' : 'laptop'} size={18} color="primary" />
          <AppText variant="titleSmall" weight="700" color="text">
            {session.device}
          </AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}> 
          <AppText variant="labelSmall" weight="700" style={{ color: badgeText }}>
            {session.isCurrent ? 'Current' : 'Remote'}
          </AppText>
        </View>
      </View>
      <View style={styles.metaRow}>
        <AppIcon name="map-marker" size={16} color="muted" />
        <AppText variant="bodySmall" color="muted">{session.location}</AppText>
      </View>
      <View style={styles.metaRow}>
        <AppIcon name="clock-outline" size={16} color="muted" />
        <AppText variant="bodySmall" color="muted">Last active: {session.lastActive}</AppText>
      </View>
      {!session.isCurrent ? (
        <AppButton
          label="Revoke access"
          variant="outline"
          compact
          onPress={() => onRevoke(session.id)}
          loading={busy}
          disabled={busy}
          style={{ marginTop: 8 }}
        />
      ) : (
        <AppText variant="bodySmall" color="muted" style={{ marginTop: 8 }}>
          This device stays signed in.
        </AppText>
      )}
    </View>
  );
};

export const ActiveSessionsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<OfficerStackParamList>>();
  const [sessions, setSessions] = useState<Session[]>(sampleSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const otherSessions = useMemo(() => sessions.filter((s) => !s.isCurrent), [sessions]);

  const revokeSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    Alert.alert('Revoke access', `Sign out ${session.device}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: () => {
          setRevokingId(id);
          setTimeout(() => {
            setSessions((prev) => prev.filter((s) => s.id !== id));
            setRevokingId(null);
          }, 400);
        },
      },
    ]);
  };

  const revokeAll = () => {
    if (otherSessions.length === 0) return;
    Alert.alert('Sign out others', 'Sign out of all other devices?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          setRevokingId('bulk');
          setTimeout(() => {
            setSessions((prev) => prev.filter((s) => s.isCurrent));
            setRevokingId(null);
          }, 400);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <WaveHeader title="Active sessions" subtitle="Manage signed-in devices" height={150} />
      <View style={styles.headerAction}>
        <AppButton
          label="Close"
          compact
          variant="ghost"
          icon="close"
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 8 }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}> 
          <View style={styles.summaryRow}>
            <AppIcon name="shield-check" size={18} color="success" />
            <AppText variant="bodyMedium" weight="700" color="text">
              Stay in control of your devices
            </AppText>
          </View>
          <AppText variant="bodySmall" color="muted">
            You can revoke any unfamiliar session. Your current device will remain signed in.
          </AppText>
        </View>

        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} onRevoke={revokeSession} busy={revokingId === session.id} />
        ))}

        <View style={{ gap: 10 }}>
          <AppButton
            label="Sign out of other devices"
            variant="primary"
            icon="logout"
            onPress={revokeAll}
            disabled={otherSessions.length === 0}
            loading={revokingId === 'bulk'}
          />
          <AppButton label="Back to settings" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerAction: { position: 'absolute', top: 48, right: 16 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  summaryCard: {
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: {
    padding: 14,
    borderRadius: 14,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default ActiveSessionsScreen;
