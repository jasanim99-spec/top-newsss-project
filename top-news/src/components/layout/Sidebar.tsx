import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Mail, Cloud, ExternalLink, Bell, BellOff } from 'lucide-react';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { newsService } from '@/services/newsService';
import { useNewsStore } from '@/store/newsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { usePushNotification } from '@/hooks/usePushNotification';
import { AdSubmissionModal } from '@/components/ads/AdSubmissionModal';

export function Sidebar() {
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const { currentLanguage, trendingArticles, setTrendingArticles } = useNewsStore();

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trending-sidebar', currentLanguage],
    queryFn: async () => {
      let res = await newsService.getPublishedNews({ section: 'sidebar', language: currentLanguage, limitNum: 8 });
      if (!res.articles || res.articles.length === 0) {
        res = await newsService.getPublishedNews({ language: currentLanguage, limitNum: 8 });
      }
      return res;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: mostReadData, isLoading: isMostReadLoading } = useQuery({
    queryKey: ['most-read-sidebar', currentLanguage],
    queryFn: async () => {
      let res = await newsService.getPublishedNews({ language: currentLanguage, limitNum: 8 });
      return res;
    },
    staleTime: 10 * 60 * 1000,
  });

  const API = import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';

  const { supported, subscribed, loading: notifLoading, subscribe, unsubscribe } = usePushNotification();

  const { data: sidebarAds } = useQuery({
    queryKey: ['sidebar-ads'],
    queryFn: () => fetch(`${API}/ads?position=sidebar&active=true`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (trendingData?.articles) {
      setTrendingArticles(trendingData.articles.slice(0, 8));
    }
  }, [trendingData, setTrendingArticles]);

  return (
    <aside className="w-full lg:w-80 space-y-8">
      {/* Trending Now */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="news-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trending Now</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trendingArticles.slice(0, 5).map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <NewsCard
                  article={article}
                  variant="sidebar"
                  showImage={true}
                  showDescription={false}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>



      {/* Sidebar Advertisement / Sponsored Banner (Controlled via Admin Panel /ads) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="news-card p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl border border-indigo-700/40 shadow-lg relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-xs">
            SPONSORED
          </span>
          <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
            ADVERTISEMENT
          </span>
        </div>

        {sidebarAds?.ads && sidebarAds.ads.length > 0 ? (
          (() => {
            const activeAd = sidebarAds.ads[0];
            return (
              <a
                href={activeAd.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => fetch(`${API}/ads/${activeAd.id}/click`, { method: 'POST' }).catch(() => {})}
                className="block group/ad"
              >
                {activeAd.image_url && (
                  <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-white/10 relative">
                    <img
                      src={activeAd.image_url}
                      alt={activeAd.title}
                      className="w-full h-full object-cover group-hover/ad:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <h4 className="text-base font-black text-white group-hover/ad:text-cyan-300 transition-colors leading-snug mb-2">
                  {activeAd.title}
                </h4>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 mt-2">
                  <span>Visit Advertiser</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            );
          })()
        ) : (
          <div className="text-center py-2 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-800/40 border border-indigo-600/30 flex items-center justify-center mx-auto text-cyan-400 text-xl font-black">
              📢
            </div>
            <div>
              <h4 className="text-sm font-black text-white tracking-tight">Advertise With Top News</h4>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                Reach over 100,000+ daily readers. Manage campaigns from Admin Panel.
              </p>
            </div>
            <button
              onClick={() => setIsAdModalOpen(true)}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all gap-1.5 cursor-pointer"
            >
              <span>Submit Ad Campaign Request</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Mini Weather Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="news-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Cloud className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Weather</h3>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mb-1">22°C</div>
          <div className="text-sm text-muted-foreground mb-2">Partly Cloudy</div>
          <div className="text-xs text-muted-foreground">New Delhi, India</div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="text-center">
            <div className="font-medium">Mon</div>
            <div>25°/18°</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Tue</div>
            <div>27°/19°</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Wed</div>
            <div>24°/17°</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Thu</div>
            <div>26°/20°</div>
          </div>
        </div>
      </motion.div>



      {/* Push Notification Subscribe */}
      {supported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="news-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Breaking News Alerts</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Instant notifications melo jyare breaking news aave
          </p>
          <Button
            onClick={subscribed ? unsubscribe : subscribe}
            disabled={notifLoading}
            variant={subscribed ? 'outline' : 'default'}
            size="sm"
            className="w-full flex items-center gap-2"
          >
            {subscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {notifLoading ? 'Processing...' : subscribed ? 'Unsubscribe' : 'Enable Notifications'}
          </Button>
        </motion.div>
      )}

      {/* Ad Submission Modal */}
      <AdSubmissionModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
    </aside>
  );
}