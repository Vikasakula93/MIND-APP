import React from 'react';
import { X, TrendingUp, Brain, Calendar } from 'lucide-react';
import { RecentInsight } from '../types';

interface InsightDetailModalProps {
  insight: RecentInsight | null;
  onClose: () => void;
}

export const InsightDetailModal: React.FC<InsightDetailModalProps> = ({
  insight,
  onClose,
}) => {
  if (!insight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {insight.iconType === 'trend' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{insight.title}</h3>
              <p className="text-[11px] font-mono text-slate-500">Metacognitive Insight Log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 w-fit">
            <Calendar className="w-3.5 h-3.5" />
            <span>LOGGED: {insight.date}</span>
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{insight.subtitle}</h4>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {insight.fullContent}
          </p>

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


