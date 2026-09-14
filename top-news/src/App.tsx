import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import VideoPage from "./pages/VideoPage";
import SearchPage from "./pages/SearchPage";
import About from "./pages/About"
import Contact from "./pages/Contact"
import Advertise from "./pages/Advertise"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfUse from "./pages/TermsOfUse"
import Sitemap from "./pages/Sitemap"

import { useEffect } from 'react';
import { initSocketClient } from '@/services/socketService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

function SiteSettingsManager() {
  useEffect(() => {
    initSocketClient();

    const applyFavicon = (url?: string) => {
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
    };

    const applySettingsData = (data: any) => {
      if (!data) return;
      if (data.faviconUrl) applyFavicon(data.faviconUrl);
      if (data.siteName) {
        document.title = `${data.siteName}${data.siteTagline ? ' - ' + data.siteTagline : ''}`;
      }
      try {
        localStorage.setItem('topnews_site_settings', JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('topnews_settings_updated', { detail: data }));
      } catch (e) {}
    };

    // 1. Cached load
    const cached = localStorage.getItem('topnews_site_settings');
    if (cached) {
      try {
        applySettingsData(JSON.parse(cached));
      } catch (e) {}
    }

    // 2. Fetch from backend API endpoint
    fetch('http://localhost:3000/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) applySettingsData(data);
      })
      .catch(err => {
        console.warn('Backend settings fetch notice:', err);
      });

    // 3. BroadcastChannel listener for instant cross-tab local updates
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('topnews_settings_channel');
      bc.onmessage = (event) => {
        if (event.data) {
          applySettingsData(event.data);
        }
      };
    } catch (e) {}

    // 4. Realtime Firestore listener
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        applySettingsData(snap.data());
      }
    }, (err) => {
      console.warn('SiteSettingsManager notice:', err);
    });

    return () => {
      unsub();
      if (bc) bc.close();
    };
  }, []);

  return null;
}

function AdminRedirect() {
  const getTargetUrl = () => {
    try {
      const cached = localStorage.getItem('topnews_site_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.adminUrl) return parsed.adminUrl;
      }
    } catch (e) {}
    return import.meta.env.VITE_ADMIN_URL || "http://localhost:5173";
  };

  useEffect(() => {
    window.location.href = getTargetUrl();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting to Admin Portal...</h2>
        <p className="text-xs text-gray-500 mb-6">Connecting to Top News Admin Console ({getTargetUrl()})</p>
        <a
          href={getTargetUrl()}
          className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-sm"
        >
          Click Here if Not Redirected
        </a>
      </div>
    </div>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SiteSettingsManager />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="/article/:language/:category/:topic/:slug" element={<ArticlePage />} />
            <Route path="/article/:category/:topic/:slug" element={<ArticlePage />} />
            <Route path="/article/:category/:slug" element={<ArticlePage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/video/:language/:category/:topic/:slug" element={<VideoPage />} />
            <Route path="/video/:category/:slug" element={<VideoPage />} />
            <Route path="/video/:slug" element={<VideoPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/videos" element={<VideoPage />} />
            <Route path="/search" element={<SearchPage />} />
            
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/sitemap" element={<Sitemap />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
