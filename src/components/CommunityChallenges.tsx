import React, { useState } from 'react';
import {
  Users,
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
  Heart,
  MessageSquare,
  Plus,
  Share2,
  UserPlus,
  Globe,
  Star,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';

interface GroupChallenge {
  id: string;
  title: string;
  category: 'Mental Resilience' | 'Anxiety Reframing' | 'Mindfulness & Focus' | 'Stoic Reflections';
  participantsCount: number;
  totalTeamDaysStreak: number;
  daysRemaining: number;
  targetDailyGoal: string;
  progressPercent: number;
  isJoined: boolean;
  description: string;
  rewardXp: number;
  badgeName: string;
  badgeIcon: string;
  leaderboardPreview: Array<{ name: string; avatar: string; streak: number }>;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  totalXp: number;
  badge: string;
  kudosCount: number;
  isCurrentUser?: boolean;
}

interface CommunityChallengesProps {
  userProfile: UserProfile;
  onUpdateXp?: (amount: number) => void;
}

export const CommunityChallenges: React.FC<CommunityChallengesProps> = ({ userProfile, onUpdateXp }) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'circle'>('challenges');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [cheeredUsers, setCheeredUsers] = useState<Record<string, boolean>>({});
  const [kudosCounts, setKudosCounts] = useState<Record<string, number>>({
    '1': 342,
    '2': 289,
    '3': 245,
    '4': 198,
    '5': 176,
    'user-self': 88,
  });

  const [challenges, setChallenges] = useState<GroupChallenge[]>([
    {
      id: 'c1',
      title: '30-Day Stoic Mental Resilience Sprint',
      category: 'Stoic Reflections',
      participantsCount: 5420,
      totalTeamDaysStreak: 18,
      daysRemaining: 12,
      targetDailyGoal: 'Log 1 Thought Reframe & 5-min Breath Pacing daily',
      progressPercent: 78,
      isJoined: true,
      description: 'Train emotional immunity alongside thousands of practitioners using daily cognitive reframing techniques.',
      rewardXp: 500,
      badgeName: 'Unshakeable Fortress',
      badgeIcon: '🛡️',
      leaderboardPreview: [
        { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', streak: 28 },
        { name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', streak: 26 },
        { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', streak: 25 },
      ],
    },
    {
      id: 'c2',
      title: '7-Day Catastrophizing Elimination Circle',
      category: 'Anxiety Reframing',
      participantsCount: 3180,
      totalTeamDaysStreak: 5,
      daysRemaining: 2,
      targetDailyGoal: 'Identify & dispute worst-case assumption every morning',
      progressPercent: 92,
      isJoined: true,
      description: 'Systematically deconstruct catastrophizing spirals with shared evidence-checking prompts.',
      rewardXp: 250,
      badgeName: 'Spirals Disarmed',
      badgeIcon: '⚡',
      leaderboardPreview: [
        { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', streak: 7 },
        { name: 'Aaliyah Patel', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', streak: 7 },
      ],
    },
    {
      id: 'c3',
      title: '14-Day Morning Coherence Breathing Protocol',
      category: 'Mindfulness & Focus',
      participantsCount: 4290,
      totalTeamDaysStreak: 9,
      daysRemaining: 5,
      targetDailyGoal: 'Complete 5 minutes of 3D Breath Pacing before 9 AM',
      progressPercent: 64,
      isJoined: false,
      description: 'Harness bio-feedback pacing and 532Hz harmonic soundscapes to stabilize morning heart rate variability.',
      rewardXp: 350,
      badgeName: 'Coherence Master',
      badgeIcon: '🌊',
      leaderboardPreview: [
        { name: 'Julian Thorne', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', streak: 14 },
        { name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', streak: 12 },
      ],
    },
    {
      id: 'c4',
      title: '21-Day Cognitive Restructuring Masterclass',
      category: 'Mental Resilience',
      participantsCount: 2840,
      totalTeamDaysStreak: 14,
      daysRemaining: 7,
      targetDailyGoal: 'Complete full 6-step CBT session on 4 days per week',
      progressPercent: 50,
      isJoined: false,
      description: 'Master cognitive distortion identification with community peer reflections.',
      rewardXp: 400,
      badgeName: 'Cognitive Architect',
      badgeIcon: '🧠',
      leaderboardPreview: [
        { name: 'Lucas Scott', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', streak: 21 },
      ],
    },
  ]);

  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([
    {
      rank: 1,
      id: '1',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      streakDays: 48,
      totalXp: 4850,
      badge: 'Unshakeable Fortress 🛡️',
      kudosCount: 342,
    },
    {
      rank: 2,
      id: '2',
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      streakDays: 42,
      totalXp: 4120,
      badge: 'Stoic Scholar 🏛️',
      kudosCount: 289,
    },
    {
      rank: 3,
      id: '3',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      streakDays: 39,
      totalXp: 3890,
      badge: 'Spirals Disarmed ⚡',
      kudosCount: 245,
    },
    {
      rank: 4,
      id: 'user-self',
      name: `${userProfile.name} (You)`,
      avatar: userProfile.avatarUrl,
      streakDays: userProfile.currentStreakDays,
      totalXp: userProfile.totalXp,
      badge: 'Mind Dojo Initiate 🥋',
      kudosCount: 88,
      isCurrentUser: true,
    },
    {
      rank: 5,
      id: '5',
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      streakDays: 31,
      totalXp: 3100,
      badge: 'Coherence Master 🌊',
      kudosCount: 176,
    },
  ]);

  const handleJoinToggle = (challengeId: string) => {
    const target = challenges.find((c) => c.id === challengeId);
    if (target && !target.isJoined && onUpdateXp) {
      onUpdateXp(50); // bonus XP for joining
    }

    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId) {
          const nextState = !c.isJoined;
          return {
            ...c,
            isJoined: nextState,
            participantsCount: nextState ? c.participantsCount + 1 : c.participantsCount - 1,
          };
        }
        return c;
      })
    );
  };

  const handleKudos = (userId: string) => {
    if (cheeredUsers[userId]) return;
    setCheeredUsers((prev) => ({ ...prev, [userId]: true }));
    setKudosCounts((prev) => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }));

    // Also update leaderboard state
    setLeaderboardUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kudosCount: u.kudosCount + 1 } : u))
    );
  };

  const filteredChallenges =
    filterCategory === 'all'
      ? challenges
      : challenges.filter((c) => c.category.toLowerCase().includes(filterCategory.toLowerCase()));

  return (
    <div className="space-y-6 pb-24 md:pb-12 pt-2 font-sans animate-fade-in">
      {/* Hero Community Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span>Global Mindfulness Collective</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Community Challenges & Team Streaks
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Join forces with 15,000+ practitioners building emotional resilience together. Complete group CBT missions, maintain collective streak momentum, and unlock exclusive rewards.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <div>
                  <p className="text-xs text-slate-400">Active Participants</p>
                  <p className="text-lg font-black font-mono text-white">15,730</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-400">Combined Streak Days</p>
                  <p className="text-lg font-black font-mono text-amber-300">142,890</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Weekly Goal Reached</p>
                  <p className="text-lg font-black font-mono text-purple-300">84%</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Community Badge Card */}
          <div className="bg-slate-900/80 border border-slate-700/80 p-5 rounded-2xl space-y-3 shadow-xl backdrop-blur-md min-w-[240px]">
            <div className="flex items-center gap-3">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover"
              />
              <div>
                <p className="font-bold text-sm text-white">{userProfile.name}</p>
                <p className="text-xs text-teal-300 font-semibold">{userProfile.title}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Community Rank:</span>
              <span className="font-mono font-bold text-amber-400">#4 Global</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Kudos Received:</span>
              <span className="font-mono font-bold text-pink-400">❤️ {kudosCounts['user-self'] || 88}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Group Challenges ({challenges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Global Leaderboard</span>
          </button>
        </div>

        {activeTab === 'challenges' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter:</span>
            {['all', 'Stoic', 'Anxiety', 'Mindfulness'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Sprint Types' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden ${
                challenge.isJoined
                  ? 'border-indigo-500/50 dark:border-indigo-500/40 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {challenge.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-1">
                    {challenge.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl">{challenge.badgeIcon}</span>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    +{challenge.rewardXp} XP
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {challenge.description}
              </p>

              {/* Target Goal Box */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Daily Goal:
                  </span>
                  <span className="text-slate-500 font-normal">{challenge.daysRemaining} days remaining</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {challenge.targetDailyGoal}
                </p>
              </div>

              {/* Collective Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Team Progress ({challenge.participantsCount.toLocaleString()} members)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {challenge.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${challenge.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Peer Participants Preview & Join Button */}
              <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center -space-x-2">
                  {challenge.leaderboardPreview.map((user, idx) => (
                    <img
                      key={idx}
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                      title={`${user.name} (${user.streak} day streak)`}
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{challenge.participantsCount - challenge.leaderboardPreview.length}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinToggle(challenge.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    challenge.isJoined
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-slate-300 dark:border-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {challenge.isJoined ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Joined Challenge</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Join Sprint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard View */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Global Resilience Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recognizing daily consistency, cognitive reframing discipline, and community support.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboardUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  user.isCurrentUser
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-500/20'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm font-mono ${
                      user.rank === 1
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        : user.rank === 2
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : user.rank === 3
                        ? 'bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    #{user.rank}
                  </div>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                      {user.isCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.badge}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Streak */}
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Streak</p>
                    <p className="text-sm font-bold font-mono text-amber-500 flex items-center gap-1 justify-end">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      {user.streakDays} days
                    </p>
                  </div>

                  {/* Total XP */}
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total XP</p>
                    <p className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {user.totalXp.toLocaleString()} XP
                    </p>
                  </div>

                  {/* High-five / Kudos Button */}
                  <button
                    onClick={() => handleKudos(user.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      cheeredUsers[user.id]
                        ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border-pink-300 dark:border-pink-800'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-400'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        cheeredUsers[user.id] ? 'fill-current text-pink-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{kudosCounts[user.id] || user.kudosCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

