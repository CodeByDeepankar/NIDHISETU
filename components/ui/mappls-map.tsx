import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

export interface MapplsMapProps {
  latitude: number;
  longitude: number;
  height?: number;
  borderRadius?: number;
}

// Legacy shim to keep older imports compiling while Mappls integration is disabled.
export const MapplsMap = ({ height = 160, borderRadius = 12 }: MapplsMapProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.placeholder, { height, borderRadius, backgroundColor: theme.colors.surface }]}
      accessibilityLabel="Map preview unavailable"
    >
      <AppText variant="bodySmall" color="muted">
        Map preview temporarily unavailable
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    width: '100%',
  },
});

