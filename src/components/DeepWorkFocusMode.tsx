import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Brain,
  Shield,
  Award,
  Zap,
  HelpCircle,
  FileText,
  Save,
  Feather,
} from 'lucide-react';
import { UserProfile, RecentInsight } from '../types';

interface DeepWorkFocusModeProps {
  userProfile: UserProfile;
  onExit: () => void;
  onSaveJournalEntry: (entry: { title: string; content: string; reframe: string; distortion: string }) => void;
}

export const DeepWorkFocusMode: React.FC<DeepWorkFocusModeProps> = ({
  userProfile,
  onExit,
  onSaveJournalEntry,
}) => {
  // Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(15 * 60); // 15 mins default
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Audio Ambient Noise State
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Journal Entry State
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [automaticThought, setAutomaticThought] = useState<string>('');
  const [rationalReframe, setRationalReframe] = useState<string>('');
  const [selectedDistortion, setSelectedDistortion] = useState<string>('Catastrophizing');
  const [socraticNote, setSocraticNote] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const distortionsList = [
    'Catastrophizing',
    'All-or-Nothing',
    'Mind Reading',
    'Emotional Reasoning',
    'Overgeneralization',
    'Mental Filter',
  ];

  const socraticPrompts = [
    'What factual, objective evidence supports this thought?',
    'What is the best-case, worst-case, and most realistic outcome?',
    'If a respected colleague shared this concern, what would you say to them?',
    'What is within your immediate 100% sphere of control right now?',
  ];

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Clean up Web Audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientNoise();
    };
  }, []);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer Progress Percentage
  const progressPercent = selectedDuration > 0 ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0;

  // Toggle Timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset Timer
  const resetTimer = (durationSeconds?: number) => {
    const dur = durationSeconds || selectedDuration;
    setSelectedDuration(dur);
    setTimeLeft(dur);
    setIsRunning(false);
    setIsCompleted(false);
  };

  // Add 5 Minutes
  const extendTimer = () => {
    setSelectedDuration((prev) => prev + 300);
    setTimeLeft((prev) => prev + 300);
  };

  // Sound generator using Web Audio API for Ambient Brown Noise
  const toggleAmbientNoise = () => {
    if (isAudioActive) {
      stopAmbientNoise();
      setIsAudioActive(false);
    } else {
      startAmbientNoise();
      setIsAudioActive(true);
    }
  };

  const startAmbientNoise = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter algorithm
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gainNode;
    } catch (e) {
      console.warn('Failed to start ambient noise:', e);
    }
  };

  const stopAmbientNoise = () => {
    try {
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as any).stop?.();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      console.warn('Error stopping audio:', e);
    }
  };

  const playCompletionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Chime error:', e);
    }
  };

  // Word count helper
  const wordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Save Entry Handler
  const handleSave = () => {
    if (!automaticThought.trim()) {
      alert('Please enter your automatic thought before saving.');
      return;
    }

    onSaveJournalEntry({
      title: journalTitle.trim() || 'Deep Work Journal Session',
      content: automaticThought.trim(),
      reframe: rationalReframe.trim() || 'Focusing on actionable steps and objective clarity.',
      distortion: selectedDistortion,
    });

    setSavedSuccess(true);
    playCompletionChime();
    setTimeout(() => {
      onExit();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto font-sans animate-fade-in">
      {/* Ambient Radial Lighting Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-indigo-600/10 via-emerald-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Controls Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-900/80 relative z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Deep Work Focus Mode</h2>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
                Distraction-Free CBT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Peripheral UI dimmed • Cognitive clarity environment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Noise Toggle */}
          <button
            onClick={toggleAmbientNoise}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Ambient Brown Noise"
          >
            {isAudioActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAudioActive ? 'Brown Noise Active' : 'Focus Audio'}</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Focus</span>
          </button>
        </div>
      </div>

      {/* Main Centered Minimalist Focus Workspace */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 my-auto flex flex-col items-center justify-center space-y-8 relative z-10">
        
        {/* High-Contrast Timer Section */}
        <div className="w-full bg-slate-900/80 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          
          {/* Preset Duration Buttons */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            {[
              { label: '5m', sec: 5 * 60 },
              { label: '10m', sec: 10 * 60 },
              { label: '15m', sec: 15 * 60 },
              { label: '25m', sec: 25 * 60 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => resetTimer(preset.sec)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === preset.sec
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* High Contrast Clock Display with Circular Progress SVG */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-slate-950 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="fill-none transition-all duration-500"
                stroke="url(#neonGradient)"
                strokeWidth="8"
                strokeDasharray="264%"
                strokeDashoffset={`${264 - (264 * progressPercent) / 100}%`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Digital Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-wider text-white drop-shadow-md">
                {formatTime(timeLeft)}
              </div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{isRunning ? 'Deep Session Active' : isCompleted ? 'Session Complete' : 'Ready'}</span>
              </div>
            </div>
          </div>

          {/* Timer Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
            </button>

            <button
              onClick={extendTimer}
              className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Add 5 Minutes"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => resetTimer()}
              className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist CBT Journal Entry Form */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Deep CBT Journal Entry</h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {wordCount(`${journalTitle} ${automaticThought} ${rationalReframe}`)} Words
            </div>
          </div>

          {/* Journal Title Intention */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Session Focus / Intention Title
            </label>
            <input
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="e.g., Deconstructing Workplace Anxiety & Imposter Feelings"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Cognitive Distortion Chips */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Primary Cognitive Distortion Pattern
            </label>
            <div className="flex flex-wrap gap-2">
              {distortionsList.map((dist) => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistortion(dist)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    selectedDistortion === dist
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Automatic Thought */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Unfiltered Automatic Thought</span>
              <span className="text-[10px] text-slate-500 font-normal">What is creating friction?</span>
            </label>
            <textarea
              rows={3}
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              placeholder="Describe the exact thought or situation causing stress without filtering..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all leading-relaxed"
            />
          </div>

          {/* Socratic Prompts Helper */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Socratic Inquiry Prompts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {socraticPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setSocraticNote(prompt)}
                  className="text-left text-[11px] p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/40 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
            {socraticNote && (
              <p className="text-xs text-amber-300 italic pt-1 font-mono">
                Active Prompt: {socraticNote}
              </p>
            )}
          </div>

          {/* Step 2: Rational Objective Reframe */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>2. Rational Reframe & Balanced Response</span>
              <span className="text-[10px] text-slate-500 font-normal">Based on objective facts</span>
            </label>
            <textarea
              rows={3}
              value={rationalReframe}
              onChange={(e) => setRationalReframe(e.target.value)}
              placeholder="Write a balanced, self-compassionate alternative perspective..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all leading-relaxed"
            />
          </div>

          {/* Complete & Save Button */}
          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Journal Saved! Returning to Dashboard...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 text-amber-300" />
                <span>Save Journal Entry & Complete Focus (+100 XP)</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Minimal Footer */}
      <div className="p-4 text-center text-xs text-slate-600 font-mono relative z-10">
        Mindful CBT Practice • Zero Distractions • Deep Cognitive Clarity
      </div>
    </div>
  );
};
