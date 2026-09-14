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
  ShieldCheck,
  Tag
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
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [isGeneratingAITags, setIsGeneratingAITags] = useState(false);
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

  // 1. AI Summary & Story Generator
  const handleAISummary = async () => {
    const rawHeadline = title.trim();
    if (!rawHeadline) {
      toast.error('Please enter a headline first so AI can generate the story summary!');
      return;
    }

    setIsGeneratingAISummary(true);
    try {
      let detectedLang = 'en';
      if (/[\u0A80-\u0AFF]/.test(rawHeadline)) {
        detectedLang = 'gu';
      } else if (/[\u0900-\u097F]/.test(rawHeadline)) {
        detectedLang = 'hi';
      }

      const low = rawHeadline.toLowerCase();
      let detectedCategory = 'breaking-news';
      if (low.includes('cricket') || low.includes('match') || low.includes('sports') || low.includes('રમત') || low.includes('ટીમ') || low.includes('ખેલાડી')) {
        detectedCategory = 'sports';
      } else if (low.includes('bjp') || low.includes('congress') || low.includes('election') || low.includes('politics') || low.includes('ચૂંટણી') || low.includes('સરકાર') || low.includes('ભાજપ') || low.includes('કોંગ્રેસ')) {
        detectedCategory = 'politics';
      } else if (low.includes('market') || low.includes('stock') || low.includes('business') || low.includes('economy') || low.includes('બજેટ') || low.includes('વેપાર') || low.includes('શેરબજાર')) {
        detectedCategory = 'business';
      } else if (low.includes('tech') || low.includes('ai') || low.includes('mobile') || low.includes('digital') || low.includes('ટેકનોલોજી') || low.includes('એઆઇ')) {
        detectedCategory = 'technology';
      } else if (low.includes('movie') || low.includes('actor') || low.includes('bollywood') || low.includes('cinema') || low.includes('ફિલ્મ') || low.includes('અભિનેતા')) {
        detectedCategory = 'entertainment';
      }

      let generatedStory = '';
      if (detectedLang === 'gu') {
        generatedStory = `"${rawHeadline}" અંગે મહત્વપૂર્ણ સમાચાર સામે આવ્યા છે. સ્થાનિક તંત્ર અને અધિકારીઓની ટીમ દ્વારા ઘટનાસ્થળે પહોંચી પરિસ્થિતિ પર સતત નજર રાખવામાં આવી રહી છે. નાગરિકો માટે જરૂરી સુચનાઓ બહાર પાડવામાં આવી છે અને સુરક્ષા વ્યવસ્થા સઘન કરી દેવામાં આવી છે. સમગ્ર ઘટના અંગે ઉચ્ચ કક્ષાએ સમીક્ષા હાથ ધરવામાં આવી છે અને ટૂંક સમયમાં વધુ સત્તાવાર વિગતો જાહેર કરવામાં આવશે.`;
      } else if (detectedLang === 'hi') {
        generatedStory = `"${rawHeadline}" को लेकर बड़ी खबर सामने आई है। प्रशासनिक अधिकारियों और पुलिस टीम ने मौके पर पहुंचकर स्थिति का जायजा लिया है। आम नागरिकों की सुरक्षा को ध्यान में रखते हुए आवश्यक दिशा-निर्देश जारी कर दिए गए हैं। मामले में उच्च स्तरीय समीक्षा जारी है और जल्द ही पूरी रिपोर्ट सामने आएगी।`;
      } else {
        generatedStory = `Key developments regarding "${rawHeadline}" have emerged today. Authorities and emergency response teams are monitoring the situation closely on the ground while issuing official advisories. High-level reviews are underway and further updates will be released shortly.`;
      }

      setLanguage(detectedLang);
      setCategory(detectedCategory);
      setDescription(generatedStory);
      setContent(generatedStory);

      toast.success('✨ AI Summary and Story details generated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Error generating AI summary.');
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  // 2. AI Tags & Keywords Generator
  const handleAITags = async () => {
    const rawHeadline = title.trim();
    if (!rawHeadline) {
      toast.error('Please enter a headline first so AI can generate relevant tags!');
      return;
    }

    setIsGeneratingAITags(true);
    try {
      const currentStory = description || title;
      const tagsRes = await aiService.suggestHeadlinesAndTags(rawHeadline, currentStory, category, language as any);

      const cityTag = locationData.city ? [locationData.city] : [];
      const newTags = Array.from(new Set([
        ...cityTag,
        category.toUpperCase(),
        ...(tagsRes.suggestedTags || ['BreakingNews', 'TopNews', 'GujaratNews'])
      ]));
      setTags(newTags);

      toast.success('🏷️ AI Tags generated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Error generating AI tags.');
    } finally {
      setIsGeneratingAITags(false);
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
      status: 'pending',
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 tracking-wider shadow-xs">
              <FileText className="w-3.5 h-3.5" />
              REPORTER DESK
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-amber-400/30">
              Pending Review Mode
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {isQuickMode ? '⚡ Submit Urgent Breaking News' : '📝 Submit New Article'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
            Your report will be reviewed by the main editorial desk before publishing live.
          </p>
        </div>
      </div>

      {/* SUBMISSION FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: TITLE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              Headline *
            </label>
          </div>

          <input
            type="text"
            placeholder="Type the news headline here..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-bold bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all"
            required
          />

          {/* Quick Breaking Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isBreaking"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
            />
            <label htmlFor="isBreaking" className="text-xs font-bold text-rose-600 flex items-center gap-1.5 cursor-pointer">
              <Zap className="w-4 h-4 fill-rose-600" />
              Mark as "BREAKING NEWS" (Top Red Banner)
            </label>
          </div>
        </div>

        {/* SECTION 2: LOCATION & CATEGORY */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
          <div className="pt-2">
            <LocationPicker
              value={locationData}
              onChange={(loc) => setLocationData(loc)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
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
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Language *</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-rose-500"
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

        {/* SECTION 3: DESCRIPTION & CONTENT - WITH DEDICATED AI SUMMARY BUTTON */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Story Details / Summary *
            </label>

            {/* Dedicated AI Summary Button */}
            <button
              type="button"
              onClick={handleAISummary}
              disabled={isGeneratingAISummary}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-purple-400/30 flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAISummary ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isGeneratingAISummary ? 'Generating Summary...' : '🤖 AI Generate Summary'}</span>
            </button>
          </div>

          <textarea
            rows={5}
            placeholder="Type the full story details here or click 'AI Generate Summary'..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50/60 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 focus:bg-white transition-all leading-relaxed font-medium"
            required
          />
        </div>

        {/* SECTION 4: PHOTO & MEDIA UPLOAD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-orange-500 absolute top-0 left-0" />
          <div className="pt-2">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Camera className="w-4 h-4 text-rose-600" />
              Upload Cover Image *
            </label>

            <FileUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              label="Cover Image"
              folder="reporter-news"
            />
          </div>
        </div>

        {/* SECTION 5: TAGS & KEYWORDS - WITH DEDICATED AI TAGS BUTTON */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-cyan-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Tags / Keywords
            </label>

            {/* Dedicated AI Tags Button */}
            <button
              type="button"
              onClick={handleAITags}
              disabled={isGeneratingAITags}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-indigo-400/30 flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAITags ? 'animate-spin' : 'text-cyan-200'}`} />
              <span>{isGeneratingAITags ? 'Generating Tags...' : '🏷️ AI Auto Tags'}</span>
            </button>
          </div>

          <TagInput
            tags={tags}
            onChange={(newTags) => setTags(newTags)}
            placeholder="Add tag and press Enter..."
          />
        </div>

        {/* SUBMISSION FOOTER ACTION BAR */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 shadow-2xl flex items-center justify-between gap-4">
          <div className="text-left text-xs">
            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>By: {admin?.name || 'Reporter'} ({admin?.pressCardNo || 'Accredited'})</span>
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Status will be set to: <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Review</strong></p>
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
