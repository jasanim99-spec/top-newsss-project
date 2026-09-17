import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit, Trash2, Calendar, CheckCircle2, XCircle, Star } from 'lucide-react';
import { newsService } from '@/services/newsService';
import { NewsArticle, getLanguageName } from '@/types';
import SearchAndFilter from '@/components/Common/SearchAndFilter';
import Pagination from '@/components/Common/Pagination';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const NewsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['news', page, selectedLanguage, selectedCategory],
    queryFn: () => newsService.getNews({
      page,
      limit: 10,
      language: selectedLanguage || undefined,
      category: selectedCategory || undefined,
      status: 'all'
    }),
    staleTime: 0,
    refetchInterval: 2000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.deleteNews(id),
    onSuccess: (_, deletedId) => {
      setFilteredArticles(prev => prev.filter(a => a._id !== deletedId && a.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-stats'] });
      toast.success('News article deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete news article');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      if (currentStatus === 'published') {
        return newsService.unpublishNews(id);
      } else {
        return newsService.publishNews(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-stats'] });
      toast.success('Article status updated');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update article status');
    }
  });

  const toggleHeroMutation = useMutation({
    mutationFn: async ({ id, isHero }: { id: string; isHero: boolean }) => {
      return newsService.updateNews(id, { section: isHero ? 'main' : 'featured' });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-stats'] });
      toast.success(variables.isHero ? 'Removed from Hero Section' : '⭐ Set as Hero Section Article!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update section');
    }
  });

  const articlesList = data?.articles || [];
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const list = data?.articles || [];
    if (searchTerm.trim()) {
      setFilteredArticles(
        list.filter(
          article =>
            (article.title || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            (article.description || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            (Array.isArray(article.keywords) && article.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase().trim())))
        )
      );
    } else {
      setFilteredArticles(list);
    }
  }, [data, searchTerm]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this news article and its media files?')) {
      deleteMutation.mutate(id);
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / 10);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
              EDITORIAL PUBLISHING DESK
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">News Management</h1>
          <p className="text-slate-300 text-sm font-medium max-w-2xl">Browse, edit, publish or manage all news articles across all media channels.</p>
        </div>
        <Link
          to="/news/create"
          className="relative z-10 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl active:scale-95 transition-all font-bold text-xs shadow-lg shadow-blue-500/25 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create News Article</span>
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

      <div className="grid gap-6">
        {filteredArticles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-500 font-medium shadow-sm">
            No news articles found.
          </div>
        ) : (
          filteredArticles.map((article, index) => {
            const articleId = article._id || article.id || '';
            const isPublished = article.status === 'published';
            const isHero = article.section === 'featured';

            return (
              <motion.div
                key={articleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl transition-all relative overflow-hidden ${
                  isHero
                    ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/80 border-2 border-amber-400 shadow-md ring-4 ring-amber-400/20'
                    : 'bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                {isHero && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-orange-500 to-amber-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> {getLanguageName(article.language).toUpperCase()} HERO
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full lg:w-48 h-32 object-cover rounded-xl mb-4 lg:mb-0 flex-shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-full lg:w-48 h-32 bg-slate-100 rounded-xl mb-4 lg:mb-0 flex items-center justify-center text-slate-400 font-medium text-xs">
                      No Image Available
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {isHero && (
                        <span className="px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full font-black tracking-wide flex items-center gap-1 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-white" /> ⭐ {getLanguageName(article.language).toUpperCase()} HERO
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 text-xs rounded-full font-medium">
                        {getLanguageName(article.language)}
                      </span>
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/60 text-xs rounded-full font-medium">
                        {article.category}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    
                    <p className="text-slate-600 line-clamp-2 text-sm font-medium leading-relaxed">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-slate-500 font-medium space-x-4 pt-1">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {(article.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:flex lg:flex-col gap-2 w-full lg:w-44 mt-4 lg:mt-0">
                    <button
                      onClick={() => toggleHeroMutation.mutate({ id: articleId, isHero })}
                      disabled={toggleHeroMutation.isPending}
                      className={`flex items-center justify-center px-2.5 sm:px-3.5 py-2 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                        isHero
                          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300/80'
                      }`}
                      title={isHero ? 'Remove from Hero Section' : 'Set as Hero Section Article'}
                    >
                      <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0 ${isHero ? 'fill-white' : 'text-amber-600'}`} />
                      <span className="truncate">{isHero ? 'Hero Active' : 'Set as Hero'}</span>
                    </button>

                    <button
                      onClick={() => togglePublishMutation.mutate({ id: articleId, currentStatus: article.status })}
                      className={`flex items-center justify-center px-2.5 sm:px-3.5 py-2 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                        isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                      }`}
                      disabled={togglePublishMutation.isPending}
                    >
                      {isPublished ? <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />}
                      <span className="truncate">{isPublished ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    <Link
                      to={`/news/${articleId}/view`}
                      className="flex items-center justify-center px-2.5 sm:px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                      <span>View</span>
                    </Link>
                    
                    <Link
                      to={`/news/${articleId}/edit`}
                      className="flex items-center justify-center px-2.5 sm:px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-xl hover:bg-blue-100 transition-all text-xs font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                      <span>Edit</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(articleId)}
                      className="flex items-center justify-center px-2.5 sm:px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-xl hover:bg-rose-100 transition-all text-xs font-semibold cursor-pointer col-span-2 sm:col-span-1"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

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

export default NewsList;