'use client';

import { useEffect } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
import { initSyncEngine } from '../lib/sync';

export function NetworkSyncProvider({ children }: { children: React.ReactNode }) {
  const setOnline = useNetworkStore((state) => state.setOnline);

  useEffect(() => {
    // Initialize network status listener
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOnline(navigator.onLine);

    // Initialize sync engine
    const cleanupSync = initSyncEngine();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (cleanupSync) cleanupSync();
    };
  }, [setOnline]);

  return <>{children}</>;
}
