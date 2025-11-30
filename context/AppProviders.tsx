import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Network from 'expo-network';
import { ReactNode, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getPaperTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 10,
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

const queryCachePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'nidhisetu-query-cache',
  throttleTime: 1000,
});

interface Props {
  children: ReactNode;
}

export const AppProviders = ({ children }: Props) => {
  const theme = useAppTheme();
  const paperTheme = useMemo(() => getPaperTheme(theme.mode), [theme.mode]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncNetworkState = async () => {
      const state = await Network.getNetworkStateAsync();
      if (!isMounted) return;
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      onlineManager.setOnline(online);
    };

    syncNetworkState();
    const interval = setInterval(syncNetworkState, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: queryCachePersister, maxAge: 1000 * 60 * 60 }}
          >
            {children}
          </PersistQueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
