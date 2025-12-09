import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';

const ZONES = [
  {
    id: 'zone-1',
    name: 'Old Town Market',
    level: 'High' as const,
    color: '#DC2626',
    coordinate: { latitude: 28.6139, longitude: 77.209 },
    message: 'Govt may apply special schemes in this zone.',
  },
  {
    id: 'zone-2',
    name: 'Riverfront Cluster',
    level: 'Medium' as const,
    color: '#F97316',
    coordinate: { latitude: 28.6239, longitude: 77.219 },
    message: 'Govt may apply special schemes in this zone.',
  },
  {
    id: 'zone-3',
    name: 'Industrial Layout',
    level: 'Low' as const,
    color: '#16A34A',
    coordinate: { latitude: 28.6039, longitude: 77.199 },
    message: 'Govt may apply special schemes in this zone.',
  },
];

type ZoneLevel = 'All' | 'High' | 'Medium' | 'Low';

export const ZonesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<typeof ZONES[number] | null>(null);
  const [filter, setFilter] = useState<ZoneLevel>('All');

  const filteredZones = useMemo(() => {
    if (filter === 'All') return ZONES;
    return ZONES.filter((zone) => zone.level === filter);
  }, [filter]);

  const legendItems = [
    { label: 'High Risk', color: '#DC2626' },
    { label: 'Medium Risk', color: '#F97316' },
    { label: 'Low Risk', color: '#16A34A' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <WaveHeader title="Zones" onBack={() => navigation.goBack()} />

      <View style={styles.content}> 
        <View style={styles.filterRow}> 
          {(['All', 'High', 'Medium', 'Low'] as ZoneLevel[]).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === item ? theme.colors.surface : 'transparent',
                  borderColor: filter === item ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <AppText style={[styles.filterLabel, { color: theme.colors.text }]}>{item}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {filteredZones.map((zone) => (
            <Marker
              key={zone.id}
              coordinate={zone.coordinate}
              pinColor={zone.color}
              onPress={() => setSelected(zone)}
            />
          ))}
        </MapView>

        <View style={[styles.legend, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
          <AppText style={[styles.legendTitle, { color: theme.colors.text }]}>Risk Legend</AppText>
          {legendItems.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <AppText style={[styles.legendLabel, { color: theme.colors.text }]}>{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}> 
            <View style={styles.modalHeader}>
              <View style={[styles.modalDot, { backgroundColor: selected?.color ?? theme.colors.primary }]} />
              <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>{selected?.name}</AppText>
            </View>
            <AppText style={[styles.modalSubtitle, { color: theme.colors.muted }]}>
              Risk level: {selected?.level ?? '-'}
            </AppText>
            <AppText style={[styles.modalBody, { color: theme.colors.text }]}>{selected?.message}</AppText>
            <AppButton label="Close" onPress={() => setSelected(null)} icon="close" style={styles.closeButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, gap: 12 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  legend: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  legendTitle: { fontSize: 14, fontWeight: '700' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalDot: { width: 12, height: 12, borderRadius: 6 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalSubtitle: { fontSize: 13 },
  modalBody: { fontSize: 14, lineHeight: 20 },
  closeButton: { marginTop: 8 },
});
