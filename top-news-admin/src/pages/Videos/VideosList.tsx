import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { videoService } from '@/services/videoService';
import { ShortVideo, getLanguageName } from '@/types';
import SearchAndFilter from '@/components/Common/SearchAndFilter';
import Pagination from '@/components/Common/Pagination';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const VideosList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredVideos, setFilteredVideos] = useState<ShortVideo[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['videos', page, selectedLanguage, selectedCategory],
    queryFn: () => videoService.getVideos({
      page,
      limit: 10,
      language: selectedLanguage || undefined,
      category: selectedCategory || undefined,
      status: 'all'
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videoService.deleteVideo(id),
    onSuccess: (_, deletedId) => {
      setFilteredVideos(prev => prev.filter(v => v._id !== deletedId && v.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video-stats'] });
      toast.success('Video deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete video');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      if (currentStatus === 'published') {
        return videoService.unpublishVideo(id);
      } else {
        return videoService.publishVideo(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video-stats'] });
      toast.success('Video status updated');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update video status');
    }
  });

  useEffect(() => {
    const videoList = data?.videos || data?.articles;
    if (videoList) {
      let filtered = videoList;
      
      if (searchTerm) {
        filtered = filtered.filter(
          video =>
            (video.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (video.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Array.isArray(video.keywords) && video.keywords.some(keyword => 
              keyword.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
      }
      
      setFilteredVideos(filtered);
    }
  }, [data?.videos, data?.articles, searchTerm]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this video and its storage assets?')) {
      setFilteredVideos(prev => prev.filter(v => v._id !== id && v.id !== id));
      deleteMutation.mutate(id);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalPages = Math.ceil((data?.total || 0) / 10);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
              SHORT CLIPS STUDIO 9:16
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Short Videos Management</h1>
          <p className="text-slate-300 text-sm font-medium max-w-2xl">Manage 9:16 short news clips, video status, thumbnail previews, and video analytics.</p>
        </div>
        <Link
          to="/videos/create"
          className="relative z-10 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl active:scale-95 transition-all font-bold text-xs shadow-lg shadow-purple-500/25 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Short Clip</span>
        </Link>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredVideos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium shadow-sm transition-colors">
          No short videos found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => {
            const videoId = video._id || video.id || '';
            const isPublished = video.status === 'published';

            return (
              <motion.div
                key={videoId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-slate-900 flex items-center justify-center text-slate-400 font-medium text-xs">
                        No Thumbnail Available
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs flex items-center font-mono font-medium shadow-sm">
                      <Clock className="w-3 h-3 mr-1 text-slate-300" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 text-xs rounded-full font-medium">
                        {getLanguageName(video.language)}
                      </span>
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/60 text-xs rounded-full font-medium">
                        {video.category}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug text-base">
                      {video.title}
                    </h3>
                    
                    <p className="text-slate-600 text-xs line-clamp-2 font-medium leading-relaxed">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-slate-500 font-medium space-x-4 pt-1">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        {(video.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 pt-0 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => togglePublishMutation.mutate({ id: videoId, currentStatus: video.status })}
                    className={`flex items-center justify-center px-2 py-2 rounded-xl transition-all text-xs font-semibold ${
                      isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                    disabled={togglePublishMutation.isPending}
                  >
                    {isPublished ? <XCircle className="w-3.5 h-3.5 mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                    <span>{isPublished ? 'Draft' : 'Publish'}</span>
                  </button>

                  <Link
                    to={`/videos/${videoId}/edit`}
                    className="flex items-center justify-center px-2 py-2 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-xl hover:bg-blue-100 transition-all text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(videoId)}
                    className="flex items-center justify-center px-2 py-2 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-xl hover:bg-rose-100 transition-all text-xs font-semibold"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default VideosList;