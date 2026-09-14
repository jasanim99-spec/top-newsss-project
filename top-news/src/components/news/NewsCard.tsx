import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { NewsArticle } from '@/store/newsStore';
import { safeFormatDistanceToNow } from '@/utils/converters';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'hero' | 'featured' | 'sidebar';
  showImage?: boolean;
  showDescription?: boolean;
  className?: string;
}

const categoryColors = {
  technology: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  sports: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  business: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
  politics: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
  entertainment: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white',
  world: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
  health: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
  opinion: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
  breaking: 'bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse shadow-md',
} as const;

export function NewsCard({
  article,
  variant = 'default',
  showImage = true,
  showDescription = true,
  className = ''
}: NewsCardProps) {
  const categoryClass = categoryColors[article.category as keyof typeof categoryColors] || 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white';
  const articleUrl = `/article/${article.language}/${article.category}/${article.topic}/${article.slug}`;

  const timeAgo = safeFormatDistanceToNow(article.publishedAt);

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`news-hero-card relative overflow-hidden rounded-3xl shadow-xl border border-slate-800/40 group ${className}`}
      >
        <Link to={articleUrl} className="block">
          {showImage && article.imageUrl && (
            <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] relative overflow-hidden bg-slate-900">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-wider shadow-sm ${categoryClass}`}>
                {article.category}
              </span>
              {(article.section === 'breaking' || article.isBreaking) && (
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg shadow-red-600/30">
                  ⚡ Breaking
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-3 tracking-tight font-sans drop-shadow-md text-white group-hover:text-cyan-300 transition-colors">
              {article.title}
            </h1>

            {showDescription && (
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed mb-4 line-clamp-2 font-medium max-w-4xl">
                {article.description}
              </p>
            )}

            <div className="flex flex-wrap items-center text-xs text-indigo-200 font-semibold gap-4 pt-1">
              <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span>{(article.views || 0).toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className={`bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition-all ${className}`}
      >
        <Link to={articleUrl} className="block group">
          <div className="flex space-x-3 items-center">
            {showImage && article.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-100 group-hover:scale-105 transition-transform"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${categoryClass}`}>
                  {article.category}
                </span>
              </div>

              <h3 className="text-xs font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                {article.title}
              </h3>

              <div className="flex items-center text-[10px] text-slate-400 font-semibold space-x-2">
                <span>{timeAgo}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <Eye className="w-3 h-3 text-cyan-600" /> {(article.views || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between h-full ${className}`}
    >
      <Link to={articleUrl} className="flex flex-col justify-between h-full flex-1 group">
        {showImage && article.imageUrl && (
          <div className="aspect-[16/9] relative overflow-hidden rounded-2xl bg-slate-100 mb-4">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {(article.section === 'breaking' || article.isBreaking) && (
              <div className="absolute top-3 left-3">
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                  ⚡ Breaking
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${categoryClass}`}>
              {article.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {timeAgo}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          {showDescription && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {article.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
            <div className="flex items-center space-x-1 text-slate-700 font-extrabold">
              <Eye className="h-3.5 w-3.5 text-cyan-600" />
              <span>{(article.views || 0).toLocaleString()} views</span>
            </div>

            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {article.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="truncate max-w-[80px] px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 font-bold rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}