import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ResultModalProps {
  open: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeUsed: number;
  wrongDetails: Array<{
    questionId: string;
    content: string;
    correctAnswer: string;
    userAnswer: string;
  }>;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getScoreColor(percent: number): { stroke: string; bg: string } {
  if (percent >= 80) return { stroke: '#4caf7d', bg: '#e8f5e9' };
  if (percent >= 60) return { stroke: '#c9a96e', bg: '#fef9f0' };
  return { stroke: '#e07b5a', bg: '#fef0ec' };
}

export default function ResultModal({ open, totalQuestions, correctCount, wrongCount, timeUsed, wrongDetails, onClose }: ResultModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const colors = getScoreColor(percent);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const handleViewWrong = () => {
    onClose();
    navigate('/wrong-questions');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-paper transition-colors"
        >
          <X className="w-5 h-5 text-surface-ink-light" />
        </button>

        <div className="text-center">
          <h2 className="font-serif text-xl font-bold text-surface-ink mb-6">答题报告</h2>

          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={colors.bg}
                strokeWidth="10"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold text-surface-ink">
                {correctCount}/{totalQuestions}
              </span>
              <span className="text-xs text-surface-ink-light mt-1">正确率 {percent}%</span>
            </div>
          </div>

          <div className={cn(
            'inline-flex px-4 py-1.5 rounded-full text-sm font-medium mb-6',
            percent >= 80 ? 'bg-green-50 text-green-700' :
            percent >= 60 ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-600'
          )}>
            {percent >= 80 ? '🎉 优秀' : percent >= 60 ? '👍 良好' : '💪 继续加油'}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 bg-surface-paper rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="font-mono text-lg font-bold text-surface-ink">{totalQuestions}</p>
            <p className="text-xs text-surface-ink-light mt-0.5">总题数</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-lg font-bold text-accent-success">{correctCount}</p>
            <p className="text-xs text-surface-ink-light mt-0.5">正确</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-lg font-bold text-accent-coral">{wrongCount}</p>
            <p className="text-xs text-surface-ink-light mt-0.5">错误</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-lg font-bold text-surface-ink">{formatTime(timeUsed)}</p>
            <p className="text-xs text-surface-ink-light mt-0.5">用时</p>
          </div>
        </div>

        {wrongDetails.length > 0 && (
          <div className="mb-6">
            <h3 className="font-serif text-base font-bold text-surface-ink mb-3">
              错题回顾
              <span className="text-sm font-normal text-accent-coral ml-2">共 {wrongDetails.length} 题</span>
            </h3>
            <div className="space-y-3">
              {wrongDetails.map((detail, idx) => (
                <div key={detail.questionId} className="border border-surface-border rounded-lg p-3 bg-surface-paper">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="badge-danger shrink-0">{idx + 1}</span>
                    <p className="text-sm text-surface-ink leading-relaxed">
                      {detail.content.length > 60 ? detail.content.slice(0, 60) + '...' : detail.content}
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-accent-success">
                      ✓ 正确答案：<strong>{detail.correctAnswer}</strong>
                    </span>
                    <span className="text-accent-coral">
                      ✗ 你的答案：<strong>{detail.userAnswer}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {wrongDetails.length > 0 && (
            <button onClick={handleViewWrong} className="btn-secondary flex-1 flex items-center justify-center gap-1">
              查看错题
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="btn-primary flex-1">
            继续练习
          </button>
        </div>
      </div>
    </div>
  );
}