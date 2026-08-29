import React from 'react';
import { X, HelpCircle, Brain, Sparkles, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI MindSelf Documentation & Philosophy</h3>
              <p className="text-[11px] font-mono text-slate-500">Cognitive Behavioral Methodology</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 space-y-2 shadow-lg">
            <h4 className="font-bold text-white text-base">The Core 3-Stage CBT Methodology</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI MindSelf pairs ancient contemplative traditions (Stoicism, Bhagavad Gita, Taoism) with evidence-based Cognitive Behavioral Reframing.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">1. Capture Automatic Cognitions</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Isolate reactive internal monologue or worst-case assumptions before habitual emotional escalation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">2. Deconstruct & Synthesize</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Identify cognitive distortions and synthesize objective alternative perspective reframes using AI.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">3. Behavioral Exposure Experiments</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Execute controlled micro-tasks to prove new cognitive reframes through lived, real-world feedback.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-sm cursor-pointer mt-2"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};


