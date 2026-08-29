import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ProgressView } from './components/ProgressView';
import { WisdomView } from './components/WisdomView';
import { ProfileView } from './components/ProfileView';
import { CommunityChallenges } from './components/CommunityChallenges';
import { LoginView } from './components/LoginView';

// Icons for Sidebar
import {
  Brain,
  Home,
  LineChart,
  BookOpen,
  Users,
  User,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Flame,
  Plus,
  LogOut,
} from 'lucide-react';

// Modals
import { CbtSessionModal } from './components/CbtSessionModal';
import { BreakdownModal } from './components/BreakdownModal';
import { NewExperimentModal } from './components/NewExperimentModal';
import { SettingsModal } from './components/SettingsModal';
import { SoundscapeManager } from './components/SoundscapeManager';
import { InsightDetailModal } from './components/InsightDetailModal';
import { BadgesModal } from './components/BadgesModal';
import { HelpModal } from './components/HelpModal';
import { GestureReliefModal } from './components/GestureReliefModal';
import { BodyScanGuideModal } from './components/BodyScanGuideModal';
import { AiMentorSidebar } from './components/AiMentorSidebar';

import {
  UserProfile,
  TodayJourney,
  ActiveExperiment,
  WisdomQuote,
  CognitiveDistortionStat,
  RecentInsight,
  BadgeItem,
  UserPreferences,
  CbtSessionResult,
} from './types';

