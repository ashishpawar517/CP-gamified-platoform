'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Target, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DailyGoalSettingProps {
  currentGoal: number;
  problemsToday: number;
  onUpdateGoal: (goal: number) => void;
}

export function DailyGoalSetting({ currentGoal, problemsToday, onUpdateGoal }: DailyGoalSettingProps) {
  const [goal, setGoal] = useState(currentGoal);
  const [isEditing, setIsEditing] = useState(false);
  
  const progress = Math.min(100, (problemsToday / currentGoal) * 100);
  const goalReached = problemsToday >= currentGoal;

  const handleSave = () => {
    onUpdateGoal(goal);
    setIsEditing(false);
  };

  const suggestedGoals = [1, 2, 3, 5, 7, 10];

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          Daily Goal
        </CardTitle>
        <CardDescription>
          Set your daily problem solving target
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Display */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Today&apos;s Progress</span>
            <span className={cn(
              'font-bold',
              goalReached ? 'text-emerald-400' : 'text-white'
            )}>
              {problemsToday} / {currentGoal} problems
            </span>
          </div>
          
          {/* Progress bar with animation */}
          <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                goalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : 'bg-gradient-to-r from-violet-500 to-purple-500'
              )}
            />
            {goalReached && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="h-3 w-3 text-white" />
              </motion.div>
            )}
          </div>
          
          {goalReached && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 text-emerald-400"
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Daily goal achieved! Keep going!</span>
            </motion.div>
          )}
        </div>

        {/* Goal Setting */}
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">New Goal</span>
                <span className="text-violet-400 font-bold">{goal} problems/day</span>
              </div>
              <Slider
                value={[goal]}
                onValueChange={(value) => setGoal(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-2">
              {suggestedGoals.map((g) => (
                <Button
                  key={g}
                  variant={goal === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGoal(g)}
                  className={cn(
                    'min-w-[3rem]',
                    goal === g
                      ? 'bg-violet-600 hover:bg-violet-500'
                      : 'border-slate-600 hover:border-violet-500'
                  )}
                >
                  {g}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setGoal(currentGoal);
                  setIsEditing(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
              >
                Save Goal
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="w-full border-slate-600 hover:border-violet-500 hover:bg-slate-700/50"
          >
            Adjust Goal
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
