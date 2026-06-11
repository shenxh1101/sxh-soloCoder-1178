import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultModalProps {
  open: boolean;
  correctCount: number;
  total: number;
  duration: number;
  mode: string;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}分${s}秒`;
}

export default function ResultModal({ open, correctCount, total, duration, mode, onClose }: ResultModalProps) {
  if (!open) return null;

  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const modeLabel = mode === 'timed' ? '限时模拟' : mode === 'random' ? '随机组卷' : '章节练习';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal p-8 max-w-md w-full animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-paper transition-colors"
        >
          <X className="w-5 h-5 text-surface-ink-light" />
        </button>

        <div className="text-center">
          <p className="text-sm text-surface-ink-light mb-1">{modeLabel} · 成绩报告</p>
          <div className="my-6">
            <span className="font-mono text-5xl font-bold text-primary-500">{score}</span>
            <span className="font-mono text-2xl text-surface-ink-light">/100</span>
          </div>

          <div className={cn(
            'inline-flex px-4 py-1.5 rounded-full text-sm font-medium mb-6',
            score >= 80 ? 'bg-green-50 text-green-700' :
            score >= 60 ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-600'
          )}>
            {score >= 80 ? '🎉 优秀' : score >= 60 ? '👍 良好' : '💪 继续加油'}
          </div>

          <div className="grid grid-cols-3 gap-4 bg-surface-paper rounded-xl p-5">
            <div>
              <p className="text-2xl font-bold text-surface-ink">{correctCount}</p>
              <p className="text-xs text-surface-ink-light mt-1">正确题数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-ink">{total}</p>
              <p className="text-xs text-surface-ink-light mt-1">总题数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-ink">{((correctCount / (total || 1)) * 100).toFixed(0)}%</p>
              <p className="text-xs text-surface-ink-light mt-1">正确率</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-surface-ink-light">
            用时 {formatDuration(duration)}
          </p>
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-6">
          确定
        </button>
      </div>
    </div>
  );
}