import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Award,
  ArrowRight,
  BarChart2,
  Sparkles,
  Zap,
  Activity,
  Calendar,
  Filter,
  TrendingDown,
  CheckCircle2,
  Sprout,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CognitiveDistortionStat, UserProfile } from '../types';
import { GrowthGardenVisualizer } from './GrowthGardenVisualizer';

interface ProgressViewProps {
  userProfile?: UserProfile;
  cognitivePatterns: CognitiveDistortionStat[];
  onOpenBreakdownModal: () => void;
  onStartSession: () => void;
  onUpdateXp?: (amount: number) => void;
}

// Generate 30 days of cognitive distortion trend data
const generate30DayData = () => {
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Progress factor: gradually reducing distortion intensity from day 0 to 30
    const progressFactor = (29 - i) / 29; // 0 -> 1

    // Add slight realistic daily fluctuation
    const noise1 = Math.sin(i * 0.8) * 4;
    const noise2 = Math.cos(i * 0.6) * 5;
    const noise3 = Math.sin(i * 1.2) * 3;

    const catastrophizing = Math.max(12, Math.round(82 - progressFactor * 60 + noise1));
    const allOrNothing = Math.max(10, Math.round(75 - progressFactor * 55 + noise2));
    const emotionalReasoning = Math.max(14, Math.round(68 - progressFactor * 48 + noise3));
    const mindReading = Math.max(8, Math.round(60 - progressFactor * 45 - noise1));

    const overallClarity = Math.min(96, Math.round(42 + progressFactor * 48 + Math.abs(noise1)));

    data.push({
      day: `Day ${30 - i}`,
      date: dateStr,
      catastrophizing,
      allOrNothing,
      emotionalReasoning,
      mindReading,
      overallClarity,
    });
  }
  return data;
};

const trendData30Days = generate30DayData();