import {
  initialTodayJourney,
  initialActiveExperiment,
  initialCognitivePatterns,
  initialRecentInsights,
  initialWisdomQuotes,
  initialBadges,
} from './data';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('minddojo_logged_in') === 'true';
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('minddojo_user_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Guest User',
      title: 'Mindfulness Practitioner',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      level: 1,
      totalXp: 0,
      currentStreakDays: 1,
      sessionsCompletedCount: 0,
      experimentsCompletedCount: 0,
      proActive: true,
    };
  });

  const [todayJourney, setTodayJourney] = useState<TodayJourney>(() => {
    const saved = localStorage.getItem('minddojo_today_journey');
    return saved ? JSON.parse(saved) : initialTodayJourney;
  });

  const [activeExperiment, setActiveExperiment] = useState<ActiveExperiment>(() => {
    const saved = localStorage.getItem('minddojo_active_experiment');
    return saved ? JSON.parse(saved) : initialActiveExperiment;
  });

  const [cognitivePatterns, setCognitivePatterns] = useState<CognitiveDistortionStat[]>(() => {
    const saved = localStorage.getItem('minddojo_cognitive_patterns');
    return saved ? JSON.parse(saved) : initialCognitivePatterns;
  });

  const [recentInsights, setRecentInsights] = useState<RecentInsight[]>(() => {
    const saved = localStorage.getItem('minddojo_recent_insights');
    return saved ? JSON.parse(saved) : initialRecentInsights;
  });

  const [wisdomQuotes, setWisdomQuotes] = useState<WisdomQuote[]>(() => {
    const saved = localStorage.getItem('minddojo_wisdom_quotes');
    return saved ? JSON.parse(saved) : initialWisdomQuotes;
  });

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    const saved = localStorage.getItem('minddojo_badges');
    return saved ? JSON.parse(saved) : initialBadges;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('minddojo_preferences');
    return saved
      ? JSON.parse(saved)
      : { notificationsEnabled: true, darkMode: false, privacyLocked: true };
  });

  // Modal States
  const [isCbtModalOpen, setIsCbtModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [isNewExpModalOpen, setIsNewExpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<RecentInsight | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isGestureReliefOpen, setIsGestureReliefOpen] = useState(false);
  const [isBodyScanOpen, setIsBodyScanOpen] = useState(false);
  const [isGlobalMentorOpen, setIsGlobalMentorOpen] = useState(false);

  // Sync dark theme with document html tag
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.darkMode]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('minddojo_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('minddojo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('minddojo_today_journey', JSON.stringify(todayJourney));
  }, [todayJourney]);

  useEffect(() => {
    localStorage.setItem('minddojo_active_experiment', JSON.stringify(activeExperiment));
  }, [activeExperiment]);

  useEffect(() => {
    localStorage.setItem('minddojo_wisdom_quotes', JSON.stringify(wisdomQuotes));
  }, [wisdomQuotes]);

  useEffect(() => {
    localStorage.setItem('minddojo_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Login handler
  const handleLogin = (enteredName: string) => {
    const isGuest = enteredName === 'Guest User' || !enteredName.trim();
    const finalName = isGuest ? 'Guest User' : enteredName.trim();

    setUserProfile({
      name: finalName,
      title: isGuest ? 'Guest Practitioner' : 'Cognitive Mastery Practitioner',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      level: isGuest ? 1 : 2,
      totalXp: isGuest ? 0 : 150,
      currentStreakDays: 1,
      sessionsCompletedCount: 0,
      experimentsCompletedCount: 0,
      proActive: true,
    });

    setIsLoggedIn(true);
    setActiveTab('home');
  };

  // Logout handler
  const handleLogOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('minddojo_logged_in');
  };

  // Handlers for Checklist & Tasks
  const handleToggleJourneyItem = (key: keyof TodayJourney) => {
    setTodayJourney((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleExperiment = () => {
    setActiveExperiment((prev) => {
      const newStatus = !prev.completed;
      if (newStatus && !prev.completed) {
        // Award XP
        setUserProfile((up) => ({
          ...up,
          totalXp: up.totalXp + prev.xpReward,
          experimentsCompletedCount: up.experimentsCompletedCount + 1,
        }));
        setTodayJourney((tj) => ({ ...tj, todaysMission: true }));
      }
      return { ...prev, completed: newStatus };
    });
  };

  const handleCompleteCbtSession = (result: CbtSessionResult) => {
    setUserProfile((prev) => {
      const newXp = prev.totalXp + result.xpGained;
      return {
        ...prev,
        totalXp: newXp,
        level: Math.floor(newXp / 200) + 1,
        sessionsCompletedCount: prev.sessionsCompletedCount + 1,
      };
    });

    setTodayJourney((prev) => ({
      ...prev,
      thoughtCaptured: true,
      cbtReflection: true,
    }));

    // Unlock upcoming wisdom quote if available
    setWisdomQuotes((prev) =>
      prev.map((q) => (!q.unlocked ? { ...q, unlocked: true } : q))
    );

    // Add new insight log
    const newInsight: RecentInsight = {
      id: `ins-${Date.now()}`,
      title: 'Cognitive Reframe Completed',
      subtitle: `Reframed: "${result.cognitiveReframe.slice(0, 50)}..."`,
      iconType: 'brain',
      fullContent: `Original Thought: "${result.originalThought}"\n\nCognitive Reframe: "${result.cognitiveReframe}"\n\nAction Step: "${result.actionStep}"`,
      date: 'Just now',
    };
    setRecentInsights((prev) => [newInsight, ...prev]);
  };

  const handleToggleFavoriteWisdom = (id: string) => {
    setWisdomQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q))
    );
  };

  const handleTogglePreference = (key: keyof UserPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset your local AI MindSelf session data?')) {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserProfile({
        name: 'Guest User',
        title: 'Mindfulness Practitioner',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        level: 1,
        totalXp: 0,
        currentStreakDays: 1,
        sessionsCompletedCount: 0,
        experimentsCompletedCount: 0,
        proActive: true,
      });
      setTodayJourney(initialTodayJourney);
      setActiveExperiment(initialActiveExperiment);
      setCognitivePatterns(initialCognitivePatterns);
      setRecentInsights(initialRecentInsights);
      setWisdomQuotes(initialWisdomQuotes);
      setBadges(initialBadges);
      setIsSettingsModalOpen(false);
    }
  };

  const dailyWisdom = wisdomQuotes.find((q) => q.isInsightOfDay) || wisdomQuotes[0];

  const navItems = [
    { id: 'home' as TabType, label: 'Dashboard', icon: Home, subtitle: 'Practice & Checklist' },
    { id: 'progress' as TabType, label: 'Analytics', icon: LineChart, subtitle: 'Trajectories & Distortions' },
    { id: 'wisdom' as TabType, label: 'Wisdom Vault', icon: BookOpen, subtitle: 'Stoic & Eastern Philosophy' },
    { id: 'challenges' as TabType, label: 'Community', icon: Users, subtitle: 'Sprints & Leaderboard' },
    { id: 'profile' as TabType, label: 'Profile', icon: User, subtitle: 'Badges & Preferences' },
  ];

  // Render Login Screen if not authenticated
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto bg-white dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800 shadow-xl">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 shrink-0 min-h-screen sticky top-0 justify-between">
          <div className="space-y-6">
            {/* Brand Header */}
            <div
              className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block whitespace-nowrap">
                  AI MindSelf
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block whitespace-nowrap">
                  Cognitive Interface
                </span>
              </div>
            </div>

            {/* User Profile Badge */}
            <div
              onClick={() => setActiveTab('profile')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {userProfile.name}
                  </h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                    {userProfile.title}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 block">
                    {userProfile.totalXp} XP
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">
                    {userProfile.currentStreakDays}d
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                Navigation
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">{item.label}</span>
                      <span className={`text-[10px] block ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Start Session CTA */}
            <button
              onClick={() => setIsCbtModalOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Reframing Session</span>
            </button>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleTogglePreference('darkMode')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {preferences.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>Display Theme</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                {preferences.darkMode ? 'Dark' : 'Light'}
              </span>
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Method Guide</span>
            </button>

            <button
              onClick={handleLogOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Navigation */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onStartSession={() => setIsCbtModalOpen(true)}
            userProfile={userProfile}
            onLogOut={handleLogOut}
          />

          {/* Main View Display */}
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'home' && (
              <HomeView
                userProfile={userProfile}
                todayJourney={todayJourney}
                activeExperiment={activeExperiment}
                dailyWisdom={dailyWisdom}
                recentInsights={recentInsights}
                onStartSession={() => setIsCbtModalOpen(true)}
                onToggleJourneyItem={handleToggleJourneyItem}
                onToggleExperiment={handleToggleExperiment}
                onOpenNewExperimentModal={() => setIsNewExpModalOpen(true)}
                onSelectInsight={(ins) => setSelectedInsight(ins)}
                onToggleFavoriteQuote={handleToggleFavoriteWisdom}
                onOpenBodyScan={() => setIsBodyScanOpen(true)}
                onOpenGestureRelief={() => setIsGestureReliefOpen(true)}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView
                userProfile={userProfile}
                cognitivePatterns={cognitivePatterns}
                onOpenBreakdownModal={() => setIsBreakdownModalOpen(true)}
                onStartSession={() => setIsCbtModalOpen(true)}
                onUpdateXp={(amt) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    totalXp: prev.totalXp + amt,
                  }))
                }
              />
            )}

            {activeTab === 'wisdom' && (
              <WisdomView
                wisdomQuotes={wisdomQuotes}
                onToggleFavorite={handleToggleFavoriteWisdom}
                onStartSession={() => setIsCbtModalOpen(true)}
                onOpenGestureRelief={() => setIsGestureReliefOpen(true)}
              />
            )}

            {activeTab === 'challenges' && (
              <CommunityChallenges
                userProfile={userProfile}
                onUpdateXp={(amt) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    totalXp: prev.totalXp + amt,
                  }))
                }
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                badges={badges}
                preferences={preferences}
                onTogglePreference={handleTogglePreference}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenHelpModal={() => setIsHelpModalOpen(true)}
                onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
                onLogOut={handleLogOut}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* All Modals */}
        <CbtSessionModal
          isOpen={isCbtModalOpen}
          onClose={() => setIsCbtModalOpen(false)}
          onCompleteSession={handleCompleteCbtSession}
        />

        <BreakdownModal
          isOpen={isBreakdownModalOpen}
          onClose={() => setIsBreakdownModalOpen(false)}
          patterns={cognitivePatterns}
          onStartSession={() => setIsCbtModalOpen(true)}
        />

        <NewExperimentModal
          isOpen={isNewExpModalOpen}
          onClose={() => setIsNewExpModalOpen(false)}
          onAddExperiment={(exp) => setActiveExperiment(exp)}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          preferences={preferences}
          onTogglePreference={handleTogglePreference}
          onResetData={handleResetData}
        />

        <InsightDetailModal
          insight={selectedInsight}
          onClose={() => setSelectedInsight(null)}
        />

        <BadgesModal
          isOpen={isBadgesModalOpen}
          onClose={() => setIsBadgesModalOpen(false)}
          badges={badges}
        />

        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />

        <GestureReliefModal
          isOpen={isGestureReliefOpen}
          onClose={() => setIsGestureReliefOpen(false)}
          onCompleteExercise={(xpGained) => {
            setUserProfile((prev) => ({
              ...prev,
              totalXp: prev.totalXp + xpGained,
            }));
          }}
        />

        <BodyScanGuideModal
          isOpen={isBodyScanOpen}
          onClose={() => setIsBodyScanOpen(false)}
          onCompleteScan={(xpGained) => {
            setUserProfile((prev) => ({
              ...prev,
              totalXp: prev.totalXp + xpGained,
            }));
          }}
        />

        {/* Global Floating AI Mentor Launcher Button */}
        <button
          onClick={() => setIsGlobalMentorOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3 md:px-4 md:py-3 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30"
          title="Open AI CBT Mentor"
        >
          <div className="relative">
            <Brain className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900" />
          </div>
          <span className="hidden md:inline font-bold text-xs">AI CBT Mentor</span>
        </button>

        {/* Global AI Mentor Slide-Out Drawer Overlay */}
        {isGlobalMentorOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full md:w-96 h-full bg-slate-900 shadow-2xl flex flex-col">
              <AiMentorSidebar
                isOpen={true}
                onClose={() => setIsGlobalMentorOpen(false)}
                isEmbedded={true}
              />
            </div>
          </div>
        )}

        {/* Global Ambient Soundscape Manager */}
        <SoundscapeManager />
      </div>
    </div>
  );
}

