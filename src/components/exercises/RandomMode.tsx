import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useExamStore } from '@/store/examStore';
import type { Question } from '@/types';
import QuestionCard from './QuestionCard';
import QuestionNav from './QuestionNav';
import ResultModal from './ResultModal';
import RandomConfig from './RandomConfig';

type AnswerState = {
  selected: string[];
  submitted: boolean;
  showExplanation: boolean;
  isCorrect: boolean;
};

export default function RandomMode() {
  const { isFavorite, toggleFavorite, saveExerciseRecord, addWrongQuestion } = useExamStore();

  const [stage, setStage] = useState<'config' | 'answering' | 'complete'>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [startTime, setStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = (generated: Question[]) => {
    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers({});
    setStartTime(Date.now());
    setStage('answering');
  };

  const currentQuestion = questions[currentIndex] || null;

  const setAnswer = useCallback((questionId: string, updates: Partial<AnswerState>) => {
    setAnswers(prev => {
      const existing = prev[questionId] || { selected: [], submitted: false, showExplanation: false, isCorrect: false };
      return { ...prev, [questionId]: { ...existing, ...updates } };
    });
  }, []);

  const handleSelectAnswer = (letter: string) => {
    if (!currentQuestion) return;
    const current = answers[currentQuestion.id] || { selected: [], submitted: false, showExplanation: false, isCorrect: false };
    if (current.submitted) return;

    if (currentQuestion.type === 'multiple') {
      const next = current.selected.includes(letter)
        ? current.selected.filter(l => l !== letter)
        : [...current.selected, letter];
      setAnswer(currentQuestion.id, { selected: next });
    } else {
      setAnswer(currentQuestion.id, { selected: [letter] });
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;
    const current = answers[currentQuestion.id];
    if (!current || current.selected.length === 0) return;

    const correct = currentQuestion.type === 'multiple'
      ? [...current.selected].sort().join('') === currentQuestion.answer.split('').sort().join('')
      : current.selected[0] === currentQuestion.answer;

    setAnswer(currentQuestion.id, { submitted: true, isCorrect: correct });
    saveExerciseRecord(currentQuestion.id, correct, 'random');
    if (!correct) addWrongQuestion(currentQuestion.id);
  };

  const handleToggleExplanation = () => {
    if (!currentQuestion) return;
    const current = answers[currentQuestion.id];
    setAnswer(currentQuestion.id, { showExplanation: !current?.showExplanation });
  };

  const handleToggleFavorite = () => {
    if (!currentQuestion) return;
    toggleFavorite(currentQuestion.id);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStage('complete');
    }
  };

  const handleJump = (index: number) => {
    setCurrentIndex(index);
  };

  const navStatuses = useMemo(() => {
    return questions.map(q => {
      const a = answers[q.id];
      if (!a || !a.submitted) return 'unanswered' as const;
      return a.isCorrect ? 'correct' as const : 'incorrect' as const;
    });
  }, [questions, answers]);

  const totalSubmitted = questions.filter(q => answers[q.id]?.submitted).length;
  const correctCount = questions.filter(q => answers[q.id]?.isCorrect).length;
  const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  if (stage === 'config') {
    return (
      <div className="animate-fade-in">
        <RandomConfig onGenerate={handleGenerate} />
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="animate-fade-in">
        <ResultModal
          open={showResult}
          correctCount={correctCount}
          total={questions.length}
          duration={duration}
          mode="random"
          onClose={() => setShowResult(false)}
        />
        <div className="card text-center py-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-surface-ink mb-2">练习完成！</h2>
          <p className="text-surface-ink-light mb-4">
            共 {questions.length} 题，正确 {correctCount} 题
          </p>
          <div className="text-4xl font-mono font-bold text-primary-500 mb-2">
            {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}
            <span className="text-xl text-surface-ink-light">分</span>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setShowResult(true)} className="btn-primary">
              查看成绩报告
            </button>
            <button
              onClick={() => {
                setStage('config');
                setQuestions([]);
                setAnswers({});
              }}
              className="btn-secondary"
            >
              重新组卷
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-ink-light">
          已答 {totalSubmitted}/{questions.length} 题
        </p>
        <button
          onClick={() => setStage('config')}
          className="btn-ghost text-sm flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          重新组卷
        </button>
      </div>

      {currentQuestion && (
        <>
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            selectedAnswers={answers[currentQuestion.id]?.selected || []}
            isSubmitted={answers[currentQuestion.id]?.submitted || false}
            showExplanation={answers[currentQuestion.id]?.showExplanation || false}
            isFavorite={isFavorite(currentQuestion.id)}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={handleSubmit}
            onToggleExplanation={handleToggleExplanation}
            onToggleFavorite={handleToggleFavorite}
            onNext={handleNext}
            isLast={currentIndex === questions.length - 1}
          />
          <QuestionNav
            total={questions.length}
            currentIndex={currentIndex}
            statuses={navStatuses}
            onJump={handleJump}
          />
        </>
      )}
    </div>
  );
}