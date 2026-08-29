import React from 'react';
import { X, Award, Sparkles, Flame, Brain, ShieldCheck, Target, CheckCircle2 } from 'lucide-react';
import { BadgeItem } from '../types';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: BadgeItem[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
}) => {
  if (!isOpen) return null;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'brain':
        return <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'target':
        return <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cognitive Mastery Accreditation</h3>
              <p className="text-[11px] font-mono text-slate-500">Accredited Milestones & Badges</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {badge.earnedDate}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{badge.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


