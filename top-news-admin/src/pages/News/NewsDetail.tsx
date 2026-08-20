import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Eye, Globe, Link as LinkIcon } from 'lucide-react';
import { newsService } from '@/services/newsService';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { getLanguageName } from '@/types';

const NewsDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: news, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) return null;
      return newsService.getNewsById(id);
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!news) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">News article not found</p>
        <button
          onClick={() => navigate('/news')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/news')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">News Detail</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {news.imageUrl && (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              {getLanguageName(news.language)}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              {news.category}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
              {news.section}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${news.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {news.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {news.title}
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            {news.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 py-4 border-y">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : ''}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {(news.views || 0).toLocaleString()} views
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              {news.topic}
            </div>
            {news.sourceUrl && (
              <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:underline"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Source Link
              </a>
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{news.content || ''}</ReactMarkdown>
          </div>

          {(news.keywords?.length > 0 || news.tags?.length > 0) && (
            <div className="pt-6 border-t space-y-4">
              {news.keywords?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {news.keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {news.tags?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {news.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;