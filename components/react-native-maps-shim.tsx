import { Platform } from 'react-native';

// Lightweight shim that selects the correct maps implementation per platform.
// On web use `react-native-web-maps`, otherwise use `react-native-maps`.
const lib: any = Platform.OS === 'web' ? require('react-native-web-maps') : require('react-native-maps');
const MapView = lib?.default ?? lib;

export default MapView;
export const Marker = lib?.Marker;
export const PROVIDER_GOOGLE = lib?.PROVIDER_GOOGLE;