export const ProgressView: React.FC<ProgressViewProps> = ({
  userProfile,
  cognitivePatterns,
  onOpenBreakdownModal,
  onStartSession,
  onUpdateXp,
}) => {
  const [viewTab, setViewTab] = useState<'analytics' | 'garden'>('analytics');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'catastrophizing' | 'allOrNothing' | 'emotionalReasoning' | 'mindReading'>('all');

  const weeklyData = [
    { week: 'W1', score: 45, label: 'Week 1: Initial Baseline (45% Clarity)' },
    { week: 'W2', score: 58, label: 'Week 2: Thought Capture Routine (58% Clarity)' },
    { week: 'W3', score: 68, label: 'Week 3: Evidence Testing (68% Clarity)' },
    { week: 'W4', score: 79, label: 'Week 4: Reframing Mastery (79% Clarity)' },
    { week: 'W5', score: 87, label: 'Week 5: Optimal Cognitive Balance (87% Clarity)' },
  ];

  // Fallback default user profile if none passed
  const currentProfile: UserProfile = userProfile || {
    name: 'Practitioner',
    level: 2,
    totalXp: 1250,
    streakDays: 14,
    clarityScore: 85,
    completedSessionsCount: 18,
    badges: [],
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 pt-2 font-sans animate-fade-in">
      {/* View Switcher Sub-Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewTab('analytics')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              viewTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Clarity Analytics</span>
          </button>

          <button
            onClick={() => setViewTab('garden')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              viewTab === 'garden'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sprout className="w-4 h-4 animate-bounce" />
            <span>3D Growth Garden</span>
          </button>
        </div>

        <button
          onClick={onStartSession}
          className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800"
        >
          <Zap className="w-4 h-4" />
          <span>Log CBT Session</span>
        </button>
      </div>

      {viewTab === 'garden' ? (
        <GrowthGardenVisualizer userProfile={currentProfile} onUpdateXp={onUpdateXp} />
      ) : (
        <>
          {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <BarChart2 className="w-4 h-4" />
            <span>Metacognitive Analytics & Distortion Distribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cognitive Clarity & Pattern Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Track your cognitive clarity trajectory over time and analyze identified distortion patterns to target your reflection practice.
          </p>
        </div>

        <button
          onClick={onStartSession}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0 flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Grid Container for Trajectory & Cognitive Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Clarity Trajectory Graph */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                TRAJECTORY METRIC: META-CLN-01
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <span>Cognitive Clarity Score</span>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  +12% This Week
                </span>
              </h2>
            </div>
          </div>

          {/* Interactive Smooth SVG Graph */}
          <div className="relative pt-4 pb-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4">
            {hoveredWeek !== null && (
              <div className="absolute top-3 right-4 bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                {weeklyData[hoveredWeek].label}
              </div>
            )}

            <div className="h-40 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="clarityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path
                  d="M 10 80 Q 70 65, 130 50 T 230 25 T 290 20 L 290 100 L 10 100 Z"
                  fill="url(#clarityGradient)"
                />

                {/* Smooth Spline Line */}
                <path
                  d="M 10 80 Q 70 65, 130 50 T 230 25 T 290 20"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Point Markers */}
                {[
                  { x: 10, y: 80, idx: 0 },
                  { x: 80, y: 62, idx: 1 },
                  { x: 150, y: 45, idx: 2 },
                  { x: 220, y: 28, idx: 3 },
                  { x: 290, y: 20, idx: 4 },
                ].map((pt) => (
                  <circle
                    key={pt.idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredWeek === pt.idx ? '6' : '4'}
                    className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2 cursor-pointer transition-all hover:scale-125"
                    onMouseEnter={() => setHoveredWeek(pt.idx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  />
                ))}
              </svg>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-700/60 px-1">
              {weeklyData.map((d, i) => (
                <span
                  key={d.week}
                  className={`cursor-pointer transition-colors ${
                    hoveredWeek === i ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''
                  }`}
                  onMouseEnter={() => setHoveredWeek(i)}
                  onMouseLeave={() => setHoveredWeek(null)}
                >
                  {d.week}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cognitive Patterns Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                PATTERN FREQUENCY ANALYSIS
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Identified Distortion Distributon
              </h2>
            </div>

            <div className="space-y-4">
              {cognitivePatterns.map((pattern) => (
                <div key={pattern.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>{pattern.name}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{pattern.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${pattern.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onOpenBreakdownModal}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center justify-between w-full group transition-colors cursor-pointer"
            >
              <span>View Detailed Cognitive Distortion Breakdown</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Cognitive Trend Analysis (Recharts Interactive Visualization) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>30-Day Longitudinal Cognitive Distortion Reduction</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Cognitive Trend Analytics</span>
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                -64% Distortion Frequency
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Track the steady decrease in cognitive distortion triggers over the last 30 days as your reframing habit solidifies.
            </p>
          </div>

          {/* Filter Pill Controls */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-slate-500 uppercase">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {(
              [
                { id: 'all', label: 'All Patterns' },
                { id: 'catastrophizing', label: 'Catastrophizing' },
                { id: 'allOrNothing', label: 'All-or-Nothing' },
                { id: 'emotionalReasoning', label: 'Emotional' },
                { id: 'mindReading', label: 'Mind Reading' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Summary Statistics Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl space-y-1">
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Catastrophizing Drop
            </p>
            <p className="text-2xl font-black text-indigo-950 dark:text-indigo-100 font-mono">-70%</p>
            <p className="text-[10px] text-slate-500">From 82% → 22% frequency</p>
          </div>

          <div className="bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 p-4 rounded-xl space-y-1">
            <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              All-Or-Nothing Reduction
            </p>
            <p className="text-2xl font-black text-purple-950 dark:text-purple-100 font-mono">-57%</p>
            <p className="text-[10px] text-slate-500">From 75% → 18% frequency</p>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl space-y-1">
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Emotional Reasoning
            </p>
            <p className="text-2xl font-black text-amber-950 dark:text-amber-100 font-mono">-54%</p>
            <p className="text-[10px] text-slate-500">From 68% → 23% frequency</p>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-xl space-y-1">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Clarity Score Index
            </p>
            <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-mono">+54 pts</p>
            <p className="text-[10px] text-slate-500">Peak clarity at 96%</p>
          </div>
        </div>

        {/* Interactive Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCatastrophizing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAllOrNothing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEmotional" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMindReading" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" interval={4} />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(val: number) => [`${val}%`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

              {(activeFilter === 'all' || activeFilter === 'catastrophizing') && (
                <Area
                  type="monotone"
                  dataKey="catastrophizing"
                  name="Catastrophizing"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCatastrophizing)"
                />
              )}

              {(activeFilter === 'all' || activeFilter === 'allOrNothing') && (
                <Area
                  type="monotone"
                  dataKey="allOrNothing"
                  name="All-or-Nothing"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAllOrNothing)"
                />
              )}

              {(activeFilter === 'all' || activeFilter === 'emotionalReasoning') && (
                <Area
                  type="monotone"
                  dataKey="emotionalReasoning"
                  name="Emotional Reasoning"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEmotional)"
                />
              )}

              {(activeFilter === 'all' || activeFilter === 'mindReading') && (
                <Area
                  type="monotone"
                  dataKey="mindReading"
                  name="Mind Reading"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMindReading)"
                />
              )}

              {activeFilter === 'all' && (
                <Area
                  type="monotone"
                  dataKey="overallClarity"
                  name="Clarity Index"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorClarity)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Featured Philosophical Quotes Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Philosophical Foundations of CBT</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Stoicism */}
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                STOICISM
              </span>
              <blockquote className="text-sm font-serif italic text-slate-200 leading-snug">
                "You have power over your mind — not outside events. Realize this, and you will find strength."
              </blockquote>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <p className="font-bold text-white">— Marcus Aurelius</p>
              <p className="text-[10px] text-slate-400 italic">Meditations</p>
            </div>
          </div>

          {/* Bhagavad Gita */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                INDIAN PHILOSOPHY
              </span>
              <p className="text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "The mind is restless and difficult to restrain, but it is subdued by consistent practice."
              </p>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-700/60">— Lord Krishna (Bhagavad Gita)</p>
          </div>

          {/* Taoism */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                TAOISM
              </span>
              <p className="text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "Nature does not hurry, yet everything is accomplished."
              </p>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-700/60">— Lao Tzu (Tao Te Ching)</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

