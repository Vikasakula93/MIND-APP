import React, { useState } from 'react';
import { X, Sparkles, Loader2, Target, Plus } from 'lucide-react';
import { ActiveExperiment } from '../types';

interface NewExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExperiment: (experiment: ActiveExperiment) => void;
}

export const NewExperimentModal: React.FC<NewExperimentModalProps> = ({
  isOpen,
  onClose,
  onAddExperiment,
}) => {
  const [challengeArea, setChallengeArea] = useState<string>('Professional Outreach');
  const [customTask, setCustomTask] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateAiExperiment = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/cbt/experiment-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeArea }),
      });

      if (!response.ok) throw new Error('Experiment suggestion failed');
      const data = await response.json();

      const newExp: ActiveExperiment = {
        id: `exp-${Date.now()}`,
        title: data.title || 'Exposure Task',
        status: 'Active',
        description: data.description || `Overcoming hesitation in ${challengeArea}.`,
        task: data.task || 'Complete one outreach task today.',
        completed: false,
        endsInHours: data.durationHours || 4,
        xpReward: data.xpReward || 100,
      };

      onAddExperiment(newExp);
      onClose();
    } catch (err) {
      console.error('Error generating experiment:', err);
      // Fallback
      onAddExperiment({
        id: `exp-${Date.now()}`,
        title: 'Micro-Exposure Challenge',
        status: 'Active',
        description: `Overcoming hesitation in ${challengeArea}.`,
        task: customTask || 'Send one direct query or feedback email today.',
        completed: false,
        endsInHours: 4,
        xpReward: 100,
      });
      onClose();
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTask.trim()) return;

    onAddExperiment({
      id: `exp-${Date.now()}`,
      title: 'Exposure Task',
      status: 'Active',
      description: `Overcoming hesitation in ${challengeArea}.`,
      task: customTask,
      completed: false,
      endsInHours: 4,
      xpReward: 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Behavioral Exposure Task</h3>
              <p className="text-[11px] font-mono text-slate-500">Real-World Action Protocol</p>
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Challenge Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Focus Domain:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Professional Outreach',
                'Social Anxiety',
                'Perfectionist Hesitation',
                'Public Speaking',
              ].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setChallengeArea(area)}
                  className={`p-3 text-left border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    challengeArea === area
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator Option */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">AI Challenge Generator</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesize a targeted micro-exposure task for "{challengeArea}".
            </p>
            <button
              onClick={handleGenerateAiExperiment}
              disabled={isAiLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Task...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Synthesize AI Task (+100 XP)</span>
                </>
              )}
            </button>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualCreate} className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Task Description:</label>
            <input
              type="text"
              placeholder="E.g., Apply to one target job opening today..."
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!customTask.trim()}
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Custom Task</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


