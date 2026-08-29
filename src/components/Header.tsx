import React from 'react';
import { Settings, Brain, Flame, Home, LineChart, BookOpen, Users, User, Plus, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { TabType } from './BottomNav';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSettings: () => void;
  onStartSession: () => void;
  userProfile: UserProfile;
  onLogOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onStartSession,
  userProfile,
  onLogOut,
}) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'progress', label: 'Analytics', icon: LineChart },
    { id: 'wisdom', label: 'Wisdom Vault', icon: BookOpen },
    { id: 'challenges', label: 'Community', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                AI MindSelf
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block whitespace-nowrap truncate">
              AI Metacognitive Console
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{userProfile.currentStreakDays}d Streak</span>
          </div>

          {/* Quick Start Session Button */}
          <button
            onClick={onStartSession}
            className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Reframing Session</span>
          </button>

          {/* User Profile Quick Access */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
            title="View Profile"
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
              {userProfile.name}
            </span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Settings & System Controls"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Log Out Button */}
          <button
            onClick={onLogOut}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
            title="Log Out & Switch User"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};


