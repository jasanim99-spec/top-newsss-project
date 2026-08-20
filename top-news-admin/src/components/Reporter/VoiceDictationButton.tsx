import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Languages } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  language = 'gu',
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'gu-IN' | 'hi-IN' | 'en-IN'>(() => {
    if (language === 'hi') return 'hi-IN';
    if (language === 'en') return 'en-IN';
    return 'gu-IN';
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (language === 'hi') setSpeechLang('hi-IN');
    else if (language === 'en') setSpeechLang('en-IN');
    else setSpeechLang('gu-IN');
  }, [language]);

  const lastTranscriptRef = useRef<string>('');

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const fallbackText = window.prompt('Voice dictation is not natively supported in this browser window. Please type or paste your spoken report here:');
      if (fallbackText && fallbackText.trim()) {
        onTranscript(fallbackText.trim());
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      lastTranscriptRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success(`🎙️ Listening... Speak now in ${speechLang === 'gu-IN' ? 'Gujarati' : speechLang === 'hi-IN' ? 'Hindi' : 'English'}`);
      };

      recognition.onresult = (event: any) => {
        let chunkText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript;
          if (transcript) {
            chunkText += (chunkText ? ' ' : '') + transcript.trim();
          }
        }
        if (chunkText.trim()) {
          onTranscript(chunkText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error('Microphone permission blocked. Click camera/lock icon in browser address bar to allow mic access.');
        } else if (event.error === 'no-speech') {
          toast('No speech detected. Please speak louder into your microphone.', { icon: '🎙️' });
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start voice recognition:', err);
      setIsListening(false);
      toast.error('Failed to start microphone. Please check browser microphone permissions.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    toast.success('🎙️ Voice dictation stopped.');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Speech Language Selector */}
      <select
        value={speechLang}
        onChange={(e) => setSpeechLang(e.target.value as any)}
        disabled={isListening}
        className="text-[11px] font-semibold bg-gray-100 border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0058be]"
      >
        <option value="gu-IN">🎙️ Gujarati</option>
        <option value="hi-IN">🎙️ Hindi</option>
        <option value="en-IN">🎙️ English</option>
      </select>

      {/* Voice Toggle Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/50'
            : 'bg-gradient-to-r from-blue-600 to-[#0058be] hover:from-blue-700 hover:to-blue-800 text-white'
        }`}
        title={isListening ? 'Click to stop voice typing' : 'Click to start voice typing'}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 animate-bounce" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Dictation</span>
          </>
        )}
      </button>
    </div>
  );
};

export default VoiceDictationButton;
