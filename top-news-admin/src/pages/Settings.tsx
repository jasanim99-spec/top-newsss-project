import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Key, 
  Eye, 
  EyeOff, 
  Sparkles,
  Link as LinkIcon,
  Database,
  Trash2
} from 'lucide-react';
import { settingsService, SiteSettings } from '@/services/settingsService';
import { storageService } from '@/services/storageService';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: '/logo.png',
    faviconUrl: '/logo.png',
    siteName: 'TOP NEWS',
    siteTagline: 'Breaking News, Latest Updates & Current Affairs',
    adminUrl: 'http://localhost:5173',
    mainWebsiteUrl: 'http://localhost:8080',
    masterKey: 'TOPNEWS2026'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [faviconProgress, setFaviconProgress] = useState(0);
  const [showKey, setShowKey] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Settings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for Website Logo.');
      return;
    }

    try {
      setLogoUploading(true);
      setError(null);
      setSuccessMessage(null);
      const url = await storageService.uploadBrandingImage(file, 'logo', setLogoProgress);
      setSettings(prev => ({ ...prev, logoUrl: url }));
      setSuccessMessage('Website Logo uploaded successfully! Click "Save All Settings" to apply.');
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setError('Failed to upload logo image.');
    } finally {
      setLogoUploading(false);
      setLogoProgress(0);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for Favicon.');
      return;
    }

    try {
      setFaviconUploading(true);
      setError(null);
      setSuccessMessage(null);
      const url = await storageService.uploadBrandingImage(file, 'favicon', setFaviconProgress);
      setSettings(prev => ({ ...prev, faviconUrl: url }));
      setSuccessMessage('Favicon uploaded successfully! Click "Save All Settings" to apply.');
    } catch (err: any) {
      console.error('Favicon upload error:', err);
      setError('Failed to upload favicon image.');
    } finally {
      setFaviconUploading(false);
      setFaviconProgress(0);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.siteName.trim()) {
      setError('Site Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      setSuccessMessage('Settings & Branding assets saved successfully!');
    } catch (err: any) {
      console.error('Settings save error:', err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('topnews_created_news_articles');
      localStorage.removeItem('topnews_deleted_news_ids');
      localStorage.removeItem('topnews_created_videos');
      localStorage.removeItem('topnews_deleted_video_ids');
      setSuccessMessage('Local Storage Cache cleared successfully! The admin panel will now fetch pure real-time data.');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e) {
      setError('Failed to clear cache.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0058be] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <SettingsIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
                BRANDING & CONFIGURATION
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">System & Branding Settings</h1>
            <p className="text-slate-300 text-sm font-medium mt-0.5">Manage Website Logo, Favicon, Site Info, and Security Credentials.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 flex items-center gap-3 shadow-sm text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-800 flex items-center gap-3 shadow-sm text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Website Branding Assets */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <ImageIcon className="w-5 h-5 text-[#0058be]" />
            <h2 className="text-lg font-bold text-gray-900">Website Logo & Favicon Setup</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Card */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Website Main Logo</label>
                  <span className="text-[10px] font-bold text-[#0058be] bg-[#0058be]/10 px-2 py-0.5 rounded-full">Header Logo</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Official logo image displayed on Website Header and Admin Panel.</p>

                {/* Logo Preview */}
                <div className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-xl mb-4 min-h-[120px]">
                  <img
                    src={settings.logoUrl || '/logo.png'}
                    alt="Logo Preview"
                    className="max-h-24 max-w-full object-contain rounded-lg shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                  />
                </div>

                {/* Upload Buttons & Link input */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={logoUploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 hover:border-[#0058be] rounded-xl text-xs font-bold text-gray-700 hover:text-[#0058be] shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{logoUploading ? `Uploading (${logoProgress}%)...` : 'Upload New Logo Image'}</span>
                  </button>

                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="Or paste Logo Image URL (https://...)"
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, logoUrl: '/logo.png' })}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 underline text-center"
              >
                Reset to Default HD Logo
              </button>
            </div>

            {/* Favicon Card */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Website Favicon</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Browser Tab Icon</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Icon displayed next to Website Title in Browser Tabs.</p>

                {/* Favicon Browser Tab Mockup Preview */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl mb-4 min-h-[120px] flex flex-col justify-center items-center">
                  <div className="w-full max-w-[220px] bg-gray-200/70 p-2 rounded-t-xl border border-gray-300 flex items-center gap-2">
                    <img
                      src={settings.faviconUrl || '/logo.png'}
                      alt="Favicon Preview"
                      className="w-4 h-4 object-cover rounded flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                    />
                    <span className="text-[11px] font-bold text-gray-700 truncate">{settings.siteName || 'Top News'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Browser Tab Preview</p>
                </div>

                {/* Upload Buttons & Link input */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={faviconFileInputRef}
                    onChange={handleFaviconFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => faviconFileInputRef.current?.click()}
                    disabled={faviconUploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 hover:border-[#0058be] rounded-xl text-xs font-bold text-gray-700 hover:text-[#0058be] shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{faviconUploading ? `Uploading (${faviconProgress}%)...` : 'Upload New Favicon Image'}</span>
                  </button>

                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={settings.faviconUrl}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      placeholder="Or paste Favicon Image URL (https://...)"
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, faviconUrl: '/logo.png' })}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 underline text-center"
              >
                Reset to Default Favicon
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: General Information */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <Globe className="w-5 h-5 text-[#0058be]" />
            <h2 className="text-lg font-bold text-gray-900">General Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Website Name
              </label>
              <input
                type="text"
                required
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                placeholder="TOP NEWS"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Tagline / Description
              </label>
              <input
                type="text"
                value={settings.siteTagline}
                onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                placeholder="Breaking News & Latest Updates"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Main Website URL
              </label>
              <input
                type="url"
                value={settings.mainWebsiteUrl || 'http://localhost:8080'}
                onChange={(e) => setSettings({ ...settings, mainWebsiteUrl: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                placeholder="http://localhost:8080"
              />
              <p className="text-[11px] text-gray-500 mt-1">Live user-facing news website URL.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Panel URL
              </label>
              <input
                type="url"
                value={settings.adminUrl || 'http://localhost:5173'}
                onChange={(e) => setSettings({ ...settings, adminUrl: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                placeholder="http://localhost:5173"
              />
              <p className="text-[11px] text-gray-500 mt-1">Admin console URL for editorial staff.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Security & Access Control */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <Key className="w-5 h-5 text-[#0058be]" />
            <h2 className="text-lg font-bold text-gray-900">Security & Master Key</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Master Security Key
            </label>
            <div className="relative rounded-xl shadow-sm max-w-md">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.masterKey}
                onChange={(e) => setSettings({ ...settings, masterKey: e.target.value })}
                className="block w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-xl text-sm font-mono bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]"
                placeholder="TOPNEWS2026"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Master Key used for resetting admin password securely.</p>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
