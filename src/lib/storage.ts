import { Problem, StudyNote, UserStats, DailyActivity, XPNotification } from './types';

const STORAGE_KEYS = {
  PROBLEMS: 'codeforces_problems',
  NOTES: 'codeforces_notes',
  STATS: 'codeforces_stats',
  DAILY_ACTIVITY: 'codeforces_daily_activity',
  XP_NOTIFICATIONS: 'codeforces_xp_notifications',
};

// Default stats
const defaultStats: UserStats = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalProblems: 0,
  totalNotes: 0,
  unlockedAchievements: [],
  dailyGoal: 2,
  problemsToday: 0,
};

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Problems
export function getProblems(): Problem[] {
  return getItem<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
}

export function saveProblems(problems: Problem[]): void {
  setItem(STORAGE_KEYS.PROBLEMS, problems);
}

export function addProblem(problem: Problem): void {
  const problems = getProblems();
  problems.unshift(problem);
  saveProblems(problems);
}

export function deleteProblem(id: string): void {
  const problems = getProblems().filter(p => p.id !== id);
  saveProblems(problems);
}

// Notes
export function getNotes(): StudyNote[] {
  return getItem<StudyNote[]>(STORAGE_KEYS.NOTES, []);
}

export function saveNotes(notes: StudyNote[]): void {
  setItem(STORAGE_KEYS.NOTES, notes);
}

export function addNote(note: StudyNote): void {
  const notes = getNotes();
  notes.unshift(note);
  saveNotes(notes);
}

export function updateNote(updatedNote: StudyNote): void {
  const notes = getNotes().map(n => n.id === updatedNote.id ? updatedNote : n);
  saveNotes(notes);
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
}

// Stats
export function getStats(): UserStats {
  return getItem<UserStats>(STORAGE_KEYS.STATS, defaultStats);
}

export function saveStats(stats: UserStats): void {
  setItem(STORAGE_KEYS.STATS, stats);
}

// Daily Activity
export function getDailyActivity(): DailyActivity[] {
  return getItem<DailyActivity[]>(STORAGE_KEYS.DAILY_ACTIVITY, []);
}

export function saveDailyActivity(activity: DailyActivity[]): void {
  setItem(STORAGE_KEYS.DAILY_ACTIVITY, activity);
}

export function getTodayActivity(): DailyActivity {
  const today = new Date().toISOString().split('T')[0];
  const activity = getDailyActivity();
  const todayActivity = activity.find(a => a.date === today);
  return todayActivity || { date: today, problemsSolved: 0, xpEarned: 0, notesCreated: 0 };
}

export function updateTodayActivity(updates: Partial<DailyActivity>): void {
  const today = new Date().toISOString().split('T')[0];
  const activity = getDailyActivity();
  const existingIndex = activity.findIndex(a => a.date === today);
  
  if (existingIndex >= 0) {
    activity[existingIndex] = { ...activity[existingIndex], ...updates };
  } else {
    activity.push({ date: today, problemsSolved: 0, xpEarned: 0, notesCreated: 0, ...updates });
  }
  
  // Sort by date descending and keep last 365 days
  activity.sort((a, b) => b.date.localeCompare(a.date));
  saveDailyActivity(activity.slice(0, 365));
}

// XP Notifications
export function getXPNotifications(): XPNotification[] {
  return getItem<XPNotification[]>(STORAGE_KEYS.XP_NOTIFICATIONS, []);
}

export function addXPNotification(notification: XPNotification): void {
  const notifications = getXPNotifications();
  notifications.unshift(notification);
  // Keep only last 50 notifications
  setItem(STORAGE_KEYS.XP_NOTIFICATIONS, notifications.slice(0, 50));
}

export function clearXPNotifications(): void {
  setItem(STORAGE_KEYS.XP_NOTIFICATIONS, []);
}

// Clear all data (for testing/reset)
export function clearAllData(): void {
  if (!isBrowser) return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
