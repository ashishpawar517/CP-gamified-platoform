'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';
import { ViewTab } from '@/lib/types';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { ProblemLogger } from '@/components/ProblemLogger';
import { NotesSystem } from '@/components/NotesSystem';
import { StatsView } from '@/components/StatsView';
import { XPNotification } from '@/components/XPNotification';
import { CelebrationEffects } from '@/components/CelebrationEffects';
import { getAchievement } from '@/lib/gamification';
import { Code2, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CelebrationState {
  type: 'xp' | 'levelUp' | 'achievement' | 'streak' | 'goal';
  data?: {
    amount?: number;
    level?: number;
    achievementId?: string;
    streakDays?: number;
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const {
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
  } = useGamification();

  // Handle problem addition with celebrations
  const handleAddProblem = (problem: Parameters<typeof addProblem>[0]) => {
    const result = addProblem(problem);
    
    // Trigger celebrations
    if (result.leveledUp) {
      setCelebration({
        type: 'levelUp',
        data: { level: (result.previousLevel || 0) + 1 },
      });
    } else {
      setCelebration({
        type: 'xp',
        data: { amount: result.xpEarned },
      });
    }

    // Check for new achievements
    if (result.newAchievements.length > 0) {
      setTimeout(() => {
        setCelebration({
          type: 'achievement',
          data: { achievementId: result.newAchievements[0] },
        });
      }, 3500);
    }

    // Check for daily goal completion
    if (stats && stats.problemsToday + 1 === stats.dailyGoal) {
      setTimeout(() => {
        setCelebration({ type: 'goal' });
      }, result.leveledUp ? 7000 : 3500);
    }

    return result;
  };

  // Handle note addition with celebrations
  const handleAddNote = (note: Parameters<typeof addNote>[0]) => {
    const result = addNote(note);
    
    setCelebration({
      type: 'xp',
      data: { amount: result.xpEarned },
    });

    if (result.newAchievements.length > 0) {
      setTimeout(() => {
        setCelebration({
          type: 'achievement',
          data: { achievementId: result.newAchievements[0] },
        });
      }, 3500);
    }

    return result;
  };

  // Clear celebration after animation
  const handleCelebrationComplete = () => {
    setCelebration(null);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="sticky top-0 z-40">
          <div className="flex items-center justify-center gap-1 p-2 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-white/10">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Default stats for initial render
  const defaultStats = {
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

  const userStats = stats || defaultStats;
  const levelInfo = getLevelInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/30 blur-lg rounded-full" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  CF Practice Tracker
                </h1>
                <p className="text-xs text-slate-500">Gamified Learning</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {/* Mini Level Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30"
              >
                <Trophy className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-bold text-white">Lvl {userStats.level}</span>
                <span className="text-xs text-slate-400">• {userStats.totalXP} XP</span>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={userStats}
                problems={problems}
                dailyActivity={dailyActivity}
                levelInfo={levelInfo}
              />
            )}

            {activeTab === 'problems' && (
              <ProblemLogger
                problems={problems}
                streak={userStats.currentStreak}
                onAddProblem={handleAddProblem}
                onDeleteProblem={deleteProblem}
              />
            )}

            {activeTab === 'notes' && (
              <NotesSystem
                notes={notes}
                problems={problems}
                onAddNote={handleAddNote}
                onUpdateNote={updateNote}
                onDeleteNote={deleteNote}
              />
            )}

            {activeTab === 'stats' && (
              <StatsView
                stats={userStats}
                problems={problems}
                notes={notes}
                dailyActivity={dailyActivity}
                levelInfo={levelInfo}
                onUpdateDailyGoal={setDailyGoal}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Code2 className="h-4 w-4" />
          <span>Codeforces Practice Tracker</span>
          <span>•</span>
          <span className="text-violet-400">Level up your coding skills</span>
        </div>
      </footer>

      {/* XP Notification */}
      <XPNotification notifications={xpNotifications} onClear={clearNotifications} />

      {/* Celebration Effects */}
      <AnimatePresence>
        {celebration && (
          <CelebrationEffects
            type={celebration.type}
            data={celebration.data}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
