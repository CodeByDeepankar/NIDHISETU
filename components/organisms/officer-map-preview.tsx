import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from '../react-native-maps-shim';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface OfficerMapPreviewProps {
  onExpand: () => void;
}

export const OfficerMapPreview = ({ onExpand }: OfficerMapPreviewProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { borderColor: theme.colors.primary }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker coordinate={{ latitude: 28.6139, longitude: 77.209 }} />
        </MapView>

        <View style={styles.overlay}>
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <AppText variant="labelSmall" color="text">
                Your Location
              </AppText>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.dot, { backgroundColor: theme.colors.secondary }]} />
              <AppText variant="labelSmall" color="text">
                Beneficiary
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            onPress={onExpand}
            style={[styles.expandButton, { backgroundColor: theme.colors.primary }]}
          >
            <AppIcon name="arrow-expand-all" size={20} color="onPrimary" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  mapContainer: {
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chipRow: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
