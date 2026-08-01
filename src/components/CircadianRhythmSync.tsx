import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Bell,
  Sliders,
  Calendar,
  Brain,
  ShieldAlert,
  Sunrise,
  Sunset,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';

export type Chronotype = 'lark' | 'balanced' | 'owl' | 'shift';

interface CircadianRhythmSyncProps {
  onStartSession?: () => void;
  onOpenBreathwork?: () => void;
  onCloseModal?: () => void;
  isModalView?: boolean;
}

export const CircadianRhythmSync: React.FC<CircadianRhythmSyncProps> = ({
  onStartSession,
  onOpenBreathwork,
  onCloseModal,
  isModalView = false,
}) => {
  // Saved Chronotype & Settings State
  const [chronotype, setChronotype] = useState<Chronotype>(() => {
    return (localStorage.getItem('minddojo_chronotype') as Chronotype) || 'balanced';
  });

  const [wakeTime, setWakeTime] = useState<string>(() => {
    return localStorage.getItem('minddojo_wake_time') || '07:00';
  });

  const [sleepTime, setSleepTime] = useState<string>(() => {
    return localStorage.getItem('minddojo_sleep_time') || '23:00';
  });

  const [notificationsSynced, setNotificationsSynced] = useState<boolean>(() => {
    return localStorage.getItem('minddojo_circadian_synced') === 'true';
  });

  const [selectedPhaseTab, setSelectedPhaseTab] = useState<'current' | 'windows' | 'settings'>('current');
  const [syncedNotificationMsg, setSyncedNotificationMsg] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('minddojo_chronotype', chronotype);
    localStorage.setItem('minddojo_wake_time', wakeTime);
    localStorage.setItem('minddojo_sleep_time', sleepTime);
    localStorage.setItem('minddojo_circadian_synced', notificationsSynced ? 'true' : 'false');
  }, [chronotype, wakeTime, sleepTime, notificationsSynced]);

  // Current local time calculation
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Calculate current circadian state
  const getCurrentPhaseInfo = () => {
    const hour = currentHour;
    if (hour >= 6 && hour < 9) {
      return {
        title: 'Cortisol Awakening Phase',
        subtitle: 'Optimal for Morning Intentional Reframing & Gratitude',
        icon: Sunrise,
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        badge: '🌅 Morning Prime',
        tip: 'Cortisol is naturally rising. Harness this alertness to set proactive daily intentions before external stressors hit.',
        recommendedAction: 'Morning Intentional Reframe',
      };
    } else if (hour >= 9 && hour < 14) {
      return {
        title: 'Peak Metacognitive Focus Window',
        subtitle: 'Highest Executive Function & Rational Processing',
        icon: Zap,
        color: 'from-indigo-500 to-emerald-500',
        bgColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
        badge: '⚡ Peak Executive Focus',
        tip: 'Your prefrontal cortex efficiency is at its daily zenith. Ideal window for challenging entrenched cognitive distortions and complex journal reframes.',
        recommendedAction: 'Deep CBT Session',
      };
    } else if (hour >= 14 && hour < 17) {
      return {
        title: 'Midday Slump & Cortisol Recovery',
        subtitle: 'Recommended for 3D Breath Pacing or Body Scan',
        icon: Activity,
        color: 'from-teal-500 to-cyan-500',
        bgColor: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
        badge: '🧘 Somatic Recovery',
        tip: 'Alertness naturally dips post-lunch. Avoid heavy cognitive confrontation; focus on somatic regulation, breathing, or a light walk.',
        recommendedAction: '3D Breath Studio',
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        title: 'Evening Perspective & Review Window',
        subtitle: 'Reflect on Daily Wins & De-escalate Stress',
        icon: Sunset,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        badge: '🌆 Evening Integration',
        tip: 'Analytical energy softens as emotional reflection deepens. Great time to log behavioral experiments and celebrate daily wins.',
        recommendedAction: 'Experiment Log',
      };
    } else {
      return {
        title: 'Melatonin Onset & Pre-Sleep De-Clutter',
        subtitle: 'Clear Automatic Thoughts to Lower Sleep-Onset Latency',
        icon: Moon,
        color: 'from-blue-600 to-indigo-900',
        bgColor: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        badge: '🌙 Pre-Sleep De-clutter',
        tip: 'Melatonin levels are climbing. If racing thoughts or anxiety arise, perform a brief 2-minute brain dump to prevent nocturnal rumination.',
        recommendedAction: 'Pre-Sleep Journaling',
      };
    }
  };

  const currentPhase = getCurrentPhaseInfo();

  // Compute 24-hour curve heights for visual chart
  const getCurveData = () => {
    // 24 data points (0:00 to 23:00) representing cognitive alertness score (0-100)
    const baseAlertness = [
      15, 10, 8, 5, 8, 20, 50, 75, 90, 95, 100, 92, 75, 60, 55, 65, 80, 85, 70, 50,
      35, 25, 20, 15,
    ];

    // Adjust based on chronotype shift
    let shift = 0;
    if (chronotype === 'lark') shift = -1.5;
    if (chronotype === 'owl') shift = 2.5;

    return baseAlertness.map((val, idx) => {
      const adjustedIdx = (idx - Math.round(shift) + 24) % 24;
      return {
        hour: idx,
        alertness: baseAlertness[adjustedIdx],
        isCurrent: idx === currentHour,
      };
    });
  };

  const curvePoints = getCurveData();

  const handleSyncNotifications = () => {
    setNotificationsSynced(!notificationsSynced);
    setSyncedNotificationMsg(
      !notificationsSynced
        ? 'Circadian practice alerts synced with your optimal focus windows!'
        : 'Circadian practice alerts paused.'
    );
    setTimeout(() => setSyncedNotificationMsg(null), 3000);
  };

  const currentPhaseIcon = currentPhase.icon;

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden ${
        isModalView ? 'max-w-4xl w-full mx-auto my-auto' : ''
      }`}
    >
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Circadian Rhythm Sync
              </h2>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-semibold">
                Bio-Cognitive Optimization
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Align CBT reframing & breathwork with natural cortisol & prefrontal focus cycles
            </p>
          </div>
        </div>

        {isModalView && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 relative z-10">
        <button
          onClick={() => setSelectedPhaseTab('current')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedPhaseTab === 'current'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Current Bio-Phase</span>
        </button>
        <button
          onClick={() => setSelectedPhaseTab('windows')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedPhaseTab === 'windows'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Optimal Practice Windows</span>
        </button>
        <button
          onClick={() => setSelectedPhaseTab('settings')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedPhaseTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Chronotype Profile</span>
        </button>
      </div>

      {/* Synced Notification Banner */}
      {syncedNotificationMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncedNotificationMsg}</span>
        </div>
      )}

      {/* TAB 1: CURRENT BIO-PHASE STATUS & REAL-TIME WAVE */}
      {selectedPhaseTab === 'current' && (
        <div className="space-y-6 animate-fade-in relative z-10">
          {/* Active Phase Banner */}
          <div className={`p-6 rounded-3xl border ${currentPhase.bgColor} space-y-4 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase font-bold px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-200">
                  {currentPhase.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Current Time: {currentHour.toString().padStart(2, '0')}:
                  {currentMinute.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>{chronotype.toUpperCase()} CHRONOTYPE</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                {React.createElement(currentPhaseIcon, { className: 'w-6 h-6 text-amber-400' })}
                <span>{currentPhase.title}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {currentPhase.subtitle}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 font-mono">
              💡 <span className="font-semibold text-white">Biological Focus Insight:</span> {currentPhase.tip}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onStartSession && (
                <button
                  onClick={onStartSession}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-amber-300" />
                  <span>Launch CBT Reframing Session</span>
                </button>
              )}

              {onOpenBreathwork && (
                <button
                  onClick={onOpenBreathwork}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Start 3D Breath Pacer</span>
                </button>
              )}
            </div>
          </div>

          {/* 24-Hour Circadian Cognitive Curve Visualizer */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>24-Hour Metacognitive Clarity Wave</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Real-time predicted cognitive executive function throughout your day
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> High Focus
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Current Hour
                </span>
              </div>
            </div>

            {/* Bar/Curve Chart Representation */}
            <div className="h-36 w-full flex items-end gap-1 pt-6 pb-2 px-1 relative border-b border-slate-800">
              {curvePoints.map((pt) => {
                const heightPercent = pt.alertness;
                const isCurrent = pt.isCurrent;
                let barColor = 'bg-slate-800';
                if (heightPercent > 75) barColor = 'bg-gradient-to-t from-indigo-600 to-emerald-400';
                else if (heightPercent > 45) barColor = 'bg-indigo-900/80';
                else barColor = 'bg-slate-900';

                if (isCurrent) {
                  barColor = 'bg-amber-400 shadow-lg shadow-amber-400/50';
                }

                return (
                  <div
                    key={pt.hour}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 bg-slate-900 text-[9px] font-mono text-white px-2 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {pt.hour.toString().padStart(2, '0')}:00 - {pt.alertness}% Clarity
                    </div>

                    {isCurrent && (
                      <div className="text-[9px] font-bold text-amber-400 font-mono animate-bounce">
                        YOU
                      </div>
                    )}

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all ${barColor}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>00:00 (Midnight)</span>
              <span>06:00 (Wake)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Sunset)</span>
              <span>23:00 (Sleep)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPTIMAL PRACTICE WINDOWS */}
      {selectedPhaseTab === 'windows' && (
        <div className="space-y-4 animate-fade-in relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Window 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  <Sunrise className="w-3.5 h-3.5" />
                  07:30 AM - 08:30 AM
                </span>
                <span className="text-[10px] font-mono text-slate-400">Cortisol Rise</span>
              </div>
              <h4 className="text-sm font-bold text-white">Morning Intentional Reframe</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log early automatic thoughts & set stoic intentions before external workspace demands accumulate.
              </p>
              <div className="text-[11px] font-mono text-indigo-400 bg-indigo-950/40 p-2 rounded-xl border border-indigo-900/50">
                Recommended: Daily Affirmation Widget + 5-Min Journal
              </div>
            </div>

            {/* Window 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  10:30 AM - 12:30 PM
                </span>
                <span className="text-[10px] font-mono text-slate-400">Peak Executive</span>
              </div>
              <h4 className="text-sm font-bold text-white">Deep Metacognitive Reframing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your highest prefrontal executive capacity. Best for analyzing tough Catastrophizing or All-or-Nothing traps.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/50">
                Recommended: Full 5-Step AI Reframing Session
              </div>
            </div>

            {/* Window 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-teal-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-400 flex items-center gap-1.5 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/30">
                  <Activity className="w-3.5 h-3.5" />
                  02:30 PM - 03:30 PM
                </span>
                <span className="text-[10px] font-mono text-slate-400">Slump Reset</span>
              </div>
              <h4 className="text-sm font-bold text-white">Midday Somatic Regulation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Offset midday fatigue and physiological stress without heavy cognitive burden.
              </p>
              <div className="text-[11px] font-mono text-teal-400 bg-teal-950/40 p-2 rounded-xl border border-teal-900/50">
                Recommended: 3D Box Breathing & AI Body Scan
              </div>
            </div>

            {/* Window 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
                  <Moon className="w-3.5 h-3.5" />
                  09:30 PM - 10:30 PM
                </span>
                <span className="text-[10px] font-mono text-slate-400">Melatonin Window</span>
              </div>
              <h4 className="text-sm font-bold text-white">Pre-Sleep Worry De-Clutter</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unload racing thoughts onto paper to lower bedtime sympathetic arousal and accelerate sleep onset.
              </p>
              <div className="text-[11px] font-mono text-purple-400 bg-purple-950/40 p-2 rounded-xl border border-purple-900/50">
                Recommended: Deep Work Focus Mode Journal
              </div>
            </div>
          </div>

          {/* Sync Reminders Button */}
          <div className="pt-2">
            <button
              onClick={handleSyncNotifications}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                notificationsSynced
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                  : 'bg-slate-950 hover:bg-slate-800 text-indigo-300 border-indigo-500/40'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {notificationsSynced
                  ? 'Circadian Practice Reminders Synced (Active)'
                  : 'Sync Optimal Practice Reminders to Routine'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CHRONOTYPE SETTINGS */}
      {selectedPhaseTab === 'settings' && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Select Your Natural Chronotype Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'lark' as Chronotype,
                  title: '🌅 Early Lark',
                  desc: 'Naturally early wake-up (5:30-6:30 AM). Peak focus occurs early morning.',
                },
                {
                  id: 'balanced' as Chronotype,
                  title: '☀️ Balanced Operator',
                  desc: 'Standard wake-up (7:00-8:00 AM). Peak focus mid-morning & early afternoon.',
                },
                {
                  id: 'owl' as Chronotype,
                  title: '🌙 Night Owl',
                  desc: 'Later wake-up (9:00-10:00 AM). Peak focus late afternoon & evening.',
                },
                {
                  id: 'shift' as Chronotype,
                  title: '⚡ Custom / Shift',
                  desc: 'Variable work schedule. Tailor custom wake and sleep windows below.',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setChronotype(item.id)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer space-y-1.5 ${
                    chronotype === item.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{item.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Typical Wake-up Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Target Bedtime
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-mono text-center">
            Settings auto-save to your MindDojo local practitioner profile.
          </p>
        </div>
      )}
    </div>
  );
};
