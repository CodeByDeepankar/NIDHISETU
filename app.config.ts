import 'dotenv/config';
import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'NIDHISETU',
  slug: 'NIDHISETU',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'nidhisetu',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    googleServicesFile: './google-services.json',
    package: 'com.deepankar.nidhisetu',
    adaptiveIcon: {
      backgroundColor: '#021A2F',
      foregroundImage: './assets/images/icon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#021A2F',
        dark: {
          backgroundColor: '#020D1E',
        },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '909c86ec-c36c-484b-8fd1-4cf65df55a71',
    },
    // expose env values in case parts of the app need runtime access via Constants.expoConfig?.extra
    env: {
      AI_SERVICE_URL: process.env.AI_SERVICE_URL,
      AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY,
      EXPO_PUBLIC_AI_SERVICE_API_KEY: process.env.EXPO_PUBLIC_AI_SERVICE_API_KEY,
      EXPO_PUBLIC_TWILIO_ACCOUNT_SID: process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID,
      EXPO_PUBLIC_TWILIO_AUTH_TOKEN: process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN,
      EXPO_PUBLIC_TWILIO_PHONE_NUMBER: process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_SUPABASE_BUCKET: process.env.EXPO_PUBLIC_SUPABASE_BUCKET,
    },
  },
  owner: 'deepankar68',
});
