import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/store/examStore';
import * as storage from '@/data/storage';
import type { Question } from '@/types';

interface TimedConfigProps {
  onStart: (questions: Question[]) => void;
}

export const TOTAL_TIME = 1800;

export default function TimedConfig({ onStart }: TimedConfigProps) {
  const { courses } = useExamStore();

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(15);

  const allQuestions = useMemo(() => {
    if (selectedCourseIds.length === 0) {
      return storage.getQuestions();
    }
    const selectedSet = new Set(selectedCourseIds);
    const chapters = storage.getChapters().filter(c => selectedSet.has(c.courseId));
    const qs: Question[] = [];
    chapters.forEach(ch => {
      qs.push(...storage.getAllQuestionsByChapter(ch.id));
    });
    return qs;
  }, [selectedCourseIds]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    const pool = [...allQuestions];
    if (pool.length === 0) return;

    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    onStart(selected);
  };

  return (
    <div className="card mb-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary-500" />
        <h2 className="font-serif text-lg font-bold text-surface-ink">限时模拟配置</h2>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-surface-ink mb-2">考试时间：30 分钟</p>
        <p className="text-xs text-surface-ink-light">时间到将自动交卷</p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-surface-ink mb-2">选择课程范围（可不选，默认全部）</p>
        <div className="flex flex-wrap gap-2">
          {courses.map(course => (
            <label
              key={course.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm',
                selectedCourseIds.includes(course.id)
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-surface-border text-surface-ink hover:border-primary-300'
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedCourseIds.includes(course.id)}
                onChange={() => toggleCourse(course.id)}
              />
              <div className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                selectedCourseIds.includes(course.id)
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-surface-border'
              )}>
                {selectedCourseIds.includes(course.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {course.title}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-surface-ink">题目数量</p>
          <span className="text-sm font-mono text-primary-500 font-semibold">{questionCount} 题</span>
        </div>
        <input
          type="range"
          min={5}
          max={Math.min(30, allQuestions.length)}
          value={questionCount}
          onChange={e => setQuestionCount(Number(e.target.value))}
          className="w-full h-2 bg-surface-paper rounded-full appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      <div className="bg-surface-paper rounded-lg p-3 text-sm text-surface-ink-light mb-4">
        <p>当前题库共 <strong className="text-surface-ink">{allQuestions.length}</strong> 道题</p>
      </div>

      <button onClick={handleStart} className="btn-primary">
        开始考试
      </button>
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}