export interface UserProfile {
  name: string;
  title: string;
  avatarUrl: string;
  level: number;
  totalXp: number;
  currentStreakDays: number;
  sessionsCompletedCount: number;
  experimentsCompletedCount: number;
  proActive: boolean;
}

export interface TodayJourney {
  thoughtCaptured: boolean;
  cbtReflection: boolean;
  todaysMission: boolean;
  eveningReflection: boolean;
}

export interface ActiveExperiment {
  id: string;
  title: string;
  status: 'Active' | 'Completed' | 'Expired';
  description: string;
  task: string;
  completed: boolean;
  endsInHours: number;
  xpReward: number;
}

export interface WisdomQuote {
  id: string;
  quote: string;
  author: string;
  source: string;
  tradition: string;
  theme?: string;
  insight?: string;
  practicalApplication?: string;
  isInsightOfDay?: boolean;
  unlocked: boolean;
  imageUrl?: string;
  isFavorite?: boolean;
}

export interface CognitiveDistortionStat {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

export interface RecentInsight {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'trend' | 'brain' | 'sparkle' | 'shield';
  fullContent: string;
  date: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  unlocked: boolean;
}

export interface CbtSessionResult {
  id: string;
  timestamp: string;
  originalThought: string;
  primaryEmotion: string;
  intensity: number;
  distortionsIdentified: string[];
  explanation: string;
  evidenceFor: string;
  evidenceAgainst: string;
  cognitiveReframe: string;
  actionStep: string;
  wisdomQuote: {
    quote: string;
    author: string;
    tradition: string;
  };
  xpGained: number;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  darkMode: boolean;
  privacyLocked: boolean;
}

