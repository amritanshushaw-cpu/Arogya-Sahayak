/**
 * Utility to obtain a stable device identifier.
 * Generated once per browser origin and persisted in localStorage.
 * Uses native crypto.randomUUID() when available.
 */
export function getDeviceId(): string {
  const storageKey = 'aarogya_device_id';
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined;

  try {
    const existing = storage?.getItem(storageKey);
    if (existing) return existing;

    const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    storage?.setItem(storageKey, id);
    return id;
  } catch (e) {
    return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
