'use client';

import React, { useEffect, useState } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
import { initSyncEngine, syncManager } from '../lib/sync';
import { db } from '../lib/db';
import { WifiOff, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export function NetworkSyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, setOnline } = useNetworkStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check initial status
    if (typeof window !== 'undefined') {
      setOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setOnline(true);
      toast.success('🌐 Connection restored! Syncing offline records...', { icon: '🌐', duration: 4000 });
      triggerSync();
    };

    const handleOffline = () => {
      setOnline(false);
      toast.error('⚡ Offline Mode Active — Local ONNX AI & Dexie Storage Engaged', { icon: '⚡', duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize sync engine
    const cleanupSync = initSyncEngine();

    // Periodically update pending count
    const interval = setInterval(async () => {
      try {
        const count = await db.syncQueue.where('status').equals('pending').count();
        setPendingCount(count);
      } catch (err) {
        // Ignored
      }
    }, 2500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      if (cleanupSync) cleanupSync();
    };
  }, [setOnline]);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncManager.processQueue();
      const count = await db.syncQueue.where('status').equals('pending').count();
      setPendingCount(count);
      if (res.processedCount > 0) {
        toast.success(`Successfully synchronized ${res.processedCount} offline record(s)!`);
      }
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Offline Mode & Queue Indicator Banner */}
      {!isOnline ? (
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-mono-tech flex items-center justify-between shadow-lg sticky top-0 z-[999] backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-4xl">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              <strong className="text-amber-300">OFFLINE MODE ACTIVE:</strong> Frontline on-device ONNX AI models & Dexie IndexedDB active. Patient records are saved locally.
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ml-2">
              {pendingCount} Pending Sync
            </span>
          )}
        </div>
      ) : pendingCount > 0 ? (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/40 text-indigo-200 px-4 py-2 text-xs font-mono-tech flex items-center justify-between shadow-lg sticky top-0 z-[999] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              <strong className="text-indigo-300">UNSYNCHRONIZED LOCAL RECORDS:</strong> {pendingCount} offline patient screening(s) awaiting cloud sync.
            </span>
          </div>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      ) : null}

      {children}
    </>
  );
}
