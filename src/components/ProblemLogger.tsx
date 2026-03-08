'use client';

import { useState, useMemo } from 'react';
import { Problem } from '@/lib/types';
import { CODEFORCES_TOPICS, getDifficultyFromRating, calculateProblemXP } from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, ExternalLink, Search, Filter, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProblemLoggerProps {
  problems: Problem[];
  streak: number;
  onAddProblem: (problem: Omit<Problem, 'id' | 'xpEarned'>) => {
    xpEarned: number;
    newAchievements: string[];
    leveledUp: boolean;
    previousLevel: number;
  };
  onDeleteProblem: (id: string) => void;
}

export function ProblemLogger({ problems, streak, onAddProblem, onDeleteProblem }: ProblemLoggerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState(1200);
  const [topics, setTopics] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(30);
  const [notes, setNotes] = useState('');

  const estimatedXP = useMemo(() => calculateProblemXP(difficulty, streak), [difficulty, streak]);

  const resetForm = () => {
    setName('');
    setUrl('');
    setDifficulty(1200);
    setTopics([]);
    setTimeSpent(30);
    setNotes('');
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProblem({
      name: name.trim(),
      url: url.trim() || `https://codeforces.com/problemset`,
      difficulty,
      topics,
      timeSpent,
      notes: notes.trim(),
      solvedAt: new Date().toISOString(),
    });

    resetForm();
  };

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Search filter
      if (searchQuery && !problem.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Difficulty filter
      if (difficultyFilter !== 'all') {
        const diff = getDifficultyFromRating(problem.difficulty);
        if (diff !== difficultyFilter) return false;
      }
      
      // Topic filter
      if (selectedTopics.length > 0) {
        if (!selectedTopics.some(t => problem.topics.includes(t))) return false;
      }
      
      return true;
    });
  }, [problems, searchQuery, difficultyFilter, selectedTopics]);

  const getDifficultyColor = (rating: number) => {
    if (rating < 1200) return 'text-gray-400 border-gray-500';
    if (rating < 1400) return 'text-green-400 border-green-500';
    if (rating < 1600) return 'text-cyan-400 border-cyan-500';
    if (rating < 1900) return 'text-blue-400 border-blue-500';
    if (rating < 2100) return 'text-violet-400 border-violet-500';
    if (rating < 2300) return 'text-orange-400 border-orange-500';
    if (rating < 2600) return 'text-red-400 border-red-500';
    return 'text-rose-400 border-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Add Problem Section */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Log a Problem</CardTitle>
              <CardDescription>Track your Codeforces practice and earn XP</CardDescription>
            </div>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className={cn(
                'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500',
                isAdding && 'bg-slate-700'
              )}
            >
              {isAdding ? 'Cancel' : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Problem
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {isAdding && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Problem Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Two Sum"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-slate-300">Problem URL</Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://codeforces.com/problemset/problem/..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-slate-300">
                      Difficulty Rating: {difficulty}
                    </Label>
                    <input
                      type="range"
                      id="difficulty"
                      min={800}
                      max={3500}
                      step={100}
                      value={difficulty}
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>800 (Easy)</span>
                      <span>3500 (Hard)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeSpent" className="text-slate-300">Time Spent (minutes)</Label>
                    <Input
                      id="timeSpent"
                      type="number"
                      min={1}
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(Number(e.target.value))}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Estimated XP</Label>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="text-amber-400 font-bold">+{estimatedXP} XP</span>
                      {streak > 0 && (
                        <span className="text-xs text-slate-400">(incl. {streak * 5} streak bonus)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Topics</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-md bg-slate-700/30 border border-slate-600">
                    {CODEFORCES_TOPICS.map((topic) => (
                      <Badge
                        key={topic}
                        variant={topics.includes(topic) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all capitalize',
                          topics.includes(topic)
                            ? 'bg-violet-600 hover:bg-violet-500'
                            : 'hover:bg-slate-600/50'
                        )}
                        onClick={() => {
                          setTopics(
                            topics.includes(topic)
                              ? topics.filter((t) => t !== topic)
                              : [...topics, topic]
                          );
                        }}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-300">Personal Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you learn? Any tricky parts?"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Problem & Earn {estimatedXP} XP
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Problem List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Problem History</CardTitle>
              <CardDescription>{problems.length} problems solved</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems..."
                  className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProblems.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredProblems.map((problem) => (
                  <motion.div
                    key={problem.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-white hover:text-violet-400 transition-colors flex items-center gap-1"
                          >
                            {problem.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                            +{problem.xpEarned} XP
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {problem.timeSpent} min
                          </span>
                          <span>{new Date(problem.solvedAt).toLocaleDateString()}</span>
                        </div>
                        {problem.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {problem.topics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs capitalize">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {problem.notes && (
                          <p className="mt-2 text-sm text-slate-400 line-clamp-2">{problem.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteProblem(problem.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-slate-500 py-12">
              {problems.length === 0
                ? 'No problems logged yet. Start tracking your practice!'
                : 'No problems match your filters.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
