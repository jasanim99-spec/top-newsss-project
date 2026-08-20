import { Link } from 'react-router-dom';
import { Play, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { NewsVideo } from '@/store/newsStore';
import { safeFormatDistanceToNow } from '@/utils/converters';

interface VideoCardProps {
  video: NewsVideo;
  variant?: 'default' | 'reel' | 'grid';
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
} as const;

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function VideoCard({ video, variant = 'default', className = '' }: VideoCardProps) {
  const categoryClass = categoryColors[video.category as keyof typeof categoryColors] || 'bg-gray-600 text-white';
  const videoUrl = `/video/${video.language}/${video.category}/${video.topic}/${video.slug}`;
  const timeAgo = safeFormatDistanceToNow(video.publishedAt);

  if (variant === 'reel') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`relative aspect-[9/16] max-w-xs bg-black rounded-lg overflow-hidden group ${className}`}
      >
        <Link to={videoUrl} className="block h-full">
          <div className="relative h-full">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors"
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </motion.div>
            </div>
            
            {/* Duration Badge */}
            <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              {formatDuration(video.duration)}
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${categoryClass}`}>
                {video.category}
              </span>
            </div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-3">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{(video.views || 0).toLocaleString()}</span>
                </div>
                <span>{timeAgo}</span>
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
      <Link to={videoUrl} className="block group">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
            </motion.div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {formatDuration(video.duration)}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${categoryClass}`}>
              {video.category}
            </span>
            <span className="news-meta">{timeAgo}</span>
          </div>
          
          <h3 className="news-headline text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {video.title}
          </h3>
          
          <p className="news-description text-sm leading-relaxed mb-4 line-clamp-2">
            {video.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{(video.views || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}