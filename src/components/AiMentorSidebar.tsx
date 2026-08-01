import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Bot,
  MessageSquare,
  Volume2,
  VolumeX,
  Send,
  HelpCircle,
  AlertTriangle,
  Zap,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

export interface MentorAdviceData {
  therapistNudge: string;
  socraticQuestions: string[];
  cognitiveTrapWarning?: string | null;
  recommendedMicroExercise: string;
  responseMessage?: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}

interface AiMentorSidebarProps {
  currentThought?: string;
  currentEmotion?: string;
  currentStep?: number | string;
  selectedDistortions?: string[];
  isOpen?: boolean;
  onClose?: () => void;
  onSelectSocraticQuestion?: (question: string) => void;
  isEmbedded?: boolean;
}

export const AiMentorSidebar: React.FC<AiMentorSidebarProps> = ({
  currentThought = '',
  currentEmotion = 'Anxiety',
  currentStep = 1,
  selectedDistortions = [],
  isOpen = true,
  onClose,
  onSelectSocraticQuestion,
  isEmbedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<'guidance' | 'chat'>('guidance');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [microExerciseActive, setMicroExerciseActive] = useState<boolean>(false);
  const [exerciseTimer, setExerciseTimer] = useState<number>(30);

  const [advice, setAdvice] = useState<MentorAdviceData>({
    therapistNudge:
      currentThought.trim()
        ? `Notice the emotional weight behind this thought. As your CBT mentor, I invite you to examine whether this represents a certainty or a temporary emotional state.`
        : `Welcome to your CBT session. Type your automatic thought or journal entry, and I will analyze cognitive distortions and provide real-time Socratic guidance.`,
    socraticQuestions: [
      'What factual evidence supports this thought, and what evidence contradicts it?',
      'Is there an alternative, more balanced interpretation of this situation?',
      'If a close friend expressed this exact worry, what advice would you give them?',
    ],
    cognitiveTrapWarning: currentThought.toLowerCase().includes('never') || currentThought.toLowerCase().includes('always')
      ? "Notice the use of absolute words like 'always' or 'never'. This often signals All-or-Nothing thinking."
      : null,
    recommendedMicroExercise: 'Unclench your jaw, drop your shoulders, and take a 4-second deep abdominal breath.',
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'mentor',
      text: 'Greetings. I am Dr. Aurelia, your digital CBT therapist. How are you feeling about your current thought or journal entry?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const lastFetchedThoughtRef = useRef<string>('');

  // Debounced auto-fetch advice when currentThought or step changes
  useEffect(() => {
    if (!currentThought.trim() && !selectedDistortions.length) {
      return;
    }
    if (currentThought.trim() === lastFetchedThoughtRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastFetchedThoughtRef.current = currentThought.trim();
      fetchRealtimeAdvice();
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentThought, currentEmotion, currentStep, selectedDistortions]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Micro-exercise timer
  useEffect(() => {
    let interval: any = null;
    if (microExerciseActive && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer((prev) => prev - 1);
      }, 1000);
    } else if (exerciseTimer === 0) {
      setMicroExerciseActive(false);
      setExerciseTimer(30);
    }
    return () => clearInterval(interval);
  }, [microExerciseActive, exerciseTimer]);

  const fetchRealtimeAdvice = async (customQuery?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cbt/mentor-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentThought,
          currentEmotion,
          currentStep,
          selectedDistortions,
          userQuery: customQuery || undefined,
        }),
      });

      if (response.ok) {
        const data: MentorAdviceData = await response.json();
        setAdvice((prev) => ({
          ...prev,
          therapistNudge: data.therapistNudge || prev.therapistNudge,
          socraticQuestions: data.socraticQuestions?.length ? data.socraticQuestions : prev.socraticQuestions,
          cognitiveTrapWarning: data.cognitiveTrapWarning,
          recommendedMicroExercise: data.recommendedMicroExercise || prev.recommendedMicroExercise,
        }));

        if (data.responseMessage && customQuery) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: 'mentor',
              text: data.responseMessage!,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
    } catch (err) {
      console.warn('Fallback to local CBT mentor guidance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || userQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setUserQuery('');
    fetchRealtimeAdvice(query);
  };

  const toggleSpeech = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const prefVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google'))
      );
      if (prefVoice) utterance.voice = prefVoice;

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      className={`${
        isEmbedded
          ? 'w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden'
          : 'w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl z-40'
      } font-sans text-slate-100 animate-fade-in`}
    >
      {/* Sidebar Header: Therapist Profile & Status */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">Dr. Aurelia</h3>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-semibold">
                CBT Therapist
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              {loading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  <span>Analyzing cognition...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Real-time Guidance Active</span>
                </>
              )}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center p-1 bg-slate-950/80 border-b border-slate-800 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('guidance')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'guidance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Live Guidance</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-teal-300" />
          <span>Therapist Chat</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'guidance' ? (
          <>
            {/* Cognitive Trap Warning Box (if applicable) */}
            {advice.cognitiveTrapWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1 animate-pulse">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] text-amber-400">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cognitive Distortion Warning</span>
                </div>
                <p className="leading-relaxed">{advice.cognitiveTrapWarning}</p>
              </div>
            )}

            {/* Main Therapist Nudge Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Therapist Observation
                </span>
                <button
                  onClick={() => toggleSpeech(advice.therapistNudge)}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                    isSpeaking ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Listen to therapist nudge"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic font-medium">
                "{advice.therapistNudge}"
              </p>
            </div>

            {/* Socratic Reframing Inquiry Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                  Socratic Inquiry Questions
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Click to adopt</span>
              </div>

              <div className="space-y-2">
                {advice.socraticQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onSelectSocraticQuestion) onSelectSocraticQuestion(q);
                      handleSendMessage(`How do I answer this question: "${q}"?`);
                      setActiveTab('chat');
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-950/30 transition-all cursor-pointer group flex items-start justify-between gap-2"
                  >
                    <span className="text-xs text-slate-300 group-hover:text-white leading-relaxed">
                      {q}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Somatic Grounding Micro-Exercise */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Somatic Grounding Tip</span>
                </div>
                {microExerciseActive && (
                  <span className="text-xs font-mono font-bold text-amber-400 animate-pulse">
                    {exerciseTimer}s remaining
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{advice.recommendedMicroExercise}</p>

              <button
                onClick={() => {
                  setMicroExerciseActive(true);
                  setExerciseTimer(30);
                }}
                disabled={microExerciseActive}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{microExerciseActive ? 'Grounding in Progress...' : 'Start 30s Grounding Pause'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Therapist Chat Tab */
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex-1 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] opacity-60 text-right block pt-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Therapist Prompt Chips */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">Quick Prompts:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Help me reframe this thought',
                  'Is this emotional reasoning?',
                  'Give me a Stoic perspective',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    className="text-[11px] bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500 text-slate-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Dr. Aurelia anything..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!userQuery.trim() || loading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
