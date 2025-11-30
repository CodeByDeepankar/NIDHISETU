import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const updateStatus = async () => {
      const state = await Network.getNetworkStateAsync();
      if (!isMounted) return;
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
};
