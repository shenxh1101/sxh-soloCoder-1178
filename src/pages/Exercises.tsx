import { useState } from 'react';
import { FileQuestion, Shuffle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChapterMode from '@/components/exercises/ChapterMode';
import RandomMode from '@/components/exercises/RandomMode';
import TimedMode from '@/components/exercises/TimedMode';

type Mode = 'chapter' | 'random' | 'timed';

const modes: { key: Mode; label: string; icon: typeof FileQuestion; desc: string }[] = [
  { key: 'chapter', label: '章节练习', icon: FileQuestion, desc: '按课程章节逐题练习' },
  { key: 'random', label: '随机组卷', icon: Shuffle, desc: '自由组合，随机出题' },
  { key: 'timed', label: '模拟考试', icon: Clock, desc: '限时答题，全真模拟' },
];

export default function Exercises() {
  const [activeMode, setActiveMode] = useState<Mode>('chapter');

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-surface-ink">题库练习</h1>
          <p className="text-sm text-surface-ink-light mt-1">选择练习模式，开始高效刷题</p>
        </div>
      </div>

      <div className="flex bg-surface-paper rounded-xl p-1 mb-6 border border-surface-border">
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              activeMode === key
                ? 'bg-white text-primary-500 shadow-sm'
                : 'text-surface-ink-light hover:text-primary-500'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden text-xs">{label.slice(0, 2)}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-surface-ink-light mb-4">
        {modes.find(m => m.key === activeMode)?.desc}
      </p>

      <div className="max-w-3xl mx-auto">
        {activeMode === 'chapter' && <ChapterMode />}
        {activeMode === 'random' && <RandomMode />}
        {activeMode === 'timed' && <TimedMode />}
      </div>
    </div>
  );
}