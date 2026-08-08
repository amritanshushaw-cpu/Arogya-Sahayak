/**
 * Interface Seam: SyncNetworkAdapter
 * Decouples queue processing logic from HTTP network transmission details.
 */

export interface SyncResult {
  success: boolean;
  serverId?: string;
  error?: string;
}

export interface SyncNetworkAdapter {
  sendPatient(payload: any): Promise<SyncResult>;
  sendScreening(payload: any): Promise<SyncResult>;
  sendAlert(payload: any): Promise<SyncResult>;
}

/** Default HTTP implementation contacting Fastify backend endpoints */
export class DefaultSyncNetworkAdapter implements SyncNetworkAdapter {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL || '' : '');
  }

  async sendPatient(payload: any): Promise<SyncResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      return { success: true, serverId: data.id || data.serverId || payload.id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  async sendScreening(payload: any): Promise<SyncResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      return { success: true, serverId: data.id || data.serverId || payload.id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  async sendAlert(payload: any): Promise<SyncResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      return { success: true, serverId: data.id || data.serverId || payload.id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }
}
