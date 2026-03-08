'use client';

import { useMemo } from 'react';
import { UserStats, Problem, StudyNote, DailyActivity } from '@/lib/types';
import {
  getTopicStats,
  getDifficultyStats,
  getWeeklyActivity,
  getLevelTitle,
  ACHIEVEMENTS,
} from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from './AchievementBadge';
import { DailyGoalSetting } from './DailyGoalSetting';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Award, Target, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsViewProps {
  stats: UserStats;
  problems: Problem[];
  notes: StudyNote[];
  dailyActivity: DailyActivity[];
  levelInfo: { progress: number; currentXP: number; nextLevelXP: number; currentLevelXP: number };
  onUpdateDailyGoal: (goal: number) => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

export function StatsView({
  stats,
  problems,
  notes,
  dailyActivity,
  levelInfo,
  onUpdateDailyGoal,
}: StatsViewProps) {
  const topicStats = useMemo(() => getTopicStats(), [problems]);
  const difficultyStats = useMemo(() => getDifficultyStats(), [problems]);
  const weeklyActivity = useMemo(() => getWeeklyActivity(), [problems]);

  // Prepare topic chart data
  const topicChartData = useMemo(() => {
    return Object.entries(topicStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        count,
      }));
  }, [topicStats]);

  // Prepare difficulty pie chart data
  const difficultyChartData = [
    { name: 'Easy', value: difficultyStats.easy, color: '#10b981' },
    { name: 'Medium', value: difficultyStats.medium, color: '#f59e0b' },
    { name: 'Hard', value: difficultyStats.hard, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Prepare weekly activity chart data
  const weeklyChartData = weeklyActivity.map((day) => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    problems: day.problems,
    xp: day.xp,
  }));

  // Monthly XP trend
  const monthlyXPTrend = useMemo(() => {
    const last30Days = dailyActivity.slice(0, 30).reverse();
    return last30Days.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      xp: day.xpEarned,
    }));
  }, [dailyActivity]);

  // Calculate additional stats
  const totalTopics = Object.keys(topicStats).length;
  const avgTimePerProblem = problems.length > 0
    ? Math.round(problems.reduce((sum, p) => sum + p.timeSpent, 0) / problems.length)
    : 0;
  const avgXPPerProblem = problems.length > 0
    ? Math.round(stats.totalXP / problems.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-400">{stats.totalProblems}</div>
                <div className="text-sm text-slate-400 mt-1">Problems Solved</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{totalTopics}</div>
                <div className="text-sm text-slate-400 mt-1">Topics Covered</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{avgTimePerProblem}</div>
                <div className="text-sm text-slate-400 mt-1">Avg. Time (min)</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-rose-400">{stats.totalNotes}</div>
                <div className="text-sm text-slate-400 mt-1">Notes Created</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Problems solved per day (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="problems" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-emerald-400" />
                Difficulty Distribution
              </CardTitle>
              <CardDescription>Breakdown by problem difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {difficultyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {difficultyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Topic Coverage & XP Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-400" />
                Top Topics
              </CardTitle>
              <CardDescription>Your most practiced topics</CardDescription>
            </CardHeader>
            <CardContent>
              {topicChartData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" allowDecimals={false} />
                      <YAxis type="category" dataKey="topic" stroke="#9ca3af" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No topics data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                XP Trend
              </CardTitle>
              <CardDescription>Daily XP earned (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {monthlyXPTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyXPTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="xp"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No XP data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Achievements Progress
            </CardTitle>
            <CardDescription>
              {stats.unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={(stats.unlockedAchievements.length / ACHIEVEMENTS.length) * 100}
                className="h-2 bg-slate-700"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {ACHIEVEMENTS.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievementId={achievement.id}
                    isUnlocked={stats.unlockedAchievements.includes(achievement.id)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/30">
            <CardHeader>
              <CardTitle className="text-white">Level Progress</CardTitle>
              <CardDescription className="text-violet-300">
                Current: {getLevelTitle(stats.level)} (Level {stats.level})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Level {stats.level}</span>
                  <span className="text-slate-400">Level {stats.level + 1}</span>
                </div>
                <Progress value={levelInfo.progress} className="h-4 bg-violet-900/50" />
                <div className="text-center text-sm text-slate-400">
                  {levelInfo.currentXP - levelInfo.currentLevelXP} / {levelInfo.nextLevelXP - levelInfo.currentLevelXP} XP to next level
                </div>
                <div className="flex justify-center gap-4 text-center mt-4">
                  <div>
                    <div className="text-2xl font-bold text-violet-400">{stats.totalXP}</div>
                    <div className="text-xs text-slate-400">Total XP</div>
                  </div>
                  <div className="w-px bg-slate-700" />
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{avgXPPerProblem}</div>
                    <div className="text-xs text-slate-400">Avg XP/Problem</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goal Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <DailyGoalSetting
            currentGoal={stats.dailyGoal}
            problemsToday={stats.problemsToday}
            onUpdateGoal={onUpdateDailyGoal}
          />
        </motion.div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="bg-gradient-to-br from-rose-600/20 to-red-600/20 border-rose-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-rose-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.longestStreak}</div>
                  <div className="text-xs text-slate-400">Longest Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {problems.reduce((sum, p) => sum + p.timeSpent, 0)}
                  </div>
                  <div className="text-xs text-slate-400">Total Minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border-emerald-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-emerald-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{totalTopics}</div>
                  <div className="text-xs text-slate-400">Topics Mastered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
