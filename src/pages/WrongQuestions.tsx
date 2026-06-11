import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useExamStore } from '@/store/examStore';
import { cn } from '@/lib/utils';
import type { WrongQuestion, Question } from '@/types';
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookOpen,
  Target,
  Trash2,
} from 'lucide-react';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}

function DifficultyBadge({ level }: { level: Question['difficulty'] }) {
  const map = {
    easy: { label: '简单', cls: 'badge-success' },
    medium: { label: '中等', cls: 'badge-warning' },
    hard: { label: '困难', cls: 'badge-danger' },
  };
  const { label, cls } = map[level];
  return <span className={cls}>{label}</span>;
}

function QuestionRedo({
  question,
  wrongQuestion,
  onClose,
  onMastered,
}: {
  question: Question;
  wrongQuestion: WrongQuestion;
  onClose: () => void;
  onMastered: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [animating, setAnimating] = useState(false);
  const saveExerciseRecord = useExamStore((s) => s.saveExerciseRecord);

  const handleSelect = (opt: string) => {
    if (result !== null) return;
    setSelected(opt);
    const isCorrect = opt.startsWith(question.answer);
    setResult(isCorrect ? 'correct' : 'wrong');
    saveExerciseRecord(question.id, isCorrect, 'chapter');
    if (isCorrect) {
      setAnimating(true);
      setTimeout(() => {
        onMastered();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-surface-card rounded-2xl shadow-modal max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8">
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-2">
          <XCircle className="w-5 h-5" />
        </button>

        {animating && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent-success/10 rounded-2xl animate-fade-in z-10">
            <div className="text-center animate-check">
              <CheckCircle2 className="w-16 h-16 text-accent-success mx-auto mb-3" />
              <p className="text-xl font-bold text-accent-success font-serif">已掌握！</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <span className="badge-primary">{question.knowledgePoint}</span>
          <DifficultyBadge level={question.difficulty} />
          <span className="badge-danger ml-2">错{wrongQuestion.wrongCount}次</span>
        </div>

        <p className="text-lg font-medium text-surface-ink mb-8 leading-relaxed">{question.content}</p>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let cls =
              'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium';
            if (result === null) {
              cls += cn(
                ' border-surface-border hover:border-primary-400 hover:bg-primary-50',
                selected === opt && 'border-primary-500 bg-primary-50',
              );
            } else if (opt.startsWith(question.answer)) {
              cls += ' border-accent-success bg-green-50 text-accent-success';
            } else if (selected === opt) {
              cls += ' border-accent-coral bg-red-50 text-accent-coral';
            } else {
              cls += ' border-surface-border opacity-50';
            }
            return (
              <button key={i} onClick={() => handleSelect(opt)} className={cls} disabled={result !== null}>
                <span className="font-mono text-sm mr-3 text-surface-ink-light">{letter}.</span>
                {opt.replace(/^[A-D]\.\s*/, '')}
              </button>
            );
          })}
        </div>

        {result === 'correct' && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-accent-success inline mr-2" />
            <span className="font-medium text-accent-success">回答正确！</span>
          </div>
        )}
        {result === 'wrong' && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200 animate-slide-up">
            <XCircle className="w-5 h-5 text-accent-coral inline mr-2" />
            <span className="font-medium text-accent-coral">回答错误</span>
            <p className="mt-2 text-surface-ink-light text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WrongQuestions() {
  const wrongQuestions = useExamStore((s) => s.wrongQuestions);
  const questions = useExamStore((s) => s.questions);
  const getAllKnowledgePoints = useExamStore((s) => s.getAllKnowledgePoints);
  const markAsMastered = useExamStore((s) => s.markAsMastered);
  const updateWrongNote = useExamStore((s) => s.updateWrongNote);

  const [filterKp, setFilterKp] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [redoId, setRedoId] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  const saveTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const allKps = useMemo(() => getAllKnowledgePoints(), [getAllKnowledgePoints]);

  const kpCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    wrongQuestions.forEach((wq) => {
      const q = questions.find((q) => q.id === wq.questionId);
      if (q) {
        counts[q.knowledgePoint] = (counts[q.knowledgePoint] || 0) + 1;
      }
    });
    return counts;
  }, [wrongQuestions, questions]);

  const filtered = useMemo(() => {
    return wrongQuestions.filter((wq) => {
      if (filterKp === 'all') return true;
      const q = questions.find((q) => q.id === wq.questionId);
      return q?.knowledgePoint === filterKp;
    });
  }, [wrongQuestions, questions, filterKp]);

  useEffect(() => {
    const init: Record<string, string> = {};
    wrongQuestions.forEach((wq) => {
      init[wq.id] = wq.note || '';
    });
    setNoteValues(init);
  }, [wrongQuestions]);

  const handleNoteChange = useCallback(
    (wqId: string, value: string) => {
      setNoteValues((prev) => ({ ...prev, [wqId]: value }));
      if (saveTimerRef.current[wqId]) {
        clearTimeout(saveTimerRef.current[wqId]);
      }
      saveTimerRef.current[wqId] = setTimeout(() => {
        updateWrongNote(wqId, value);
      }, 600);
    },
    [updateWrongNote],
  );

  const getQuestionById = (id: string) => questions.find((q) => q.id === id);

  const redoQuestion = redoId ? getQuestionById(redoId) : null;
  const redoWq = redoId ? wrongQuestions.find((w) => w.questionId === redoId) : null;

  return (
    <div className="animate-fade-in h-full flex gap-6">
      <aside className="w-[280px] shrink-0 hidden lg:block">
        <div className="card sticky top-6">
          <h3 className="font-serif text-lg font-semibold text-primary-500 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            知识点筛选
          </h3>
          <button
            onClick={() => setFilterKp('all')}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1',
              filterKp === 'all'
                ? 'bg-primary-500 text-white'
                : 'hover:bg-primary-50 text-surface-ink-light',
            )}
          >
            全部错题
            <span className="float-right opacity-70">{wrongQuestions.length}</span>
          </button>
          <div className="mt-2 space-y-1">
            {allKps.map((kp) => (
              <button
                key={kp}
                onClick={() => setFilterKp(kp)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterKp === kp
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-primary-50 text-surface-ink-light',
                )}
              >
                {kp}
                <span className="float-right opacity-70">{kpCounts[kp] || 0}</span>
              </button>
            ))}
          </div>
          {allKps.length === 0 && (
            <p className="text-surface-ink-light text-sm text-center py-4">暂无错题数据</p>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-500">错题本</h1>
            <p className="text-surface-ink-light text-sm mt-1">
              共 <span className="font-semibold text-accent-coral">{wrongQuestions.length}</span> 道错题
            </p>
          </div>
          <div className="relative lg:hidden">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-ink-light" />
            <select
              value={filterKp}
              onChange={(e) => setFilterKp(e.target.value)}
              className="input-field pl-9 py-2 w-40 text-sm appearance-none"
            >
              <option value="all">全部 ({wrongQuestions.length})</option>
              {allKps.map((kp) => (
                <option key={kp} value={kp}>
                  {kp} ({kpCounts[kp] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="w-12 h-12 text-surface-ink-light mx-auto mb-4" />
            <p className="text-surface-ink-light text-lg font-serif">
              {wrongQuestions.length === 0 ? '还没有错题，继续加油！' : '该知识点下没有错题'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((wq) => {
              const q = getQuestionById(wq.questionId);
              if (!q) return null;
              const isExpanded = expandedId === wq.id;

              return (
                <div key={wq.id} className="card animate-slide-up">
                  <div
                    className="cursor-pointer"
                    onClick={() => setRedoId(wq.questionId)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-ink line-clamp-2 leading-relaxed">
                          {q.content.length > 50 ? q.content.slice(0, 50) + '...' : q.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="badge-primary">{q.knowledgePoint}</span>
                          <DifficultyBadge level={q.difficulty} />
                          <span className="badge-danger">
                            错{wq.wrongCount}次
                          </span>
                          <span className="text-xs text-surface-ink-light">
                            {formatDate(wq.lastWrongAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-surface-ink-light bg-primary-50 px-2 py-1 rounded-full">
                          重做
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-surface-ink-light transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : wq.id);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-surface-border animate-slide-up">
                      <div className="bg-primary-50 rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-primary-600 mb-2">
                          <BookOpen className="w-4 h-4 inline mr-1" />
                          正确答案：{q.answer}
                        </p>
                        <p className="text-sm text-surface-ink-light leading-relaxed">{q.explanation}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-surface-ink mb-2 block">
                          我的笔记
                        </label>
                        <textarea
                          value={noteValues[wq.id] ?? wq.note ?? ''}
                          onChange={(e) => handleNoteChange(wq.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="记录这道题的解题思路或易错点..."
                          className="input-field text-sm min-h-[80px] resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {redoQuestion && redoWq && (
        <QuestionRedo
          question={redoQuestion}
          wrongQuestion={redoWq}
          onClose={() => setRedoId(null)}
          onMastered={() => {
            markAsMastered(redoWq.id);
            setRedoId(null);
          }}
        />
      )}
    </div>
  );
}