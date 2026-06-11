import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/store/examStore';
import type { Question } from '@/types';
import QuestionCard from './QuestionCard';
import QuestionNav from './QuestionNav';
import ResultModal from './ResultModal';
import TimedConfig, { TOTAL_TIME } from './TimedConfig';

type AnswerState = {
  selected: string[];
  submitted: boolean;
  showExplanation: boolean;
  isCorrect: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimedMode() {
  const { isFavorite, toggleFavorite, saveExerciseRecord } = useExamStore();

  const [stage, setStage] = useState<'config' | 'answering'>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [showReport, setShowReport] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRemainingRef = useRef(TOTAL_TIME);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  questionsRef.current = questions;
  answersRef.current = answers;

  const handleStart = (generated: Question[]) => {
    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers({});
    setTimeRemaining(TOTAL_TIME);
    timeRemainingRef.current = TOTAL_TIME;
    setShowReport(false);
    setStage('answering');
  };

  useEffect(() => {
    if (stage === 'answering') {
      timerRef.current = setInterval(() => {
        timeRemainingRef.current -= 1;
        if (timeRemainingRef.current <= 0) {
          setTimeRemaining(0);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          questionsRef.current.forEach(q => {
            const ans = answersRef.current[q.id];
            if (!ans || !ans.submitted) {
              saveExerciseRecord(q.id, false, 'timed');
            }
          });
          setShowReport(true);
        } else {
          setTimeRemaining(timeRemainingRef.current);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stage, saveExerciseRecord]);

  const saveUnansweredAsWrong = useCallback(() => {
    questions.forEach(q => {
      const ans = answers[q.id];
      if (!ans || !ans.submitted) {
        saveExerciseRecord(q.id, false, 'timed');
      }
    });
  }, [questions, answers, saveExerciseRecord]);

  const currentQuestion = questions[currentIndex] || null;

  const totalSubmitted = questions.filter(q => answers[q.id]?.submitted).length;
  const correctCount = questions.filter(q => answers[q.id]?.isCorrect).length;
  const wrongCount = questions.length - correctCount;
  const duration = TOTAL_TIME - timeRemaining;

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
    saveExerciseRecord(currentQuestion.id, correct, 'timed');

    if (currentIndex === questions.length - 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      saveUnansweredAsWrong();
      setShowReport(true);
    }
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
    }
  };

  const handleJump = (index: number) => {
    setCurrentIndex(index);
  };

  const handleSubmitExam = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    saveUnansweredAsWrong();
    setShowReport(true);
  };

  const navStatuses = useMemo(() => {
    return questions.map(q => {
      const a = answers[q.id];
      if (!a || !a.submitted) return 'unanswered' as const;
      return a.isCorrect ? 'correct' as const : 'incorrect' as const;
    });
  }, [questions, answers]);

  const wrongDetails = useMemo(() => {
    return questions
      .filter(q => {
        const ans = answers[q.id];
        return !ans || !ans.submitted || !ans.isCorrect;
      })
      .map(q => {
        const ans = answers[q.id];
        const submitted = ans?.submitted || false;
        const userAnswer = submitted ? (ans.selected || []).join('') : '未作答';
        return {
          questionId: q.id,
          content: q.content,
          correctAnswer: q.answer,
          userAnswer,
        };
      });
  }, [questions, answers]);

  const isTimeLow = timeRemaining <= 300;

  const handleCloseReport = () => {
    setShowReport(false);
    setStage('config');
    setQuestions([]);
    setAnswers({});
  };

  if (stage === 'config') {
    return (
      <div className="animate-fade-in">
        <TimedConfig onStart={handleStart} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ResultModal
        open={showReport}
        totalQuestions={questions.length}
        correctCount={correctCount}
        wrongCount={wrongCount}
        timeUsed={duration}
        wrongDetails={wrongDetails}
        onClose={handleCloseReport}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-ink-light">
          已答 {totalSubmitted}/{questions.length} 题
        </p>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center gap-1.5 font-mono text-lg font-bold px-3 py-1.5 rounded-lg',
            isTimeLow
              ? 'bg-red-50 text-accent-coral animate-pulse-soft'
              : 'bg-surface-paper text-surface-ink'
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeRemaining)}
          </div>
          <button onClick={handleSubmitExam} className="btn-danger text-sm">
            交卷
          </button>
        </div>
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