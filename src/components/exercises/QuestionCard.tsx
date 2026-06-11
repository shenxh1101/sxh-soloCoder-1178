import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedAnswers: string[];
  isSubmitted: boolean;
  showExplanation: boolean;
  isFavorite: boolean;
  onSelectAnswer: (letter: string) => void;
  onSubmit: () => void;
  onToggleExplanation: () => void;
  onToggleFavorite: () => void;
  onNext: () => void;
  isLast: boolean;
}

function parseOption(opt: string): { letter: string; text: string } {
  const match = opt.match(/^([A-Z]+)[.、．]\s*(.*)/);
  if (match) {
    return { letter: match[1], text: match[2] || opt };
  }
  return { letter: opt.substring(0, 1), text: opt };
}

function checkAnswer(question: Question, selected: string[]): boolean {
  if (question.type === 'multiple') {
    const sortedSelected = [...selected].sort().join('');
    const sortedAnswer = question.answer.split('').sort().join('');
    return sortedSelected === sortedAnswer;
  }
  return selected.length === 1 && selected[0] === question.answer;
}

const difficultyBadge: Record<string, string> = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger',
};

const difficultyLabel: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const typeLabel: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
};

export default function QuestionCard({
  question,
  index,
  total,
  selectedAnswers,
  isSubmitted,
  showExplanation,
  isFavorite,
  onSelectAnswer,
  onSubmit,
  onToggleExplanation,
  onToggleFavorite,
  onNext,
  isLast,
}: QuestionCardProps) {
  const [shakeError, setShakeError] = useState(false);

  const parsedOptions = question.options.map(parseOption);
  const hasSelection = selectedAnswers.length > 0;

  const handleSubmit = () => {
    if (!hasSelection) return;
    setIsCorrectNow();
    onSubmit();
  };

  const setIsCorrectNow = () => {
    const correct = checkAnswer(question, selectedAnswers);
    if (!correct) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  return (
    <div className={cn('card animate-slide-up', shakeError && 'animate-shake')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-surface-ink-light">
            第 {index + 1}/{total} 题
          </span>
          <span className={cn('badge', difficultyBadge[question.difficulty])}>
            {difficultyLabel[question.difficulty]}
          </span>
          <span className="badge badge-primary">{typeLabel[question.type]}</span>
        </div>
        <button
          onClick={onToggleFavorite}
          className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
        >
          <Star
            className={cn(
              'w-5 h-5 transition-colors',
              isFavorite ? 'fill-accent-gold text-accent-gold' : 'text-surface-ink-light'
            )}
          />
        </button>
      </div>

      <span className="inline-flex mb-3 badge badge-primary text-xs">
        {question.knowledgePoint}
      </span>

      <p className="font-sans text-base text-surface-ink leading-relaxed mb-5">
        {question.type === 'judge' ? '（判断题）' : ''}{question.content}
      </p>

      <div className="space-y-2.5 mb-5">
        {parsedOptions.map(({ letter, text }) => {
          const isSelected = selectedAnswers.includes(letter);
          const isCorrectOption = isSubmitted && question.answer.includes(letter);
          const isWrongSelected = isSubmitted && isSelected && !isCorrectOption;

          const optionClass = cn(
            'flex items-center gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-200',
            'hover:border-primary-300 hover:bg-primary-50/50',
            isSelected && !isSubmitted && 'bg-primary-50 border-primary-500',
            isCorrectOption && 'bg-green-50 border-green-400',
            isWrongSelected && 'bg-red-50 border-red-400',
            !isSelected && !isSubmitted && 'border-surface-border bg-white'
          );

          return (
            <div
              key={letter}
              className={optionClass}
              onClick={() => !isSubmitted && onSelectAnswer(letter)}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors',
                  isSelected && !isSubmitted && 'bg-primary-500 text-white',
                  isCorrectOption && 'bg-green-500 text-white',
                  isWrongSelected && 'bg-red-500 text-white',
                  !isSelected && !isSubmitted && 'bg-surface-paper text-surface-ink-light'
                )}
              >
                {letter}
              </div>
              <span className="text-surface-ink text-sm flex-1">{text}</span>
              {isCorrectOption && <span className="text-green-600 text-xs font-medium ml-auto">✓ 正确</span>}
              {isWrongSelected && <span className="text-red-500 text-xs font-medium ml-auto">✗ 错误</span>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!hasSelection}
            className="btn-primary text-sm"
          >
            提交答案
          </button>
        ) : (
          <>
            <button
              onClick={onToggleExplanation}
              className="btn-ghost text-sm"
            >
              {showExplanation ? '收起解析' : '查看解析'}
            </button>
            {!isLast && (
              <button onClick={onNext} className="btn-secondary text-sm">
                下一题
              </button>
            )}
          </>
        )}
      </div>

      {isSubmitted && showExplanation && (
        <div className="mt-4 p-4 bg-surface-paper rounded-lg border border-surface-border animate-slide-up">
          <p className="text-sm font-medium text-surface-ink mb-1">题目解析</p>
          <p className="text-sm text-surface-ink-light leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}