import { cn } from '@/lib/utils';

interface QuestionNavProps {
  total: number;
  currentIndex: number;
  statuses: ('unanswered' | 'correct' | 'incorrect')[];
  onJump: (index: number) => void;
}

export default function QuestionNav({ total, currentIndex, statuses, onJump }: QuestionNavProps) {
  return (
    <div className="card mt-6">
      <p className="text-xs font-medium text-surface-ink-light mb-3">题目导航</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, i) => {
          const status = statuses[i] || 'unanswered';
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={cn(
                'w-8 h-8 rounded-md text-xs font-mono font-medium transition-all duration-200',
                'hover:ring-2 hover:ring-primary-200',
                i === currentIndex && 'ring-2 ring-primary-500',
                status === 'correct' && 'bg-green-100 text-green-700 border border-green-300',
                status === 'incorrect' && 'bg-red-100 text-red-600 border border-red-300',
                status === 'unanswered' && 'bg-surface-paper text-surface-ink-light border border-surface-border'
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-surface-ink-light">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-surface-paper border border-surface-border" />
          未答
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
          正确
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
          错误
        </span>
      </div>
    </div>
  );
}