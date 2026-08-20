import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit, Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
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
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['news', page, selectedLanguage, selectedCategory],
    queryFn: () => newsService.getNews({
      page,
      limit: 10,
      language: selectedLanguage || undefined,
      category: selectedCategory || undefined,
      status: 'all'
    }),
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

  useEffect(() => {
    if (data?.articles) {
      let filtered = data.articles;
      
      if (searchTerm) {
        filtered = filtered.filter(
          article =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.keywords.some(keyword => 
              keyword.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
      }
      
      setFilteredArticles(filtered);
    }
  }, [data?.articles, searchTerm]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this news article and its media files?')) {
      setFilteredArticles(prev => prev.filter(a => a._id !== id && a.id !== id));
      deleteMutation.mutate(id);
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / 10);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
        <Link
          to="/news/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create News
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
          <div className="bg-white p-12 text-center rounded-lg border text-gray-500">
            No news articles found.
          </div>
        ) : (
          filteredArticles.map((article, index) => {
            const articleId = article._id || article.id || '';
            const isPublished = article.status === 'published';

            return (
              <motion.div
                key={articleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full lg:w-48 h-32 object-cover rounded-lg mb-4 lg:mb-0 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full lg:w-48 h-32 bg-gray-100 rounded-lg mb-4 lg:mb-0 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {getLanguageName(article.language)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        {article.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 line-clamp-2 text-sm">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        {(article.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0">
                    <button
                      onClick={() => togglePublishMutation.mutate({ id: articleId, currentStatus: article.status })}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      disabled={togglePublishMutation.isPending}
                    >
                      {isPublished ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                      <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    <Link
                      to={`/news/${articleId}/view`}
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span>View</span>
                    </Link>
                    
                    <Link
                      to={`/news/${articleId}/edit`}
                      className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span>Edit</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(articleId)}
                      className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
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