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
            <Route path="/article/:language/:category/:topic/:slug" element={<ArticlePage />} />
            <Route path="/video/:language/:category/:topic/:slug" element={<VideoPage />} />
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
