import React from 'react';
import { X, Brain, ShieldAlert, ArrowRight } from 'lucide-react';
import { CognitiveDistortionStat } from '../types';

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  patterns: CognitiveDistortionStat[];
  onStartSession: () => void;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  isOpen,
  onClose,
  patterns,
  onStartSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cognitive Pattern Breakdown</h3>
              <p className="text-[11px] font-mono text-slate-500">30-Day Frequency & Impact Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-4">
            {patterns.map((item) => (
              <div
                key={item.name}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{item.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                    {item.percentage}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Targeting Cognitive Distortions</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consistent metacognitive reframing systematically weakens automated reactive pathways and builds long-term emotional resilience.
            </p>
            <button
              onClick={() => {
                onClose();
                onStartSession();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Practice Reframe Session Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


