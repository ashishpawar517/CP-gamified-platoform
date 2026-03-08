'use client';

import { useState, useEffect, useCallback } from 'react';
import { Problem, StudyNote, UserStats, DailyActivity, XPNotification } from '@/lib/types';
import {
  getProblems,
  addProblem as addProblemToStorage,
  deleteProblem as deleteProblemFromStorage,
  getNotes,
  addNote as addNoteToStorage,
  updateNote as updateNoteInStorage,
  deleteNote as deleteNoteFromStorage,
  getStats,
  getDailyActivity,
  getXPNotifications,
  clearXPNotifications,
} from '@/lib/storage';
import {
  recordProblemSolved,
  recordNoteCreated,
  updateDailyGoal,
  getLevelProgress,
  getXPForNextLevel,
  getXPForCurrentLevel,
} from '@/lib/gamification';

export function useGamification() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      setProblems(getProblems());
      setNotes(getNotes());
      setStats(getStats());
      setDailyActivity(getDailyActivity());
      setXpNotifications(getXPNotifications());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a problem
  const addProblem = useCallback((problem: Omit<Problem, 'id' | 'xpEarned'>) => {
    const { xpEarned, newAchievements, leveledUp, previousLevel } = recordProblemSolved({
      ...problem,
      id: crypto.randomUUID(),
      xpEarned: 0,
    });

    const newProblem: Problem = {
      ...problem,
      id: crypto.randomUUID(),
      xpEarned,
    };

    addProblemToStorage(newProblem);
    loadData();

    return { xpEarned, newAchievements, leveledUp, previousLevel };
  }, [loadData]);

  // Delete a problem
  const deleteProblem = useCallback((id: string) => {
    deleteProblemFromStorage(id);
    loadData();
  }, [loadData]);

  // Add a note
  const addNote = useCallback((note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { xpEarned, newAchievements } = recordNoteCreated();

    const now = new Date().toISOString();
    const newNote: StudyNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    addNoteToStorage(newNote);
    loadData();

    return { xpEarned, newAchievements };
  }, [loadData]);

  // Update a note
  const updateNote = useCallback((note: StudyNote) => {
    const updatedNote = { ...note, updatedAt: new Date().toISOString() };
    updateNoteInStorage(updatedNote);
    loadData();
  }, [loadData]);

  // Delete a note
  const deleteNote = useCallback((id: string) => {
    deleteNoteFromStorage(id);
    loadData();
  }, [loadData]);

  // Update daily goal
  const setDailyGoal = useCallback((goal: number) => {
    updateDailyGoal(goal);
    loadData();
  }, [loadData]);

  // Clear XP notifications
  const clearNotifications = useCallback(() => {
    clearXPNotifications();
    setXpNotifications([]);
  }, []);

  // Get level info
  const getLevelInfo = useCallback(() => {
    if (!stats) return { progress: 0, currentXP: 0, nextLevelXP: 100, currentLevelXP: 0 };
    return {
      progress: getLevelProgress(stats.totalXP),
      currentXP: stats.totalXP,
      nextLevelXP: getXPForNextLevel(stats.level),
      currentLevelXP: getXPForCurrentLevel(stats.level),
    };
  }, [stats]);

  return {
    problems,
    notes,
    stats,
    dailyActivity,
    xpNotifications,
    isLoading,
    addProblem,
    deleteProblem,
    addNote,
    updateNote,
    deleteNote,
    setDailyGoal,
    clearNotifications,
    getLevelInfo,
    refreshData: loadData,
  };
}
