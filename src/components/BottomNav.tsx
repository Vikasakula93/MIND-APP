import React from 'react';
import { Home, LineChart, BookOpen, Users, User } from 'lucide-react';

export type TabType = 'home' | 'progress' | 'wisdom' | 'challenges' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Dashboard', icon: Home },
    { id: 'progress' as TabType, label: 'Analytics', icon: LineChart },
    { id: 'wisdom' as TabType, label: 'Wisdom', icon: BookOpen },
    { id: 'challenges' as TabType, label: 'Community', icon: Users },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


