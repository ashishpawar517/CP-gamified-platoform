'use client';

import { motion } from 'framer-motion';
import { Achievement } from '@/lib/types';
import { getAchievement } from '@/lib/gamification';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievementId: string;
  isUnlocked?: boolean;
  showDetails?: boolean;
  isNew?: boolean;
}

export function AchievementBadge({ achievementId, isUnlocked = false, showDetails = true, isNew = false }: AchievementBadgeProps) {
  const achievement = getAchievement(achievementId) as Achievement;
  
  if (!achievement) return null;

  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -180 } : false}
      animate={isNew ? { scale: 1, rotate: 0 } : false}
      transition={{ type: 'spring', duration: 0.6 }}
      className={cn(
        'relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300',
        isUnlocked
          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
          : 'bg-slate-800/50 border-slate-700/50 opacity-50'
      )}
    >
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full"
        >
          NEW!
        </motion.div>
      )}
      <div className="text-4xl mb-2">{achievement.icon}</div>
      <div className={cn(
        'font-bold text-sm text-center',
        isUnlocked ? 'text-amber-400' : 'text-slate-500'
      )}>
        {achievement.name}
      </div>
      {showDetails && (
        <div className={cn(
          'text-xs text-center mt-1',
          isUnlocked ? 'text-slate-300' : 'text-slate-600'
        )}>
          {achievement.description}
        </div>
      )}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl">🔒</div>
        </div>
      )}
    </motion.div>
  );
}
