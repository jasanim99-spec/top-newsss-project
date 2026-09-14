import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft } from 'lucide-react';
import { videoService, generateSlug } from '@/services/videoService';
import { storageService } from '@/services/storageService';
import { ShortVideo, LANGUAGE_OPTIONS, CATEGORIES } from '@/types';
import TagInput from '@/components/Common/TagInput';
import FileUpload from '@/components/Common/FileUpload';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  slug: Yup.string().required('Slug is required'),
  description: Yup.string().required('Description is required'),
  videoUrl: Yup.string().required('Video file is required'),
  thumbnailUrl: Yup.string().required('Thumbnail image is required'),
  duration: Yup.number().min(1, 'Duration must be at least 1 second').required('Duration is required'),
  category: Yup.string().required('Category is required'),
  topic: Yup.string(),
  language: Yup.string().required('Language is required'),
  section: Yup.string().required('Section is required'),
  status: Yup.string().oneOf(['draft', 'published']).required('Status is required'),
  publishedAt: Yup.string().required('Published date is required'),
  sourceUrl: Yup.string(),
});

const VideoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  const [tempId] = useState(() => id || `video_${Date.now()}`);

  const { data: existingVideo, isLoading: isLoadingVideo } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      if (!id) return null;
      return videoService.getVideoById(id);
    },
    enabled: isEditing,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ShortVideo>) => {
      if (isEditing && id) {
        return videoService.updateVideo(id, data);
      }
      return videoService.createVideo(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video-stats'] });
      toast.success(isEditing ? 'Video updated successfully' : 'Video created successfully');
      navigate('/videos');
    },
    onError: (err: any) => {
      console.error('Mutation error:', err);
      toast.error(err.message || (isEditing ? 'Failed to update video' : 'Failed to create video'));
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

  const initialValues: ShortVideo = React.useMemo(() => {
    if (existingVideo) {
      return {
        ...existingVideo,
        title: existingVideo.title || '',
        slug: existingVideo.slug || '',
        description: existingVideo.description || '',
        videoUrl: existingVideo.videoUrl || '',
        thumbnailUrl: existingVideo.thumbnailUrl || '',
        duration: typeof existingVideo.duration === 'number' ? existingVideo.duration : 60,
        category: (existingVideo.category || 'general').toLowerCase(),
        topic: (existingVideo.topic || 'general').toLowerCase(),
        language: (existingVideo.language || 'en').toLowerCase(),
        section: existingVideo.section || 'main',
        keywords: Array.isArray(existingVideo.keywords) ? existingVideo.keywords : [],
        tags: Array.isArray(existingVideo.tags) ? existingVideo.tags : [],
        status: existingVideo.status || 'published',
        publishedAt: formatDateTimeLocal(existingVideo.publishedAt),
        sourceUrl: existingVideo.sourceUrl || ''
      };
    }
    return {
      title: '',
      slug: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: 60,
      category: 'general',
      topic: 'general',
      language: 'en',
      section: 'main',
      keywords: [],
      tags: [],
      status: 'published',
      views: 0,
      publishedAt: new Date().toISOString().slice(0, 16),
      sourceUrl: '',
    };
  }, [existingVideo]);

  if (isEditing && isLoadingVideo) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => navigate('/videos')}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all backdrop-blur-sm border border-white/15 cursor-pointer active:scale-95"
            title="Go back to videos list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-xs">
                SHORT CLIP STUDIO
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {isEditing ? 'Edit Short Video Clip' : 'Upload New Short Video'}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200/80 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 absolute top-0 left-0" />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            mutation.mutate(values);
          }}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting, handleChange }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <FileUpload
                    value={values.videoUrl}
                    onChange={(url) => setFieldValue('videoUrl', url)}
                    onFileUpload={(file, progress) => storageService.uploadVideo(file, tempId, progress)}
                    accept="video/*"
                    label="Video File"
                    maxSizeMB={100}
                  />
                  <ErrorMessage name="videoUrl" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image *
                  </label>
                  <FileUpload
                    value={values.thumbnailUrl}
                    onChange={(url) => setFieldValue('thumbnailUrl', url)}
                    onFileUpload={(file, progress) => storageService.uploadVideoThumbnail(file, tempId, progress)}
                    accept="image/*"
                    label="Thumbnail Image"
                    maxSizeMB={10}
                  />
                  <ErrorMessage name="thumbnailUrl" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds) *
                  </label>
                  <Field
                    name="duration"
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage name="duration" component="div" className="text-red-600 text-sm mt-1" />
                </div>

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

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/videos')}
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
                    : (isEditing ? 'Create Video' : 'Create Video')
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

export default VideoForm;