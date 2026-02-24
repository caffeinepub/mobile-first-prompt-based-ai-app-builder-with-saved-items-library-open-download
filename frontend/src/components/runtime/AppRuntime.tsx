import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import CalculatorRuntime from './CalculatorRuntime';

interface Task {
  id: string;
  text: string;
  done: boolean;
  category?: string;
}

interface AppData {
  title?: string;
  appKind?: string;
  tasks?: Array<{ text: string; category?: string }>;
  categories?: string[];
  calculatorMode?: 'basic' | 'scientific';
}

interface AppRuntimeProps {
  data?: AppData;
}

export default function AppRuntime({ data }: AppRuntimeProps) {
  const appKind = data?.appKind || 'tasks';

  const initialTasks: Task[] = (data?.tasks || [
    { text: 'Welcome to your task manager!', category: 'General' },
    { text: 'Add your first task below', category: 'General' },
  ]).map((t, i) => ({ id: String(i), text: t.text, done: false, category: t.category }));

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  if (appKind === 'calculator') {
    return <CalculatorRuntime data={{ mode: data?.calculatorMode || 'basic' }} />;
  }

  const addTask = () => {
    const text = newTask.trim();
    if (!text) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filtered = tasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  );

  const doneCount = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col min-h-[480px] bg-muted/20">
      {/* App Header */}
      <div className="bg-white border-b border-border px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {data?.title || 'Task Manager'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {doneCount} of {tasks.length} completed
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--accent)]">{progress}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-border px-5 flex gap-0">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-all ${
              filter === f
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
            {f === 'all' && tasks.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                {tasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {filter === 'done' ? 'No completed tasks yet' : 'No tasks here'}
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all group ${
                task.done ? 'border-border/50 opacity-70' : 'border-border'
              }`}
            >
              <Checkbox
                checked={task.done}
                onCheckedChange={() => toggleTask(task.id)}
                className="data-[state=checked]:bg-[var(--accent)] data-[state=checked]:border-[var(--accent)]"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.text}
                </span>
                {task.category && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Tag className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{task.category}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Input */}
      <div className="px-4 py-3 bg-white border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 h-10 px-4 rounded-xl border border-border bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
          />
          <Button
            onClick={addTask}
            disabled={!newTask.trim()}
            size="sm"
            className="h-10 w-10 p-0 rounded-xl bg-[var(--accent)] hover:bg-[var(--primary)] text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
