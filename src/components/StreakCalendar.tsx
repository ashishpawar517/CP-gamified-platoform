'use client';

import { DailyActivity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {
  dailyActivity: DailyActivity[];
}

export function StreakCalendar({ dailyActivity }: StreakCalendarProps) {
  // Generate last 12 weeks (84 days) of data
  const generateCalendarData = () => {
    const days: { date: string; activity: DailyActivity | undefined; level: number }[] = [];
    const activityMap = new Map(dailyActivity.map(a => [a.date, a]));
    
    for (let i = 83; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const activity = activityMap.get(dateStr);
      
      let level = 0;
      if (activity) {
        const totalActivity = activity.problemsSolved + activity.notesCreated;
        if (totalActivity >= 5) level = 4;
        else if (totalActivity >= 3) level = 3;
        else if (totalActivity >= 2) level = 2;
        else if (totalActivity >= 1) level = 1;
      }
      
      days.push({ date: dateStr, activity, level });
    }
    
    return days;
  };

  const calendarDays = generateCalendarData();
  
  // Split into weeks
  const weeks: typeof calendarDays[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-slate-800/50';
      case 1: return 'bg-emerald-900';
      case 2: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-400';
      default: return 'bg-slate-800/50';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 text-xs text-slate-500 mb-1">
        {dayLabels.map((day) => (
          <div key={day} className="w-3 text-center">{day.charAt(0)}</div>
        ))}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={`${weekIdx}-${dayIdx}`}
                title={`${formatDate(day.date)}: ${day.activity?.problemsSolved || 0} problems, ${day.activity?.notesCreated || 0} notes`}
                className={cn(
                  'w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-white/20',
                  getLevelColor(day.level)
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-slate-500 mt-2">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn('w-3 h-3 rounded-sm', getLevelColor(level))}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
