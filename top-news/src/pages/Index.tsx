import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedSection } from '@/components/sections/FeaturedSection';
import { CategoryGrid } from '@/components/sections/CategoryGrid';
import { VideoSection } from '@/components/sections/VideoSection';
import { useMockData } from '@/hooks/useMockData';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const Index = () => {
  // Load mock data for development
  useMockData();

  const [siteName, setSiteName] = useState('TOP NEWS');
  const [siteTagline, setSiteTagline] = useState('Breaking News, Latest Updates & Current Affairs');

  useEffect(() => {
    const cached = localStorage.getItem('topnews_site_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.siteName) setSiteName(parsed.siteName);
        if (parsed.siteTagline) setSiteTagline(parsed.siteTagline);
      } catch (e) {}
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.siteName) setSiteName(data.siteName);
        if (data.siteTagline) setSiteTagline(data.siteTagline);
      })
      .catch(() => {});

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('topnews_settings_channel');
      bc.onmessage = (event) => {
        if (event.data) {
          if (event.data.siteName) setSiteName(event.data.siteName);
          if (event.data.siteTagline) setSiteTagline(event.data.siteTagline);
        }
      };
    } catch (e) {}

    return () => {
      if (bc) bc.close();
    };
  }, []);
  
  return (
    <>
      <Helmet>
        <title>{siteName} - {siteTagline}</title>
        <meta 
          name="description" 
          content={`Stay updated with ${siteName} - your trusted source for ${siteTagline}. Real-time news coverage.`} 
        />
        <meta 
          name="keywords" 
          content="breaking news, latest news, current affairs, politics, business, technology, sports, entertainment, live updates" 
        />
        <link rel="canonical" href="https://topsnews.in/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Top News - Breaking News & Latest Updates" />
        <meta property="og:description" content="Your trusted source for breaking news, latest updates, and comprehensive coverage of world events." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://topsnews.in/" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Top News - Breaking News & Latest Updates" />
        <meta name="twitter:description" content="Your trusted source for breaking news, latest updates, and comprehensive coverage of world events." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": "Top News",
            "url": "https://topsnews.in",
            "logo": "https://topsnews.in/logo.png",
            "sameAs": [
              "https://facebook.com/livenews",
              "https://twitter.com/livenews",
              "https://instagram.com/livenews"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-2 lg:pt-3">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Featured Stories Carousel */}
          <FeaturedSection />
          
          {/* Main Content with Sidebar */}
          <div className="news-container py-8">
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Category Grid */}
                <CategoryGrid />
                
                {/* Video Section */}
                <VideoSection />
              </div>
              
              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="xl:w-80 xl:flex-shrink-0"
              >
                <div className="xl:sticky xl:top-24">
                  <Sidebar />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
