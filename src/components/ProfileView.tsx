import React from 'react';
import {
  Award,
  Bell,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  HelpCircle,
  LogOut,
  ChevronRight,
  Flame,
  UserCheck,
  Zap,
} from 'lucide-react';
import { UserProfile, UserPreferences, BadgeItem } from '../types';

interface ProfileViewProps {
  userProfile: UserProfile;
  preferences: UserPreferences;
  badges: BadgeItem[];
  onTogglePreference: (key: keyof UserPreferences) => void;
  onOpenSettings: () => void;
  onOpenHelpModal: () => void;
  onOpenBadgesModal: () => void;
  onLogOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  preferences,
  badges,
  onTogglePreference,
  onOpenSettings,
  onOpenHelpModal,
  onOpenBadgesModal,
  onLogOut,
}) => {
  const isGuest = userProfile.name === 'Guest User' || !userProfile.name;

  return (
    <div className="space-y-6 pb-24 md:pb-12 pt-2 font-sans animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Main Profile Header */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-3 pt-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-2 border-indigo-500 p-1 bg-slate-50 dark:bg-slate-800 shadow-md overflow-hidden">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm">
                LVL {userProfile.level}
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {userProfile.name}
              </h1>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {userProfile.title}
              </p>
              {isGuest && (
                <span className="inline-block text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded mt-1">
                  Guest Session Active
                </span>
              )}
            </div>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-3 text-center">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {userProfile.totalXp.toLocaleString()}
              </span>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">
                Total XP
              </p>
            </div>

            <div className="p-3 text-center">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {userProfile.sessionsCompletedCount}
              </span>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">
                Reframes
              </p>
            </div>

            <div className="p-3 text-center">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {userProfile.experimentsCompletedCount}
              </span>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">
                Tasks
              </p>
            </div>
          </div>

          {/* Accreditation Badges Section */}
          <div className="space-y-3 pt-2 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Accreditation Badges
              </span>
              <button
                onClick={onOpenBadgesModal}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                View All ({badges.length})
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  onClick={onOpenBadgesModal}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center space-y-1.5 cursor-pointer hover:border-indigo-500 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: System Preferences & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              System Preferences & Controls
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              {/* Push Reminders */}
              <div
                onClick={() => onTogglePreference('notificationsEnabled')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Daily Reframing Reminders
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Receive metacognitive prompt notifications
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                  preferences.notificationsEnabled
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}>
                  {preferences.notificationsEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              {/* Theme Mode */}
              <div
                onClick={() => onTogglePreference('darkMode')}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {preferences.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Display Mode
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Toggle dark and light theme palettes
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                  {preferences.darkMode ? 'Dark Slate' : 'Light Mode'}
                </span>
              </div>

              {/* Privacy & Settings */}
              <div
                onClick={onOpenSettings}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Security & Local Data Backup
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Manage client-side encryption and JSON exports
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Help Documentation */}
              <div
                onClick={onOpenHelpModal}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      CBT Method Guide & Methodology
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Learn the 5-step cognitive reframing framework
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-4 text-center space-y-3">
              <button
                onClick={onLogOut}
                className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out & Switch User</span>
              </button>

              <p className="text-[11px] font-mono text-slate-400">
                MindDojo CBT Console v2.5.0 • Client-side local encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

