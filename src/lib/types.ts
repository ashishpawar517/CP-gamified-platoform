export interface Problem {
  id: string;
  name: string;
  url: string;
  difficulty: number; // 800-3500
  topics: string[];
  timeSpent: number; // minutes
  notes: string;
  solvedAt: string; // ISO date
  xpEarned: number;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  topic: string;
  linkedProblems: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalProblems: number;
  totalNotes: number;
  unlockedAchievements: string[];
  dailyGoal: number;
  problemsToday: number;
}

export interface DailyActivity {
  date: string;
  problemsSolved: number;
  xpEarned: number;
  notesCreated: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: UserStats, problems: Problem[], notes: StudyNote[]) => boolean;
}

export type ViewTab = 'dashboard' | 'problems' | 'notes' | 'stats';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface XPNotification {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}
