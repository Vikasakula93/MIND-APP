import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, RefreshCw, Bookmark, BookmarkCheck, Copy, Check, Quote, Sun, HeartHandshake, Compass } from 'lucide-react';
import { UserProfile } from '../types';

interface DailyAffirmationWidgetProps {
  userProfile: UserProfile;
}

interface AffirmationData {
  greeting: string;
  affirmationText: string;
  focusMantra: string;
  stoicMicroTip: string;
  themeTag: string;
}

export const DailyAffirmationWidget: React.FC<DailyAffirmationWidgetProps> = ({ userProfile }) => {
  const [affirmation, setAffirmation] = useState<AffirmationData>({
    greeting: `Good Morning, ${userProfile.name}!`,
    affirmationText: `Today, I honor my ${userProfile.streakDays}-day momentum. I possess the clarity to question automatic fears and the calm strength to meet any challenge with steady intention.`,
    focusMantra: 'Calm Focus, Purposeful Action',
    stoicMicroTip: 'Before reacting to friction today, pause for one full breath and choose your response rather than yielding to impulse.',
    themeTag: 'Morning Restructuring',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const fetchAffirmation = async () => {
    setLoading(true);
    setIsSaved(false);
    try {
      const response = await fetch('/api/cbt/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userProfile.name,
          streakDays: userProfile.streakDays,
          clarityScore: userProfile.clarityScore,
          topDistortion: 'Catastrophizing',
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      if (data.affirmationText) {
        setAffirmation(data);
      }
    } catch (err) {
      console.warn('Using client affirmation fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally fetch on mount once
    fetchAffirmation();
  }, []);

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${affirmation.greeting}. ${affirmation.affirmationText} Daily mantra: ${affirmation.focusMantra}`);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const prefVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (prefVoice) utterance.voice = prefVoice;

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      setIsSpeaking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${affirmation.affirmationText}" — Mantra: ${affirmation.focusMantra}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
      {/* Subtle Glowing Background Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner">
            <Sun className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              AI Morning Restructuring
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">{affirmation.greeting}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {affirmation.themeTag}
          </span>
          <button
            onClick={fetchAffirmation}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60 disabled:opacity-50"
            title="Generate fresh AI Affirmation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Affirmation Quote Box */}
      <div className="relative z-10 my-3 bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl space-y-3">
        <div className="flex items-start gap-3">
          <Quote className="w-8 h-8 text-amber-400/60 shrink-0 rotate-180" />
          <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed italic">
            {loading ? (
              <span className="animate-pulse text-slate-400">Crafting personalized morning affirmation using Gemini AI...</span>
            ) : (
              affirmation.affirmationText
            )}
          </p>
        </div>

        {/* Daily Mantra Badge */}
        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 font-mono">Daily Focus Mantra:</span>
              <span className="text-xs font-bold text-white bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                "{affirmation.focusMantra}"
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeechToggle}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Listen to Affirmation"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSpeaking ? 'Pause' : 'Listen'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
                title="Copy Affirmation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
                title="Save to Wisdom Vault"
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stoic Micro-Tip & Mood Lock-In Footer */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Compass className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="line-clamp-1">
            <strong className="text-teal-300">Micro-Action:</strong> {affirmation.stoicMicroTip}
          </span>
        </div>

        {/* Mood Check-In Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-400 mr-1">Lock in mindset:</span>
          {['Grounded 🧘', 'Empowered ⚡', 'Calm 🌊'].map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                selectedMood === mood
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
