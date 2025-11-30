import 'react-native-reanimated';

import { NavigationIndependentTree } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/context/AppProviders';
import { ThemeProvider } from '@/context/ThemeProvider';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProviders>
        <NavigationIndependentTree>
          <AppNavigator />
        </NavigationIndependentTree>
        <StatusBar style="auto" />
      </AppProviders>
    </ThemeProvider>
  );
}
