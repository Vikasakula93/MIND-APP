import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, ArrowRight, Brain, Shield, Award, Bot, MessageSquare } from 'lucide-react';
import { CbtSessionResult } from '../types';
import { AiMentorSidebar } from './AiMentorSidebar';

interface CbtSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSession: (result: CbtSessionResult) => void;
}

export const CbtSessionModal: React.FC<CbtSessionModalProps> = ({
  isOpen,
  onClose,
  onCompleteSession,
}) => {
  const [step, setStep] = useState<number>(1);
  const [thoughtInput, setThoughtInput] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('Anxiety');
  const [intensity, setIntensity] = useState<number>(75);
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [showMentorSidebar, setShowMentorSidebar] = useState<boolean>(true);

  if (!isOpen) return null;

  const distortionsList = [
    'Catastrophizing',
    'Perfectionism',
    'All-or-Nothing',
    'Mind Reading',
    'Emotional Reasoning',
    'Overgeneralization',
  ];

  const toggleDistortion = (dist: string) => {
    setSelectedDistortions((prev) =>
      prev.includes(dist) ? prev.filter((d) => d !== dist) : [...prev, dist]
    );
  };

  const handleRunAnalysis = async () => {
    if (!thoughtInput.trim()) return;
    setIsAnalyzing(true);
    setStep(4);

    try {
      const response = await fetch('/api/cbt/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thought: thoughtInput,
          emotion: selectedEmotion,
          intensity,
          selectedDistortions,
        }),
      });

      if (!response.ok) throw new Error('CBT analysis failed');
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Error calling CBT API:', err);
      // Fallback result
      setAnalysisResult({
        distortionsIdentified: selectedDistortions.length ? selectedDistortions : ['Catastrophizing'],
        explanation: 'Assuming the absolute worst outcome before evaluating factual evidence.',
        evidenceFor: 'High emotional intensity makes the threat feel imminent.',
        evidenceAgainst: 'Historical facts show that step-by-step preparation resolves challenges effectively.',
        cognitiveReframe: 'I am equipped to handle this challenge step by step without expecting immediate perfection.',
        actionStep: 'Draft a simple 3-item action plan and tackle item #1 right now.',
        wisdomQuote: {
          quote: 'We suffer more often in imagination than in reality.',
          author: 'Seneca',
          tradition: 'Stoicism',
        },
        clarityScoreGain: 50,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinish = () => {
    if (analysisResult) {
      const result: CbtSessionResult = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        originalThought: thoughtInput,
        primaryEmotion: selectedEmotion,
        intensity,
        distortionsIdentified: analysisResult.distortionsIdentified || selectedDistortions,
        explanation: analysisResult.explanation || '',
        evidenceFor: analysisResult.evidenceFor || '',
        evidenceAgainst: analysisResult.evidenceAgainst || '',
        cognitiveReframe: analysisResult.cognitiveReframe || '',
        actionStep: analysisResult.actionStep || '',
        wisdomQuote: analysisResult.wisdomQuote || {
          quote: 'You have control over your mind.',
          author: 'Marcus Aurelius',
          tradition: 'Stoicism',
        },
        xpGained: analysisResult.clarityScoreGain || 50,
      };
      onCompleteSession(result);
    }
    // Reset state
    setStep(1);
    setThoughtInput('');
    setAnalysisResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className={`bg-white dark:bg-slate-900 w-full ${
          showMentorSidebar ? 'max-w-5xl' : 'max-w-xl'
        } border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cognitive Reframing Protocol</h3>
              <p className="text-[11px] font-mono text-slate-500">Stage {step} of 4 • AI-Assisted Deconstruction</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMentorSidebar((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                showMentorSidebar
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">AI CBT Mentor</span>
              <span className="sm:hidden">Mentor</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body & AI Mentor Sidebar Container */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main CBT Protocol Form */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* STEP 1: Thought Capture */}
            {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  STAGE 01 // AUTOMATIC THOUGHT CAPTURE
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Record the Cognition</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Detail the stressful, anxious, or reactive thought exactly as it surfaced.
                </p>
              </div>

              <textarea
                value={thoughtInput}
                onChange={(e) => setThoughtInput(e.target.value)}
                placeholder="E.g., I am going to fail my presentation and everyone will think I am incompetent..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />

              {/* Sample Prompts */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-500">Sample Prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "I'll never finish this project in time.",
                    "They didn't reply so they must be upset with me.",
                    "If it isn't perfect, it's a complete failure.",
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setThoughtInput(sample)}
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!thoughtInput.trim()}
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                <span>Proceed to Emotion Rating</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Emotion & Intensity */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  STAGE 02 // AFFECTIVE RATING
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Identify Emotional State</h4>
              </div>

              {/* Primary Emotion Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Affect:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Anxiety', 'Frustration', 'Sadness', 'Overwhelm', 'Guilt', 'Fear'].map(
                    (emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setSelectedEmotion(emo)}
                        className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                          selectedEmotion === emo
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {emo}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Subjective Distress Intensity:</span>
                  <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400">{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>MILD</span>
                  <span>MODERATE</span>
                  <span>SEVERE</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Tag Distortions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Cognitive Distortion Tags */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  STAGE 03 // PATTERN IDENTIFICATION
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Tag Cognitive Distortions</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Select suspected distortion patterns (AI will cross-validate during synthesis).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {distortionsList.map((dist) => {
                  const isSelected = selectedDistortions.includes(dist);
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => toggleDistortion(dist)}
                      className={`p-3 border rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{dist}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleRunAnalysis}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Synthesize Reframe</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AI Analysis Output */}
          {step === 4 && (
            <div>
              {isAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Deconstructing Cognition...</h4>
                    <p className="text-xs text-slate-500 font-mono uppercase">
                      ANALYZING EVIDENCE // SYNTHESIZING REFRAME
                    </p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-5 animate-fade-in">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                        SYNTHESIZED COGNITIVE REFRAME
                      </span>
                      <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        +{analysisResult.clarityScoreGain || 50} XP
                      </span>
                    </div>
                    <blockquote className="text-sm sm:text-base font-serif italic text-slate-100 leading-snug">
                      "{analysisResult.cognitiveReframe}"
                    </blockquote>
                  </div>

                  {/* Identified Distortions */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Validated Distortions:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.distortionsIdentified?.map((d: string) => (
                        <span
                          key={d}
                          className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                      {analysisResult.explanation}
                    </p>
                  </div>

                  {/* Evidence Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-rose-500 uppercase">
                        FEELING EVIDENCE
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{analysisResult.evidenceFor}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">
                        OBJECTIVE FACTS
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{analysisResult.evidenceAgainst}</p>
                    </div>
                  </div>

                  {/* Action Step */}
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <Shield className="w-4 h-4" />
                      <span>Behavioral Experiment:</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{analysisResult.actionStep}</p>
                  </div>

                  {/* Wisdom Quote */}
                  {analysisResult.wisdomQuote && (
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-center space-y-1">
                      <p className="text-xs font-serif italic text-slate-700 dark:text-slate-300">
                        "{analysisResult.wisdomQuote.quote}"
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        — {analysisResult.wisdomQuote.author} ({analysisResult.wisdomQuote.tradition})
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleFinish}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Save Log & Claim XP</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}
          </div>

          {/* AI Mentor Sidebar Panel */}
          {showMentorSidebar && (
            <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col max-h-[50vh] lg:max-h-none overflow-hidden shrink-0">
              <AiMentorSidebar
                currentThought={thoughtInput}
                currentEmotion={selectedEmotion}
                currentStep={step}
                selectedDistortions={selectedDistortions}
                isOpen={true}
                isEmbedded={true}
                onSelectSocraticQuestion={(q) => {
                  setThoughtInput((prev) => (prev ? `${prev}\n\nReframing note: ${q}` : q));
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


