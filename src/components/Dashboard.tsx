'use client';

import { UserStats, Problem, DailyActivity } from '@/lib/types';
import { getLevelTitle, ACHIEVEMENTS, getDifficultyStats } from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AchievementBadge } from './AchievementBadge';
import { StreakCalendar } from './StreakCalendar';
import { Flame, Trophy, Target, Zap, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  stats: UserStats;
  problems: Problem[];
  dailyActivity: DailyActivity[];
  levelInfo: { progress: number; currentXP: number; nextLevelXP: number; currentLevelXP: number };
}

export function Dashboard({ stats, problems, dailyActivity, levelInfo }: DashboardProps) {
  const difficultyStats = getDifficultyStats();
  const recentProblems = problems.slice(0, 5);
  const unlockedAchievements = ACHIEVEMENTS.filter(a => stats.unlockedAchievements.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !stats.unlockedAchievements.includes(a.id));
  
  const dailyProgress = Math.min(100, (stats.problemsToday / stats.dailyGoal) * 100);
  const goalReached = stats.problemsToday >= stats.dailyGoal;

  return (
    <div className="space-y-6">
      {/* Header Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-violet-300">Level</CardDescription>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-8 w-8 text-violet-400" />
                {stats.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-violet-300 mb-2">
                {getLevelTitle(stats.level)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{levelInfo.currentXP - levelInfo.currentLevelXP} XP</span>
                  <span>{levelInfo.nextLevelXP - levelInfo.currentLevelXP} XP</span>
                </div>
                <Progress value={levelInfo.progress} className="h-2 bg-violet-900/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-300">Total XP</CardDescription>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                <Zap className="h-8 w-8 text-amber-400" />
                {stats.totalXP.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400">
                Keep grinding to level up!
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-rose-600/20 to-red-600/20 border-rose-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-rose-300">Current Streak</CardDescription>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Flame className="h-8 w-8 text-rose-400" />
                </motion.div>
                {stats.currentStreak} days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400">
                Longest: {stats.longestStreak} days
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Problems Solved Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-300">Problems Solved</CardDescription>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                {stats.totalProblems}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  Easy: {difficultyStats.easy}
                </Badge>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                  Med: {difficultyStats.medium}
                </Badge>
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  Hard: {difficultyStats.hard}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Goal & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Daily Goal
              </CardTitle>
              <CardDescription>
                {goalReached
                  ? "🎉 You've reached your daily goal!"
                  : `${stats.problemsToday}/${stats.dailyGoal} problems today`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress 
                  value={dailyProgress} 
                  className={`h-4 ${goalReached ? 'bg-emerald-900/50' : 'bg-slate-700'}`}
                />
                {goalReached && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 text-emerald-400"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Goal Complete! Great job!</span>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Activity Calendar
              </CardTitle>
              <CardDescription>Your practice history</CardDescription>
            </CardHeader>
            <CardContent>
              <StreakCalendar dailyActivity={dailyActivity} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
            </CardTitle>
            <CardDescription>Unlock badges by reaching milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {ACHIEVEMENTS.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievementId={achievement.id}
                  isUnlocked={stats.unlockedAchievements.includes(achievement.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Problems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Recent Problems
            </CardTitle>
            <CardDescription>Your latest solved problems</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProblems.length > 0 ? (
              <div className="space-y-3">
                {recentProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white hover:text-violet-400 truncate block"
                      >
                        {problem.name}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Rating: {problem.difficulty}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          +{problem.xpEarned} XP
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 ml-4">
                      {new Date(problem.solvedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                No problems solved yet. Start logging your practice!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
