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
  technology: 'category-tech',
  sports: 'category-sports',
  business: 'category-business',
  politics: 'category-politics',
  entertainment: 'category-entertainment',
  world: 'bg-blue-600 text-white',
  health: 'bg-green-600 text-white',
  opinion: 'bg-purple-600 text-white',
  breaking: 'breaking-badge animate-breaking-pulse',
} as const;

export function NewsCard({
  article,
  variant = 'default',
  showImage = true,
  showDescription = true,
  className = ''
}: NewsCardProps) {
  const categoryClass = categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-600 text-white';
  const articleUrl = `/article/${article.language}/${article.category}/${article.topic}/${article.slug}`;

  const timeAgo = safeFormatDistanceToNow(article.publishedAt);

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`news-hero-card relative overflow-hidden rounded-lg ${className}`}
      >
        <Link to={articleUrl} className="block">
          {showImage && article.imageUrl && (
            <div className="aspect-[4/3] sm:aspect-[16/9] relative overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${categoryClass}`}>
                {article.category}
              </span>
              {article.section === 'breaking' && (
                <span className="breaking-badge">
                  Breaking
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 sm:mb-3 font-serif">
              {article.title}
            </h1>

            {showDescription && (
              <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-2 sm:mb-4 line-clamp-2">
                {article.description}
              </p>
            )}

            <div className="flex flex-wrap items-center text-xs sm:text-sm text-white/80 space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate min-w-0">{timeAgo}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4 flex-shrink-0" />
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
        className={`border-b border-border pb-4 last:border-b-0 ${className}`}
      >
        <Link to={articleUrl} className="block group">
          <div className="flex space-x-3">
            {showImage && article.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded group-hover:opacity-80 transition-opacity"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="news-headline text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-3">
                {article.title}
              </h3>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground min-w-0">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${categoryClass} flex-shrink-0`}>
                  {article.category}
                </span>
                <span className="truncate min-w-0">{timeAgo}</span>
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
      className={`news-card news-scale-hover ${className}`}
    >
      <Link to={articleUrl} className="block group">
        {showImage && article.imageUrl && (
          <div className="aspect-[16/9] relative overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {article.section === 'breaking' && (
              <div className="absolute top-3 left-3">
                <span className="breaking-badge">
                  Breaking
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${categoryClass} flex-shrink-0`}>
              {article.category}
            </span>
            <span className="news-meta truncate min-w-0">{timeAgo}</span>
          </div>

          <h3 className="news-headline text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>

          {showDescription && (
            <p className="news-description text-sm leading-relaxed mb-4 line-clamp-2">
              {article.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{(article.views || 0).toLocaleString()}</span>
            </div>

            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {article.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="truncate min-w-0 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded"
                  >
                    {tag}
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