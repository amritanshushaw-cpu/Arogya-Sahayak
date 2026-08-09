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

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service Worker registered successfully:', reg.scope);
      }).catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (cleanupSync) cleanupSync();
    };
  }, [setOnline]);

  return <>{children}</>;
}
