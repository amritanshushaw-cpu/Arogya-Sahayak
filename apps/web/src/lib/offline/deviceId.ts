/**
 * Utility to obtain a stable device identifier.
 * Generated once per browser origin and persisted in localStorage.
 * Uses native crypto.randomUUID() when available.
 */
export function getDeviceId(): string {
  const storageKey = 'aarogya_device_id';
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;
    const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : (() => {
          // Fallback to uuid npm package (already a dependency)
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { v4: uuidv4 } = require('uuid');
          return uuidv4();
        })();
    localStorage.setItem(storageKey, id);
    return id;
  } catch (e) {
    // In SSR or environments without localStorage, generate a transient ID.
    return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : 'device-' + Math.random().toString(36).substring(2, 15);
  }
}
