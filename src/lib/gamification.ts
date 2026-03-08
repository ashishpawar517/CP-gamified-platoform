import { Problem, StudyNote, UserStats, Achievement, DifficultyLevel, XPNotification } from './types';
import { getStats, saveStats, getProblems, getNotes, getTodayActivity, updateTodayActivity, addXPNotification } from './storage';

// XP Constants
export const XP_REWARDS = {
  EASY_PROBLEM: 10,
  MEDIUM_PROBLEM: 25,
  HARD_PROBLEM: 50,
  STREAK_BONUS: 5,
  NOTE_CREATED: 5,
};

// Level titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Coder',
  4: 'Problem Solver',
  5: 'Algorithm Expert',
};

export function getLevelTitle(level: number): string {
  if (level >= 6) return 'Code Master';
  return LEVEL_TITLES[level] || 'Novice';
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

// Calculate XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

// Calculate XP needed for current level
export function getXPForCurrentLevel(currentLevel: number): number {
  if (currentLevel <= 1) return 0;
  return Math.pow(currentLevel - 1, 2) * 100;
}

// Get XP progress to next level (0-100)
export function getLevelProgress(totalXP: number): number {
  const level = calculateLevel(totalXP);
  const currentLevelXP = getXPForCurrentLevel(level);
  const nextLevelXP = getXPForNextLevel(level);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
}

// Get difficulty level from rating
export function getDifficultyFromRating(rating: number): DifficultyLevel {
  if (rating < 1400) return 'easy';
  if (rating < 2000) return 'medium';
  return 'hard';
}

// Calculate XP for a problem
export function calculateProblemXP(rating: number, streak: number): number {
  const difficulty = getDifficultyFromRating(rating);
  let baseXP = XP_REWARDS.EASY_PROBLEM;
  
  if (difficulty === 'medium') baseXP = XP_REWARDS.MEDIUM_PROBLEM;
  else if (difficulty === 'hard') baseXP = XP_REWARDS.HARD_PROBLEM;
  
  const streakBonus = streak * XP_REWARDS.STREAK_BONUS;
  return baseXP + streakBonus;
}

// Update streak
export function updateStreak(): { currentStreak: number; longestStreak: number; isNewStreak: boolean } {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let currentStreak = stats.currentStreak;
  let longestStreak = stats.longestStreak;
  let isNewStreak = false;
  
  if (stats.lastActiveDate === today) {
    // Already active today, no change
  } else if (stats.lastActiveDate === yesterday) {
    // Continued streak
    currentStreak += 1;
    isNewStreak = true;
  } else if (!stats.lastActiveDate) {
    // First activity
    currentStreak = 1;
    isNewStreak = true;
  } else {
    // Streak broken
    currentStreak = 1;
    isNewStreak = true;
  }
  
  longestStreak = Math.max(longestStreak, currentStreak);
  
  return { currentStreak, longestStreak, isNewStreak };
}

// Check if activity was today
export function wasActiveToday(): boolean {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  return stats.lastActiveDate === today;
}

// All achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Solve your first problem',
    icon: '🎯',
    requirement: (stats) => stats.totalProblems >= 1,
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: (stats) => stats.longestStreak >= 7,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 30-day streak',
    icon: '💪',
    requirement: (stats) => stats.longestStreak >= 30,
  },
  {
    id: 'problem_hunter',
    name: 'Problem Hunter',
    description: 'Solve 50 problems',
    icon: '🔍',
    requirement: (stats) => stats.totalProblems >= 50,
  },
  {
    id: 'code_warrior',
    name: 'Code Warrior',
    description: 'Solve 100 problems',
    icon: '⚔️',
    requirement: (stats) => stats.totalProblems >= 100,
  },
  {
    id: 'note_taker',
    name: 'Note Taker',
    description: 'Create 10 notes',
    icon: '📝',
    requirement: (stats) => stats.totalNotes >= 10,
  },
  {
    id: 'topic_master',
    name: 'Topic Master',
    description: 'Solve problems from 10 different topics',
    icon: '🏆',
    requirement: (_, problems) => {
      const topics = new Set<string>();
      problems.forEach(p => p.topics.forEach(t => topics.add(t)));
      return topics.size >= 10;
    },
  },
];

