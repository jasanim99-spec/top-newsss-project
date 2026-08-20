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
    if (data?.videos) {
      let filtered = data.videos;
      
      if (searchTerm) {
        filtered = filtered.filter(
          video =>
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.keywords.some(keyword => 
              keyword.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
      }
      
      setFilteredVideos(filtered);
    }
  }, [data?.videos, searchTerm]);

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Short Videos Management</h1>
        <Link
          to="/videos/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Video
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
        <div className="bg-white p-12 text-center rounded-lg border text-gray-500">
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
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
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
                      <div className="w-full h-48 bg-gray-900 flex items-center justify-center text-gray-400">
                        No Thumbnail
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center font-mono">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {getLanguageName(video.language)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        {video.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {video.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ''}
                      </div>
                      <div>
                        {(video.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => togglePublishMutation.mutate({ id: videoId, currentStatus: video.status })}
                    className={`flex items-center justify-center px-2 py-2 rounded-lg transition-colors text-xs font-medium ${
                      isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    disabled={togglePublishMutation.isPending}
                  >
                    {isPublished ? <XCircle className="w-3.5 h-3.5 mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                    <span>{isPublished ? 'Draft' : 'Publish'}</span>
                  </button>

                  <Link
                    to={`/videos/${videoId}/edit`}
                    className="flex items-center justify-center px-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(videoId)}
                    className="flex items-center justify-center px-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
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