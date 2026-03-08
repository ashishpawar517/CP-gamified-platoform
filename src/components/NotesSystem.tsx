'use client';

import { useState, useMemo } from 'react';
import { StudyNote, Problem } from '@/lib/types';
import { CODEFORCES_TOPICS } from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Search, BookOpen, Link2, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotesSystemProps {
  notes: StudyNote[];
  problems: Problem[];
  onAddNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    xpEarned: number;
    newAchievements: string[];
  };
  onUpdateNote: (note: StudyNote) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesSystem({ notes, problems, onAddNote, onUpdateNote, onDeleteNote }: NotesSystemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [linkedProblems, setLinkedProblems] = useState<string[]>([]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTopic('');
    setLinkedProblems([]);
    setIsAdding(false);
    setEditingNote(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      onUpdateNote({
        ...editingNote,
        title: title.trim(),
        content: content.trim(),
        topic,
        linkedProblems,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddNote({
        title: title.trim(),
        content: content.trim(),
        topic,
        linkedProblems,
      });
    }

    resetForm();
  };

  const startEditing = (note: StudyNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTopic(note.topic);
    setLinkedProblems(note.linkedProblems);
    setIsAdding(true);
  };

  // Get unique topics from notes
  const noteTopics = useMemo(() => {
    const topics = new Set(notes.map((n) => n.topic).filter(Boolean));
    return Array.from(topics);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Search filter
      if (
        searchQuery &&
        !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Topic filter
      if (topicFilter !== 'all' && note.topic !== topicFilter) {
        return false;
      }

      return true;
    });
  }, [notes, searchQuery, topicFilter]);

  // Get linked problem names
  const getLinkedProblemNames = (ids: string[]) => {
    return problems
      .filter((p) => ids.includes(p.id))
      .map((p) => p.name);
  };

  return (
    <div className="space-y-6">
      {/* Add Note Section */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Study Notes</CardTitle>
              <CardDescription>Create notes to reinforce your learning and earn XP</CardDescription>
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
                  New Note
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
                    <Label htmlFor="title" className="text-slate-300">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Dynamic Programming Patterns"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-slate-300">Topic</Label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {CODEFORCES_TOPICS.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-slate-300">Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your notes here... You can use markdown-style formatting!"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[150px]"
                    required
                  />
                </div>

                {/* Link Problems */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Link Related Problems</Label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-md bg-slate-700/30 border border-slate-600 min-h-[60px]">
                    {linkedProblems.length > 0 ? (
                      problems
                        .filter((p) => linkedProblems.includes(p.id))
                        .map((problem) => (
                          <Badge
                            key={problem.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {problem.name}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-400"
                              onClick={() =>
                                setLinkedProblems(linkedProblems.filter((id) => id !== problem.id))
                              }
                            />
                          </Badge>
                        ))
                    ) : (
                      <span className="text-slate-500 text-sm">No problems linked</span>
                    )}
                  </div>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !linkedProblems.includes(value)) {
                        setLinkedProblems([...linkedProblems, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Add a problem..." />
                    </SelectTrigger>
                    <SelectContent>
                      {problems
                        .filter((p) => !linkedProblems.includes(p.id))
                        .slice(0, 20)
                        .map((problem) => (
                          <SelectItem key={problem.id} value={problem.id}>
                            {problem.name} ({problem.difficulty})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    {!editingNote && (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Create & Earn 5 XP
                      </>
                    )}
                    {editingNote && 'Update Note'}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Your Notes</CardTitle>
              <CardDescription>{notes.length} notes created</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {noteTopics.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      'p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group cursor-pointer',
                      expandedNote === note.id && 'bg-slate-700/50'
                    )}
                    onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-violet-400 shrink-0" />
                          <h3 className="font-medium text-white truncate">{note.title}</h3>
                        </div>
                        {note.topic && (
                          <Badge variant="outline" className="mt-2 text-xs capitalize">
                            {note.topic}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(note);
                          }}
                          className="h-8 w-8 text-slate-500 hover:text-violet-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                          className="h-8 w-8 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p
                      className={cn(
                        'mt-3 text-sm text-slate-400 whitespace-pre-wrap',
                        expandedNote !== note.id && 'line-clamp-3'
                      )}
                    >
                      {note.content}
                    </p>

                    {note.linkedProblems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600/50">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Link2 className="h-3 w-3" />
                          <span>Linked: {getLinkedProblemNames(note.linkedProblems).join(', ')}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-slate-500">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-slate-500 py-12">
              {notes.length === 0
                ? 'No notes created yet. Start documenting your learning!'
                : 'No notes match your search.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