// Check for new achievements
export function checkAchievements(): string[] {
  const stats = getStats();
  const problems = getProblems();
  const notes = getNotes();
  const unlockedIds = stats.unlockedAchievements;
  const newAchievements: string[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (!unlockedIds.includes(achievement.id) && achievement.requirement(stats, problems, notes)) {
      newAchievements.push(achievement.id);
    }
  });
  
  return newAchievements;
}

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Record problem solved
export function recordProblemSolved(problem: Problem): { 
  xpEarned: number; 
  newAchievements: string[];
  leveledUp: boolean;
  previousLevel: number;
} {
  const stats = getStats();
  
  // Update streak
  const { currentStreak, longestStreak } = updateStreak();
  
  // Calculate XP
  const xpEarned = calculateProblemXP(problem.difficulty, currentStreak);
  
  // Update stats
  const previousLevel = stats.level;
  const newTotalXP = stats.totalXP + xpEarned;
  const newLevel = calculateLevel(newTotalXP);
  const leveledUp = newLevel > previousLevel;
  
  const today = new Date().toISOString().split('T')[0];
  const problemsToday = stats.lastActiveDate === today ? stats.problemsToday + 1 : 1;
  
  const newStats: UserStats = {
    ...stats,
    totalXP: newTotalXP,
    level: newLevel,
    currentStreak,
    longestStreak,
    lastActiveDate: today,
    totalProblems: stats.totalProblems + 1,
    problemsToday,
  };
  
  saveStats(newStats);
  
  // Update daily activity
  const todayActivity = getTodayActivity();
  updateTodayActivity({
    problemsSolved: todayActivity.problemsSolved + 1,
    xpEarned: todayActivity.xpEarned + xpEarned,
  });
  
  // Add XP notification
  const notification: XPNotification = {
    id: crypto.randomUUID(),
    amount: xpEarned,
    reason: `Solved ${problem.name}`,
    timestamp: Date.now(),
  };
  addXPNotification(notification);
  
  // Check achievements
  const newAchievements = checkAchievements();
  if (newAchievements.length > 0) {
    const updatedStats: UserStats = {
      ...newStats,
      unlockedAchievements: [...stats.unlockedAchievements, ...newAchievements],
    };
    saveStats(updatedStats);
  }
  
  return { xpEarned, newAchievements, leveledUp, previousLevel };
}

// Record note created
export function recordNoteCreated(): {
  xpEarned: number;
  newAchievements: string[];
} {
  const stats = getStats();
  
  // Update streak
  const { currentStreak, longestStreak } = updateStreak();
  
  // XP for note
  const xpEarned = XP_REWARDS.NOTE_CREATED;
  
  // Update stats
  const today = new Date().toISOString().split('T')[0];
  const newTotalXP = stats.totalXP + xpEarned;
  const newLevel = calculateLevel(newTotalXP);
  
  const newStats: UserStats = {
    ...stats,
    totalXP: newTotalXP,
    level: newLevel,
    currentStreak,
    longestStreak,
    lastActiveDate: today,
    totalNotes: stats.totalNotes + 1,
  };
  
  saveStats(newStats);
  
  // Update daily activity
  const todayActivity = getTodayActivity();
  updateTodayActivity({
    notesCreated: todayActivity.notesCreated + 1,
    xpEarned: todayActivity.xpEarned + xpEarned,
  });
  
  // Add XP notification
  const notification: XPNotification = {
    id: crypto.randomUUID(),
    amount: xpEarned,
    reason: 'Created a study note',
    timestamp: Date.now(),
  };
  addXPNotification(notification);
  
  // Check achievements
  const newAchievements = checkAchievements();
  if (newAchievements.length > 0) {
    const updatedStats: UserStats = {
      ...newStats,
      unlockedAchievements: [...stats.unlockedAchievements, ...newAchievements],
    };
    saveStats(updatedStats);
  }
  
  return { xpEarned, newAchievements };
}

// Update daily goal
export function updateDailyGoal(goal: number): void {
  const stats = getStats();
  saveStats({ ...stats, dailyGoal: goal });
}

// Get topic statistics
export function getTopicStats(): Record<string, number> {
  const problems = getProblems();
  const topicStats: Record<string, number> = {};
  
  problems.forEach(problem => {
    problem.topics.forEach(topic => {
      topicStats[topic] = (topicStats[topic] || 0) + 1;
    });
  });
  
  return topicStats;
}

// Get difficulty statistics
export function getDifficultyStats(): { easy: number; medium: number; hard: number } {
  const problems = getProblems();
  const stats = { easy: 0, medium: 0, hard: 0 };
  
  problems.forEach(problem => {
    const difficulty = getDifficultyFromRating(problem.difficulty);
    stats[difficulty]++;
  });
  
  return stats;
}

// Get weekly activity
export function getWeeklyActivity(): { date: string; problems: number; xp: number }[] {
  const activity = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const problems = getProblems().filter(p => p.solvedAt.split('T')[0] === dateStr);
    
    activity.push({
      date: dateStr,
      problems: problems.length,
      xp: problems.reduce((sum, p) => sum + p.xpEarned, 0),
    });
  }
  
  return activity;
}

// Codeforces topics
export const CODEFORCES_TOPICS = [
  'implementation',
  'math',
  'greedy',
  'dp',
  'data structures',
  'brute force',
  'constructive algorithms',
  'graphs',
  'sortings',
  'binary search',
  'dfs and similar',
  'trees',
  'strings',
  'number theory',
  'combinatorics',
  'geometry',
  'bitmasks',
  'two pointers',
  'shortest paths',
  'probabilities',
  'divide and conquer',
  'hashing',
  'games',
  'flows',
  'interactive',
  'matrices',
  'string suffix structures',
  'fft',
  'graph matchings',
  'ternary search',
  'schedules',
  'meet-in-the-middle',
  'expression parsing',
  '2-sat',
  'chinese remainder theorem',
  'sweep line',
  'dsu',
  'recursion',
  'backtracking',
];
