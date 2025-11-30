declare module 'react-native-web-maps' {
  import type { ComponentType } from 'react';
    import type { MapViewProps } from 'react-native-maps';

  export * from 'react-native-maps';

  const MapView: ComponentType<MapViewProps>;
  export default MapView;
}
