import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Volume2,
  Copy,
  Check,
  Heart,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
  Hand,
  Activity,
  Play,
} from 'lucide-react';
import { WisdomQuote } from '../types';

interface WisdomViewProps {
  wisdomQuotes: WisdomQuote[];
  onToggleFavorite: (quoteId: string) => void;
  onStartSession: () => void;
  onOpenGestureRelief?: () => void;
}

export const WisdomView: React.FC<WisdomViewProps> = ({
  wisdomQuotes,
  onToggleFavorite,
  onStartSession,
  onOpenGestureRelief,
}) => {
  const [selectedTradition, setSelectedTradition] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpeechQuoteId, setActiveSpeechQuoteId] = useState<string | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  const traditions = [
    'All',
    'Favorites',
    'Stoicism',
    'Existentialism',
    'Indian Philosophy',
    'Taoism',
    'Buddhism',
  ];

  // Helper to trigger a pleasant Web Audio chime so audio is always audible
  const playWisdomAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Gentle harmonic C5 - G5 chime (523.25Hz -> 783.99Hz)
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);

        osc2.frequency.setValueAtTime(261.63, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(392.0, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.9);
        osc2.stop(ctx.currentTime + 0.9);
      }
    } catch (e) {
      console.warn('Web Audio chime error:', e);
    }
  };

  const handleSpeak = (q: WisdomQuote) => {
    // Always trigger the harmonic chime so user hears audio feedback instantly!
    playWisdomAudioChime();

    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (activeSpeechQuoteId === q.id) {
      window.speechSynthesis.cancel();
      setActiveSpeechQuoteId(null);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const textToSpeak = `Quote by ${q.author}. ${q.quote}. Insight: ${
        q.insight || 'Focus on internal clarity and emotional reframing.'
      }`;

      setActiveSpeechQuoteId(q.id);

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice =
            voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
        }

        utterance.onend = () => setActiveSpeechQuoteId(null);
        utterance.onerror = (err) => {
          console.warn('Speech synthesis utterance error:', err);
          setActiveSpeechQuoteId(null);
        };

        window.speechSynthesis.speak(utterance);

        const resumeInterval = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(resumeInterval);
          } else {
            window.speechSynthesis.resume();
          }
        }, 3000);
      }, 50);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      setActiveSpeechQuoteId(null);
    }
  };

  const handleCopy = (q: WisdomQuote) => {
    const textToCopy = `"${q.quote}" — ${q.author} (${q.source})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQuoteId(q.id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  const filteredQuotes = wisdomQuotes.filter((q) => {
    const matchesSearch =
      q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tradition.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTradition === 'All') return true;
    if (selectedTradition === 'Favorites') return q.isFavorite;
    return q.tradition.toLowerCase() === selectedTradition.toLowerCase();
  });

  const featuredQuote = wisdomQuotes.find((q) => q.isInsightOfDay) || wisdomQuotes[0];

  return (
    <div className="space-y-6 pb-24 md:pb-12 pt-2 font-sans animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Philosophical & Somatic Wisdom Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Timeless Principles & Somatic Relief
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Explore Stoic and Eastern philosophies combined with Cognitive Behavioral Therapy (CBT) insights and interactive Hand Gesture Relief exercises.
          </p>
        </div>

        {/* Right Side Feature Launch Card for Gesture Relief */}
        {onOpenGestureRelief && (
          <div
            onClick={onOpenGestureRelief}
            className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl border border-emerald-700/60 shadow-lg cursor-pointer hover:border-emerald-500 transition-all shrink-0 md:w-80 group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-600/50">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Gesture Relief</span>
              </span>
              <span className="text-[10px] text-emerald-200 font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                Hand Tracking
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                <Hand className="w-4 h-4 text-emerald-400" />
                <span>Hand Gesture Relief Games</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-snug">
                Perform guided somatic hand exercises (Zen Squeeze, Palm Release) to signal nervous system downregulation.
              </p>
            </div>

            <button
              type="button"
              className="w-full bg-emerald-600 group-hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Gesture Relief</span>
            </button>
          </div>
        )}
      </div>

      {/* Featured Insight Banner */}
      {featuredQuote && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-800/60 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-700/50 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Insight of the Day
            </span>

            {/* Audio & Copy Controls for Featured */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeak(featuredQuote)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  activeSpeechQuoteId === featuredQuote.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
                title="Listen to quote"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleCopy(featuredQuote)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors cursor-pointer"
                title="Copy quote"
              >
                {copiedQuoteId === featuredQuote.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => onToggleFavorite(featuredQuote.id)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors cursor-pointer"
                title="Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    featuredQuote.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                  }`}
                />
              </button>
            </div>
          </div>

          <blockquote className="text-lg sm:text-2xl font-serif italic leading-relaxed text-slate-100 max-w-3xl">
            "{featuredQuote.quote}"
          </blockquote>

          {featuredQuote.insight && (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <span className="font-bold text-indigo-300">CBT Perspective: </span>
              {featuredQuote.insight}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="font-bold text-white">— {featuredQuote.author}</span>
              <span className="text-slate-400 text-[11px] block">{featuredQuote.source}</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md border border-indigo-400/30 font-semibold">
              {featuredQuote.tradition}
            </span>
          </div>
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes, authors, or philosophical traditions..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <span className="text-xs font-mono text-slate-500 shrink-0">
            Showing {filteredQuotes.length} Entry{filteredQuotes.length !== 1 ? 'ies' : ''}
          </span>
        </div>

        {/* Tradition Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {traditions.map((tradition) => {
            const isActive = selectedTradition === tradition;
            return (
              <button
                key={tradition}
                onClick={() => setSelectedTradition(tradition)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {tradition === 'Favorites' ? '❤️ Favorites' : tradition}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quote Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredQuotes.map((q) => {
          if (!q.unlocked) {
            return (
              <div
                key={q.id}
                className="bg-slate-100/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Locked Wisdom Vault Entry
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Complete your next AI CBT Reframing Session to unlock this entry.
                  </p>
                </div>
                <button
                  onClick={onStartSession}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer pt-1"
                >
                  <span>Start CBT Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          const isSpeaking = activeSpeechQuoteId === q.id;
          const isCopied = copiedQuoteId === q.id;
          const isExpanded = expandedInsightId === q.id;

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                {/* Header controls for each quote */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md">
                    {q.tradition}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Speak Button */}
                    <button
                      onClick={() => handleSpeak(q)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                      title="Speak quote text-to-speech"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(q)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Copy quote"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Favorite Toggle */}
                    <button
                      onClick={() => onToggleFavorite(q.id)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Favorite quote"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          q.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Quote Text */}
                <blockquote className="text-sm sm:text-base font-serif italic text-slate-800 dark:text-slate-200 leading-snug">
                  "{q.quote}"
                </blockquote>

                {/* Expandable Insight Drawer */}
                {q.insight && (
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedInsightId(isExpanded ? null : q.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Info className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide CBT Insight' : 'View CBT Perspective'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800 animate-fade-in space-y-1.5">
                        <p>{q.insight}</p>
                        {q.practicalApplication && (
                          <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700/60">
                            <strong className="text-slate-700 dark:text-slate-300">Application: </strong>
                            {q.practicalApplication}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">— {q.author}</span>
                  <p className="text-[10px] text-slate-500 font-medium">{q.source}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

