export class ReportCacheService {
  private static getTodayDateString(): string {
    const today = new Date();
    // Use local date format YYYY-MM-DD
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  private static getKey(reportType: string, userId: string): string {
    return `report_${reportType}_${userId}_${this.getTodayDateString()}`;
  }

  public static get(reportType: string, userId: string): any | null {
    try {
      const key = this.getKey(reportType, userId);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read report cache', e);
    }
    return null;
  }

  public static set(reportType: string, userId: string, data: any): void {
    try {
      const key = this.getKey(reportType, userId);
      localStorage.setItem(key, JSON.stringify(data));
      
      // Cleanup older caches for this report/user
      this.cleanupOldCaches(reportType, userId, key);
    } catch (e) {
      console.warn('Failed to set report cache', e);
    }
  }

  public static clear(reportType: string, userId: string): void {
    try {
      const key = this.getKey(reportType, userId);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to clear report cache', e);
    }
  }

  private static cleanupOldCaches(reportType: string, userId: string, currentKey: string) {
    const prefix = `report_${reportType}_${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix) && k !== currentKey) {
        localStorage.removeItem(k);
      }
    }
  }
}
