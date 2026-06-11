import { useState, useMemo, useCallback, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useExamStore } from '@/store/examStore';
import * as storage from '@/data/storage';
import type { Question } from '@/types';
import QuestionCard from './QuestionCard';
import QuestionNav from './QuestionNav';
import ResultModal from './ResultModal';

type AnswerState = {
  selected: string[];
  submitted: boolean;
  showExplanation: boolean;
  isCorrect: boolean;
};

export default function ChapterMode() {
  const { courses, getChaptersByCourse, isFavorite, toggleFavorite, saveExerciseRecord } = useExamStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showReport, setShowReport] = useState(false);
  const startTimeRef = useRef(Date.now());

  const chapters = useMemo(() => {
    if (!selectedCourseId) return [];
    return getChaptersByCourse(selectedCourseId);
  }, [selectedCourseId, getChaptersByCourse]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedChapterId('');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setShowReport(false);
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    const qs = storage.getAllQuestionsByChapter(chapterId);
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    setShowReport(false);
    startTimeRef.current = Date.now();
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
    saveExerciseRecord(currentQuestion.id, correct, 'chapter');

    if (currentIndex === questions.length - 1) {
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

  const navStatuses = useMemo(() => {
    return questions.map(q => {
      const a = answers[q.id];
      if (!a || !a.submitted) return 'unanswered' as const;
      return a.isCorrect ? 'correct' as const : 'incorrect' as const;
    });
  }, [questions, answers]);

  const completedCount = questions.filter(q => answers[q.id]?.submitted).length;
  const correctCount = questions.filter(q => answers[q.id]?.isCorrect).length;
  const wrongCount = completedCount - correctCount;
  const timeUsed = Math.round((Date.now() - startTimeRef.current) / 1000);

  const wrongDetails = questions
    .filter(q => answers[q.id]?.submitted && !answers[q.id]?.isCorrect)
    .map(q => ({
      questionId: q.id,
      content: q.content,
      correctAnswer: q.answer,
      userAnswer: (answers[q.id]?.selected || []).join(''),
    }));

  const handleCloseReport = () => {
    setShowReport(false);
    setCurrentIndex(0);
    setAnswers({});
    startTimeRef.current = Date.now();
  };

  return (
    <div className="animate-fade-in">
      <ResultModal
        open={showReport}
        totalQuestions={questions.length}
        correctCount={correctCount}
        wrongCount={wrongCount}
        timeUsed={timeUsed}
        wrongDetails={wrongDetails}
        onClose={handleCloseReport}
      />

      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-surface-ink-light mb-1.5">选择课程</label>
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={e => handleCourseChange(e.target.value)}
                className="input-field appearance-none pr-10"
              >
                <option value="">请选择课程</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-ink-light pointer-events-none" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-surface-ink-light mb-1.5">选择章节</label>
            <div className="relative">
              <select
                value={selectedChapterId}
                onChange={e => handleChapterChange(e.target.value)}
                disabled={!selectedCourseId}
                className="input-field appearance-none pr-10"
              >
                <option value="">请选择章节</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    第{chapter.order}章 {chapter.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-ink-light pointer-events-none" />
            </div>
          </div>
        </div>
        {questions.length > 0 && (
          <div className="mt-3 flex items-center gap-4 text-sm text-surface-ink-light">
            <span>共 <strong className="text-surface-ink">{questions.length}</strong> 题</span>
            <span>已答 <strong className="text-surface-ink">{completedCount}</strong> 题</span>
          </div>
        )}
      </div>

      {currentQuestion ? (
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
      ) : questions.length === 0 && selectedCourseId ? (
        <div className="card text-center py-12">
          <p className="text-surface-ink-light">该章节暂无题目</p>
        </div>
      ) : null}
    </div>
  );
}