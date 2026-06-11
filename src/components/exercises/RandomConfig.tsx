import { useState, useMemo } from 'react';
import { Shuffle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/store/examStore';
import * as storage from '@/data/storage';
import type { Question } from '@/types';

interface RandomConfigProps {
  onGenerate: (questions: Question[]) => void;
}

export default function RandomConfig({ onGenerate }: RandomConfigProps) {
  const { courses } = useExamStore();

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedKps, setSelectedKps] = useState<string[]>([]);

  const allQuestions = useMemo(() => {
    if (selectedCourseIds.length === 0) return [];
    const selectedSet = new Set(selectedCourseIds);
    const chapters = storage.getChapters().filter(c => selectedSet.has(c.courseId));
    const qs: Question[] = [];
    chapters.forEach(ch => {
      qs.push(...storage.getAllQuestionsByChapter(ch.id));
    });
    return qs;
  }, [selectedCourseIds]);

  const knowledgePoints = useMemo(() => {
    return [...new Set(allQuestions.map(q => q.knowledgePoint))].sort();
  }, [allQuestions]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    setSelectedKps([]);
  };

  const toggleKp = (kp: string) => {
    setSelectedKps(prev =>
      prev.includes(kp) ? prev.filter(k => k !== kp) : [...prev, kp]
    );
  };

  const handleGenerate = () => {
    let pool = allQuestions;
    if (selectedKps.length > 0) {
      pool = pool.filter(q => selectedKps.includes(q.knowledgePoint));
    }
    if (pool.length === 0) return;

    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    onGenerate(selected);
  };

  return (
    <div className="card mb-5">
      <div className="flex items-center gap-2 mb-4">
        <Shuffle className="w-5 h-5 text-primary-500" />
        <h2 className="font-serif text-lg font-bold text-surface-ink">随机组卷配置</h2>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-surface-ink mb-2">选择课程（多选）</p>
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

      {allQuestions.length > 0 && (
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
          <div className="flex justify-between text-xs text-surface-ink-light mt-1">
            <span>5</span>
            <span>{Math.min(30, allQuestions.length)}</span>
          </div>
        </div>
      )}

      {knowledgePoints.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-surface-ink mb-2">知识点筛选（可多选，留空则全部）</p>
          <div className="flex flex-wrap gap-1.5">
            {knowledgePoints.map(kp => (
              <button
                key={kp}
                onClick={() => toggleKp(kp)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  selectedKps.includes(kp)
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-paper text-surface-ink-light hover:bg-primary-50 hover:text-primary-600'
                )}
              >
                {kp}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={selectedCourseIds.length === 0}
        className="btn-primary flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        生成试卷
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