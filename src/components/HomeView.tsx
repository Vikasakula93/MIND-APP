import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  Award,
  BookOpen,
  Volume2,
  Copy,
  Check,
  Plus,
  Info,
  TrendingUp,
  Brain,
  Sparkles,
  Zap,
  Activity,
  Scan,
  Hand,
  Clock,
  EyeOff,
} from 'lucide-react';
import {
  UserProfile,
  TodayJourney,
  ActiveExperiment,
  WisdomQuote,
  RecentInsight,
} from '../types';
import { BreathPacingVisualizer } from './BreathPacingVisualizer';
import { DailyAffirmationWidget } from './DailyAffirmationWidget';
import { DeepWorkFocusMode } from './DeepWorkFocusMode';
import { CircadianRhythmSync } from './CircadianRhythmSync';

interface HomeViewProps {
  userProfile: UserProfile;
  todayJourney: TodayJourney;
  onToggleJourneyItem: (itemKey: keyof TodayJourney) => void;
  activeExperiment: ActiveExperiment;
  onToggleExperiment: () => void;
  onOpenNewExperimentModal: () => void;
  dailyWisdom: WisdomQuote;
  recentInsights: RecentInsight[];
  onSelectInsight: (insight: RecentInsight) => void;
  onStartSession: () => void;
  onToggleFavoriteQuote?: (quoteId: string) => void;
  onOpenBodyScan?: () => void;
  onOpenGestureRelief?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  todayJourney,
  onToggleJourneyItem,
  activeExperiment,
  onToggleExperiment,
  onOpenNewExperimentModal,
  dailyWisdom,
  recentInsights,
  onSelectInsight,
  onStartSession,
  onToggleFavoriteQuote,
  onOpenBodyScan,
  onOpenGestureRelief,
}) => {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBreathPacer, setShowBreathPacer] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  const journeyItems: { key: keyof TodayJourney; label: string; description: string }[] = [
    { key: 'thoughtCaptured', label: 'Capture Automatic Thought', description: 'Log negative or anxious thoughts' },
    { key: 'cbtReflection', label: 'Deconstruct Distortions', description: 'Identify cognitive bias patterns' },
    { key: 'todaysMission', label: 'Behavioral Exposure Task', description: 'Perform 1 real-world mini challenge' },
    { key: 'eveningReflection', label: 'Clarity Audit', description: 'Log cognitive reframing outcome' },
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

  const handleSpeakQuote = () => {
    // Always trigger the harmonic chime so user hears audio feedback instantly!
    playWisdomAudioChime();

    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const textToSpeak = `Quote by ${dailyWisdom.author}. ${dailyWisdom.quote}. Perspective insight: ${
        dailyWisdom.insight || 'Focus on internal clarity.'
      }`;

      setIsSpeaking(true);

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

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (err) => {
          console.warn('Speech synthesis utterance error:', err);
          setIsSpeaking(false);
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
      setIsSpeaking(false);
    }
  };

  const handleCopyQuote = () => {
    const textToCopy = `"${dailyWisdom.quote}" — ${dailyWisdom.author} (${dailyWisdom.source})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const isGuest = userProfile.name === 'Guest User' || !userProfile.name;

  return (
    <div className="space-y-6 pb-24 md:pb-12 pt-2 font-sans animate-fade-in">
      {/* AI Daily Affirmation Widget */}
      <DailyAffirmationWidget userProfile={userProfile} />

      {/* Hero Welcome & Quick Start Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Welcome Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Metacognitive Practice Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back,<br />
              <span className="text-indigo-600 dark:text-indigo-400">{userProfile.name}</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isGuest
                ? 'Welcome to your private guest workspace. Capture thoughts, reframe cognitive distortions, and align your mindset.'
                : 'Your daily cognitive reframing console is ready. Systematically dissect anxious thoughts and build mental resilience.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {userProfile.currentStreakDays} Days
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Streak</div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {userProfile.totalXp} XP
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Level {userProfile.level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI CBT Session Banner */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-900/40 px-2.5 py-1 rounded-md border border-indigo-700/50">
                <Brain className="w-3.5 h-3.5" />
                AI Reframing Assistant
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">10 Min Session</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Deconstruct & Reframe Automatic Thoughts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Engage in structured 5-step Cognitive Behavioral Therapy to identify cognitive distortions, test evidence, and generate objective reframes.
            </p>
          </div>

          <div className="pt-2 relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsFocusModeOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer border border-amber-400/30"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Deep Work Focus Mode</span>
            </button>

            <button
              onClick={onStartSession}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Begin CBT Reframing Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBodyScan}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-teal-600/20 transition-all cursor-pointer border border-teal-400/30"
            >
              <Scan className="w-4 h-4 text-white animate-pulse" />
              <span>AI Body Scan Guide</span>
            </button>

            <button
              onClick={() => setShowBreathPacer(!showBreathPacer)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>3D Breath Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Deep Work Focus Mode Overlay */}
      {isFocusModeOpen && (
        <DeepWorkFocusMode
          userProfile={userProfile}
          onExit={() => setIsFocusModeOpen(false)}
          onSaveJournalEntry={(entry) => {
            onSelectInsight({
              id: `focus-${Date.now()}`,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              trigger: entry.title,
              automaticThought: entry.content,
              cognitiveBias: entry.distortion,
              reframedThought: entry.reframe,
              clarityScoreGain: 20,
            });
          }}
        />
      )}

      {/* Render 3D Breath Pacing Modal when toggled */}
      {showBreathPacer && (
        <BreathPacingVisualizer isOpenModal={true} onClose={() => setShowBreathPacer(false)} />
      )}

      {/* Circadian Rhythm Sync Section */}
      <CircadianRhythmSync
        onStartSession={onStartSession}
        onOpenBreathwork={() => setShowBreathPacer(true)}
      />

      {/* Grid Row 2: Today's Checklist & Behavioral Exposure Task */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Checklist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Daily Metacognitive Checklist</span>
              </h3>
              <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                {Object.values(todayJourney).filter(Boolean).length}/4 Completed
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {journeyItems.map((item) => {
                const isChecked = todayJourney[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggleJourneyItem(item.key)}
                    className="w-full flex items-center justify-between py-3 text-left group transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 shrink-0 transition-colors" />
                      )}
                      <div>
                        <span
                          className={`text-xs font-semibold block transition-all ${
                            isChecked
                              ? 'text-slate-400 line-through'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Behavioral Exposure Task */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Behavioral Exposure Task
                </h3>
              </div>
              <button
                onClick={onOpenNewExperimentModal}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeExperiment.title}
                </h4>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    activeExperiment.completed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  {activeExperiment.completed ? 'COMPLETED' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeExperiment.description}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleExperiment}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                    activeExperiment.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-indigo-500'
                  }`}
                >
                  {activeExperiment.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <span
                  className={`text-xs font-medium ${
                    activeExperiment.completed
                      ? 'line-through text-slate-400'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {activeExperiment.task}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                +{activeExperiment.xpReward} XP
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Test your catastrophic predictions with real evidence.</span>
              </span>
              <span>Expires in {activeExperiment.endsInHours}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 3: Daily Philosophical Wisdom & Recent Reframing Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Wisdom Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Daily Philosophical Wisdom</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSpeakQuote}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                  }`}
                  title={isSpeaking ? 'Stop speech' : 'Listen to quote with AI Audio'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyQuote}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Copy quote to clipboard"
                >
                  {copiedQuote ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <blockquote className="text-base sm:text-lg font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed pl-4 border-l-2 border-indigo-500">
              "{dailyWisdom.quote}"
            </blockquote>

            {dailyWisdom.insight && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">CBT Perspective: </span>
                {dailyWisdom.insight}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">— {dailyWisdom.author}</span>
              <span className="text-slate-500 text-[11px] block">{dailyWisdom.source}</span>
            </div>
            <span className="text-[10px] font-mono font-semibold uppercase bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
              {dailyWisdom.tradition}
            </span>
          </div>
        </div>

        {/* Recent Insights & Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>Recent Reframing Logs</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Click to inspect</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
              {recentInsights.map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => onSelectInsight(insight)}
                  className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group px-2 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      {insight.iconType === 'trend' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {insight.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
