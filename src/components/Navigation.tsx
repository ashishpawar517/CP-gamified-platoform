'use client';

import { ViewTab } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Code, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'problems', label: 'Problems', icon: Code },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex items-center justify-center gap-1 p-2 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-white/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
              isActive
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
