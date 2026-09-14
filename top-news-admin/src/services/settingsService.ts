import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export interface SiteSettings {
  logoUrl: string;
  faviconUrl: string;
  siteName: string;
  siteTagline: string;
  adminUrl: string;
  mainWebsiteUrl: string;
  masterKey: string;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: '/logo.png',
  faviconUrl: '/logo.png',
  siteName: 'TOP NEWS',
  siteTagline: 'Breaking News, Latest Updates & Current Affairs',
  adminUrl: 'http://localhost:5173',
  mainWebsiteUrl: 'http://localhost:8080',
  masterKey: 'TOPNEWS2026'
};

const LOCAL_STORAGE_KEY = 'topnews_site_settings';
const API_BASE_URL = 'http://localhost:3000';

export const settingsService = {
  /**
   * Fetch site settings from PostgreSQL REST API (fallback to Firestore / localStorage)
   */
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        this.applyFavicon(merged.faviconUrl);
        return merged;
      }
    } catch (err) {
      console.warn('PostgreSQL settings fetch notice:', err);
    }

    try {
      const docRef = doc(db, 'settings', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        this.applyFavicon(merged.faviconUrl);
        return merged;
      }
    } catch (err) {
      console.warn('Firestore settings fetch notice:', err);
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const merged = { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
        this.applyFavicon(merged.faviconUrl);
        return merged;
      } catch (e) {}
    }

    return DEFAULT_SETTINGS;
  },

  /**
   * Update site settings in PostgreSQL + Firestore dual update + Local sync
   */
  async updateSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
    let current = DEFAULT_SETTINGS;
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        current = { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      } catch (e) {}
    }

    const updated: SiteSettings = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('topnews_settings_updated', { detail: updated }));
    this.applyFavicon(updated.faviconUrl);

    try {
      const bc = new BroadcastChannel('topnews_settings_channel');
      bc.postMessage(updated);
      bc.close();
    } catch (e) {}

    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (bErr) {
      console.warn('PostgreSQL settings update notice:', bErr);
    }

    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Firestore settings update notice:', err);
    }

    return updated;
  },

  /**
   * Dynamically apply Favicon URL to document head
   */
  applyFavicon(url?: string) {
    if (!url) return;
    try {
      const existingLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
      if (existingLinks.length > 0) {
        existingLinks.forEach(link => {
          link.href = url;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url;
        document.head.appendChild(link);
      }
    } catch (e) {}
  }
};
