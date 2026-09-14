import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MDEditor from '@uiw/react-md-editor';
import { ArrowLeft, Sparkles, Languages, Zap, Mic, MapPin, UserCheck } from 'lucide-react';
import { newsService, generateSlug } from '@/services/newsService';
import { authService } from '@/services/authService';
import { aiService } from '@/services/aiService';
import { storageService } from '@/services/storageService';
import { NewsArticle, LANGUAGE_OPTIONS, CATEGORIES } from '@/types';
import TagInput from '@/components/Common/TagInput';
import FileUpload from '@/components/Common/FileUpload';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import VoiceDictationButton from '@/components/Reporter/VoiceDictationButton';
import LocationPicker from '@/components/Reporter/LocationPicker';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  slug: Yup.string().required('Slug is required'),
  description: Yup.string().required('Description is required'),
  content: Yup.string().required('Content is required'),
  imageUrl: Yup.string().required('Cover image is required'),
  category: Yup.string().required('Category is required'),
  topic: Yup.string(),
  language: Yup.string().required('Language is required'),
  section: Yup.string().required('Section is required'),
  status: Yup.string().oneOf(['draft', 'pending', 'published', 'rejected']).required('Status is required'),
  publishedAt: Yup.string().required('Published date is required'),
  sourceUrl: Yup.string(),
});

const NewsForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  const [tempId] = useState(() => id || `news_${Date.now()}`);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { data: existingNews, isLoading: isLoadingNews } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) return null;
      return newsService.getNewsById(id);
    },
    enabled: isEditing,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => authService.getAllTeamMembers(),
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<NewsArticle> & { sendPush?: boolean }) => {
      const { sendPush, ...newsData } = data;
      let result;
      if (isEditing && id) {
        result = await newsService.updateNews(id, newsData);
      } else {
        result = await newsService.createNews(newsData);
      }
      
      if (sendPush && newsData.title) {
        try {
          const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          await fetch(`${API}/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newsData.isBreaking ? `🔴 BREAKING: ${newsData.title}` : newsData.title,
              body: newsData.description || newsData.title,
              icon: newsData.imageUrl || '/logo.png',
              url: newsData.slug ? `/article/${newsData.slug}` : '/',
            }),
          });
        } catch (pushErr) {
          console.error('Push notification failed:', pushErr);
        }
      }
      return result;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-stats'] });
      queryClient.refetchQueries({ queryKey: ['news'] });
      toast.success(isEditing ? 'News updated successfully' : 'News created successfully');
      navigate('/news');
    },
    onError: (err: any) => {
      console.error('Mutation error:', err);
      toast.error(err.message || (isEditing ? 'Failed to update news' : 'Failed to create news'));
    },
  });

  const formatDateTimeLocal = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().slice(0, 16);
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
      return d.toISOString().slice(0, 16);
    } catch (e) {
      return new Date().toISOString().slice(0, 16);
    }
  };

  const initialValues: NewsArticle = React.useMemo(() => {
    if (existingNews) {
      return {
        ...existingNews,
        title: existingNews.title || '',
        slug: existingNews.slug || '',
        description: existingNews.description || '',
        content: existingNews.content || '',
        imageUrl: existingNews.imageUrl || '',
        category: (existingNews.category || 'general').toLowerCase(),
        topic: (existingNews.topic || 'general').toLowerCase(),
        language: (existingNews.language || 'en').toLowerCase(),
        section: existingNews.section || 'main',
        keywords: Array.isArray(existingNews.keywords) ? existingNews.keywords : [],
        tags: Array.isArray(existingNews.tags) ? existingNews.tags : [],
        status: existingNews.status || 'published',
        publishedAt: formatDateTimeLocal(existingNews.publishedAt),
        sourceUrl: existingNews.sourceUrl || '',
        isBreaking: !!existingNews.isBreaking,
        aiSummary: (existingNews as any).aiSummary || '',
        authorName: (existingNews as any).authorName || 'Admin Desk',
        authorRole: (existingNews as any).authorRole || 'admin',
        authorId: (existingNews as any).authorId || '',
        authorEmail: (existingNews as any).authorEmail || '',
        pressCardNo: (existingNews as any).pressCardNo || '',
        authorCity: (existingNews as any).authorCity || '',
        location: (existingNews as any).location || undefined,
      };
    }
    return {
      title: '',
      slug: '',
      description: '',
      content: '',
      imageUrl: '',
      category: 'general',
      topic: 'general',
      language: 'en',
      section: 'main',
      keywords: [],
      tags: [],
      status: 'published',
      publishedAt: new Date().toISOString().slice(0, 16),
      sourceUrl: '',
      isBreaking: false,
      aiSummary: '',
      authorName: 'Admin Desk',
      authorRole: 'admin'
    };
  }, [existingNews]);

  if (isEditing && isLoadingNews) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => navigate('/news')}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all backdrop-blur-sm border border-white/15 cursor-pointer active:scale-95"
            title="Go back to articles list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-xs">
                ARTICLE EDITOR
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {isEditing ? 'Edit News Article' : 'Create New Article'}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200/80 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 absolute top-0 left-0" />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // Normalize publishedAt to ISO string (datetime-local gives "2026-09-07T01:00")
              const publishedAt = values.publishedAt
                ? new Date(values.publishedAt).toISOString()
                : new Date().toISOString();

              const payload: Partial<NewsArticle> = {
                ...values,
                publishedAt,
                updatedAt: new Date().toISOString(),
                content: values.content || '',
                // Ensure id is included for PUT
                ...(isEditing && id ? { id, _id: id } : {}),
              };

              await mutation.mutateAsync(payload);
            } catch (err) {
              console.error('Submit error:', err);
            } finally {
              setSubmitting(false);
            }
          }}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting, handleChange }) => (
            <Form className="space-y-6">
              {/* AI ASSISTANT TOOLBAR */}
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 rounded-2xl border border-purple-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    AI
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">AI Smart Editor Tools</h4>
                    <p className="text-[11px] text-purple-700">Auto-summary, SEO Tags, and Auto-translation</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* AI Summary Button */}
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={async () => {
                      const fullText = `${values.title}\n${values.description}\n${values.content}`;
                      if (!fullText.trim() || fullText.trim().length < 15) {
                        toast.error('Please enter title or description first.');
                        return;
                      }
                      setIsGeneratingAI(true);
                      try {
                        const res = await aiService.generateSummary(fullText, values.language as any);
                        setFieldValue('aiSummary', res.summary);
                        toast.success('🤖 AI Summary generated!');
                      } catch (e: any) {
                        toast.error(e.message || 'AI summary failed');
                      } finally {
                        setIsGeneratingAI(false);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Summary</span>
                  </button>

                  {/* AI Headline & Tags */}
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={async () => {
                      const fullText = `${values.title}\n${values.description}\n${values.content}`;
                      if (!values.title.trim()) {
                        toast.error('Please enter title first.');
                        return;
                      }
                      setIsGeneratingAI(true);
                      try {
                        const res = await aiService.suggestHeadlinesAndTags(values.title, fullText, values.category, values.language as any);
                        if (res.suggestedTags?.length) {
                          setFieldValue('tags', Array.from(new Set([...values.tags, ...res.suggestedTags])));
                        }
                        if (res.suggestedKeywords?.length) {
                          setFieldValue('keywords', Array.from(new Set([...values.keywords, ...res.suggestedKeywords])));
                        }
                        toast.success('💡 Suggested SEO Tags and Keywords added!');
                      } catch (e: any) {
                        toast.error(e.message || 'Tag generation failed');
                      } finally {
                        setIsGeneratingAI(false);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggest SEO Tags</span>
                  </button>
                </div>
              </div>

              {/* TITLE & SLUG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                  </div>
                  <Field
                    name="title"
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      if (!isEditing || !values.slug) {
                        setFieldValue('slug', generateSlug(e.target.value));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage name="title" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug * (Auto-generated or custom)
                  </label>
                  <Field
                    name="slug"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-mono text-sm"
                  />
                  <ErrorMessage name="slug" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <Field
                    name="topic"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage name="topic" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>Assign Reporter / Author *</span>
                  </label>
                  <select
                    value={values.authorId || values.authorEmail || ''}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const selectedMember = teamMembers.find(m => 
                        (m.uid && m.uid === selectedVal) || 
                        (m.id && m.id === selectedVal) || 
                        (m.email && m.email.toLowerCase().trim() === selectedVal.toLowerCase().trim())
                      );
                      if (selectedMember) {
                        setFieldValue('authorId', selectedMember.uid || selectedMember.id || selectedMember.email);
                        setFieldValue('authorName', selectedMember.name || selectedMember.email.split('@')[0]);
                        setFieldValue('authorRole', selectedMember.role || 'reporter');
                        setFieldValue('authorEmail', selectedMember.email);
                        setFieldValue('pressCardNo', selectedMember.pressCardNo || '');
                        setFieldValue('authorCity', selectedMember.city || '');
                      } else {
                        setFieldValue('authorId', '');
                        setFieldValue('authorName', 'Admin Desk');
                        setFieldValue('authorRole', 'admin');
                        setFieldValue('authorEmail', 'admin@topnews.com');
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-900"
                  >
                    <option value="">Admin Desk (Primary Admin)</option>
                    {teamMembers.map((member) => (
                      <option key={member.uid || member.id || member.email} value={member.uid || member.id || member.email}>
                        📰 {member.name} ({member.city || member.role || 'Reporter'}) - {member.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden from public site)</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content * (Markdown format supported)
                </label>
                <MDEditor
                  value={values.content}
                  onChange={(val) => setFieldValue('content', val || '')}
                  preview="edit"
                  hideToolbar={false}
                  height={300}
                />
                <ErrorMessage name="content" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image *
                </label>
                <FileUpload
                  value={values.imageUrl}
                  onChange={(url) => setFieldValue('imageUrl', url)}
                  onFileUpload={(file, progress) => storageService.uploadNewsImage(file, tempId, progress)}
                  accept="image/*"
                  label="Cover Image"
                  maxSizeMB={10}
                />
                <ErrorMessage name="imageUrl" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <Field
                    as="select"
                    name="language"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="language" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Published Date *
                  </label>
                  <Field
                    name="publishedAt"
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage name="publishedAt" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source URL
                  </label>
                  <Field
                    name="sourceUrl"
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage name="sourceUrl" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <TagInput
                    tags={values.keywords}
                    onChange={(keywords) => setFieldValue('keywords', keywords)}
                    placeholder="Add keywords..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <TagInput
                    tags={values.tags}
                    onChange={(tags) => setFieldValue('tags', tags)}
                    placeholder="Add tags..."
                  />
                </div>
              </div>

              {/* BREAKING NEWS & LOCATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-gray-200">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-red-600" />
                    Special Flags & Breaking News
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-red-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.isBreaking || false}
                      onChange={(e) => setFieldValue('isBreaking', e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Highlight as 🔴 BREAKING NEWS (Top Red Banner)</span>
                  </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-blue-700 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={values.sendPush || false}
                        onChange={(e) => setFieldValue('sendPush', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                      />
                      <span className="flex items-center gap-1">🔔 Send Push Notification Alert to Subscribers</span>
                    </label>

                    {/* Section Checkboxes — radio-like behaviour */}
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-700 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={values.section === 'featured'}
                      onChange={(e) => setFieldValue('section', e.target.checked ? 'featured' : 'main')}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span>⭐ Featured Stories (Homepage Hero + Carousel)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-teal-700 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={values.section === 'sidebar'}
                      onChange={(e) => setFieldValue('section', e.target.checked ? 'sidebar' : 'main')}
                      className="w-4 h-4 rounded accent-teal-500"
                    />
                    <span>📋 Sidebar / Trending Now (Right Panel)</span>
                  </label>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Author / Journalist Byline</label>
                    <Field
                      name="authorName"
                      type="text"
                      placeholder="e.g. Editorial Desk / Reporter Name"
                      className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <LocationPicker
                    value={values.location}
                    onChange={(loc) => setLocationDataAndField(loc, setFieldValue)}
                  />
                </div>
              </div>

              {/* AI Summary Editor */}
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  AI Summary / Bullet Highlights (Displayed at top of article)
                </label>
                <Field
                  as="textarea"
                  name="aiSummary"
                  rows={3}
                  placeholder="• Key point 1&#10;• Key point 2&#10;• Key point 3"
                  className="w-full px-4 py-2 border border-purple-200 bg-purple-50/50 rounded-lg focus:ring-2 focus:ring-purple-500 font-sans text-xs"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/news')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting || mutation.isPending
                    ? (isEditing ? 'Updating...' : 'Creating...')
                    : (isEditing ? 'Update News' : 'Create News')
                  }
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Helper for location change
const setLocationDataAndField = (loc: any, setFieldValue: any) => {
  setFieldValue('location', loc);
  if (loc?.city) {
    setFieldValue('authorCity', loc.city);
  }
};

export default NewsForm;