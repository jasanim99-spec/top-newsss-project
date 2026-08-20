import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { newsService } from '@/services/newsService';
import { aiService } from '@/services/aiService';
import { storageService } from '@/services/storageService';
import { NewsArticle, CATEGORIES, LANGUAGE_OPTIONS } from '@/types';
import VoiceDictationButton from '@/components/Reporter/VoiceDictationButton';
import LocationPicker from '@/components/Reporter/LocationPicker';
import FileUpload from '@/components/Common/FileUpload';
import TagInput from '@/components/Common/TagInput';
import { 
  Send, 
  Sparkles, 
  Zap, 
  Camera, 
  Mic, 
  FileText, 
  AlertCircle, 
  Check, 
  HelpCircle,
  Clock,
  Languages,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SubmitNews: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, admin } = useAuth();

  const isQuickMode = searchParams.get('mode') === 'quick' || searchParams.get('mode') === 'voice';

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('breaking-news');
  const [language, setLanguage] = useState('gu');
  const [topic, setTopic] = useState('local');
  const [tags, setTags] = useState<string[]>(['Breaking', 'LocalNews']);
  const [isBreaking, setIsBreaking] = useState(true);
  const [locationData, setLocationData] = useState<{ city?: string; district?: string }>({
    city: admin?.city || 'Gujarat',
    district: admin?.district || admin?.city || 'Gujarat'
  });

  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const submitMutation = useMutation({
    mutationFn: async (articleData: Partial<NewsArticle>) => {
      return newsService.createNews(articleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reporter-stats'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('🎉 Article submitted successfully! It will be live after editor approval.');
      navigate('/reporter/articles');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error submitting news article.');
    }
  });

  const handleAIAssist = async () => {
    if (!title && !description && !content) {
      toast.error('Please enter a title or description first.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const fullText = `${title}\n${description}\n${content}`;
      const [summaryRes, tagsRes] = await Promise.all([
        aiService.generateSummary(fullText, language as any),
        aiService.suggestHeadlinesAndTags(title, fullText, category, language as any)
      ]);

      if (summaryRes.summary) {
        setAiSummary(summaryRes.summary);
      }
      if (tagsRes.suggestedTags && tagsRes.suggestedTags.length > 0) {
        setTags(prev => Array.from(new Set([...prev, ...tagsRes.suggestedTags])));
      }
      toast.success('🤖 AI Summary and tags generated!');
    } catch (e: any) {
      toast.error(e.message || 'Error running AI generation.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter the article headline.');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter the article description.');
      return;
    }

    if (!imageUrl.trim()) {
      toast.error('Please upload a cover image or enter an image URL.');
      return;
    }

    const finalContent = content.trim() || description.trim();

    const payload: Partial<NewsArticle> = {
      title: title.trim(),
      description: description.trim(),
      content: finalContent,
      imageUrl: imageUrl.trim(),
      category: category.trim().toLowerCase(),
      language: language.trim().toLowerCase(),
      topic: topic.trim().toLowerCase(),
      section: isBreaking ? 'breaking' : 'main',
      tags,
      keywords: tags,
      sourceUrl: '',
      status: 'pending', // Submits to Editorial Review Queue
      authorId: user?.uid || '',
      authorName: admin?.name || user?.email?.split('@')[0] || 'Reporter',
      authorRole: admin?.role || 'reporter',
      authorCity: locationData.city || admin?.city || '',
      pressCardNo: admin?.pressCardNo || '',
      location: locationData,
      aiSummary: aiSummary || undefined,
      isBreaking,
      publishedAt: new Date().toISOString()
    };

    submitMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-gray-900">
              {isQuickMode ? '⚡ Submit Urgent Breaking News' : '📝 Submit New Article'}
            </h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
              Pending Review Mode
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your report will be reviewed by the main editorial desk before publishing live.
          </p>
        </div>

        {/* AI Assist Action */}
        <button
          type="button"
          onClick={handleAIAssist}
          disabled={isGeneratingAI}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : 'text-amber-300'}`} />
          <span>{isGeneratingAI ? 'AI Processing...' : '🤖 AI Smart Fill'}</span>
        </button>
      </div>

      {/* SUBMISSION FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SECTION 1: TITLE & VOICE DICTATION */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>Headline *</span>
            </label>
            <VoiceDictationButton
              language={language}
              onTranscript={(text) => {
                setTitle(prev => {
                  const cleanPrev = prev.trim();
                  const cleanText = text.trim();
                  if (!cleanPrev) return cleanText;
                  return `${cleanPrev} ${cleanText}`;
                });
              }}
            />
          </div>

          <input
            type="text"
            placeholder="Type or speak the news headline here..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-bold bg-slate-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:bg-white transition-all"
            required
          />

          {/* Quick Breaking Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isBreaking"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <label htmlFor="isBreaking" className="text-xs font-bold text-red-600 flex items-center gap-1 cursor-pointer">
              <Zap className="w-3.5 h-3.5" />
              Mark as "BREAKING NEWS" (Top Red Banner)
            </label>
          </div>
        </div>

        {/* SECTION 2: LOCATION & CATEGORY */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <LocationPicker
            value={locationData}
            onChange={(loc) => setLocationData(loc)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#0058be]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Language *</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#0058be]"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: DESCRIPTION & CONTENT */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800">
              Story Details / Summary *
            </label>
            <VoiceDictationButton
              language={language}
              onTranscript={(text) => {
                setDescription(prev => {
                  const cleanPrev = prev.trim();
                  const cleanText = text.trim();
                  if (!cleanPrev) return cleanText;
                  return `${cleanPrev} ${cleanText}`;
                });
              }}
            />
          </div>

          <textarea
            rows={4}
            placeholder="Type or speak the full story details here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:bg-white transition-all leading-relaxed"
            required
          />

          {/* AI Summary Preview if generated */}
          {aiSummary && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900">
              <p className="font-bold flex items-center gap-1 mb-1 text-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                AI Generated Bullet Summary:
              </p>
              <pre className="whitespace-pre-wrap font-sans text-xs">{aiSummary}</pre>
            </div>
          )}
        </div>

        {/* SECTION 4: PHOTO & MEDIA UPLOAD */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#0058be]" />
            Upload Cover Image *
          </label>

          <FileUpload
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            label="Cover Image"
            folder="reporter-news"
          />
        </div>

        {/* SECTION 5: TAGS & KEYWORDS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <label className="text-xs font-bold text-gray-800">Tags / Keywords</label>
          <TagInput
            tags={tags}
            onChange={(newTags) => setTags(newTags)}
            placeholder="Add tag and press Enter..."
          />
        </div>

        {/* SUBMISSION FOOTER ACTION BAR */}
        <div className="sticky bottom-16 md:bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between gap-3">
          <div className="text-left text-xs">
            <p className="font-bold text-gray-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>By: {admin?.name || 'Reporter'} ({admin?.pressCardNo || 'Accredited'})</span>
            </p>
            <p className="text-[10px] text-gray-500">Status will be set to: <strong>Pending Review</strong></p>
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="bg-gradient-to-r from-red-600 via-[#0058be] to-blue-700 hover:from-red-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitMutation.isPending ? 'Submitting...' : 'Submit News Article'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitNews;
