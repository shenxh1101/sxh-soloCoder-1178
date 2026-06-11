import { useState, useMemo } from 'react';
import { useExamStore } from '@/store/examStore';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';

function getDaysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function generateCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    result.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(d);
  }
  return result;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function UrgencyBadge({ urgency }: { urgency: 'high' | 'medium' | 'low' }) {
  const map = {
    high: { label: '紧急', cls: 'badge-danger' },
    medium: { label: '一般', cls: 'badge-warning' },
    low: { label: '正常', cls: 'badge-success' },
  };
  const { label, cls } = map[urgency];
  return <span className={cls}>{label}</span>;
}

export default function StudyPlan() {
  const studyPlan = useExamStore((s) => s.studyPlan);
  const weeklyTasks = useExamStore((s) => s.weeklyTasks);
  const courses = useExamStore((s) => s.courses);
  const chapters = useExamStore((s) => s.chapters);
  const studyProgress = useExamStore((s) => s.studyProgress);
  const saveStudyPlan = useExamStore((s) => s.saveStudyPlan);
  const toggleTaskCompleted = useExamStore((s) => s.toggleTaskCompleted);
  const saveDailyCheckIn = useExamStore((s) => s.saveDailyCheckIn);
  const hasCheckedInToday = useExamStore((s) => s.hasCheckedInToday);
  const getContinuousCheckInDays = useExamStore((s) => s.getContinuousCheckInDays);

  const [showSetup, setShowSetup] = useState(!studyPlan);
  const [targetDate, setTargetDate] = useState(studyPlan?.targetDate || '');
  const [targetScore, setTargetScore] = useState(studyPlan?.targetScore || 60);
  const [dailyTaskCount, setDailyTaskCount] = useState(studyPlan?.dailyTaskCount || 5);
  const [checkedIn, setCheckedIn] = useState(hasCheckedInToday());
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  const daysRemaining = studyPlan ? getDaysUntil(studyPlan.targetDate) : 0;
  const continuousDays = getContinuousCheckInDays();

  const currentTasks = useMemo(() => weeklyTasks[selectedDay] || [], [weeklyTasks, selectedDay]);
  const completedCount = currentTasks.filter((t) => t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleGeneratePlan = () => {
    if (!targetDate || !targetScore) return;
    saveStudyPlan(targetDate, targetScore, dailyTaskCount);
    setShowSetup(false);
  };

  const handleCheckIn = () => {
    saveDailyCheckIn();
    setCheckedIn(true);
  };

  const checkInDates = useMemo(() => {
    const today = new Date();
    const dates = new Set<string>();
    for (let i = 0; i < continuousDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.add(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [continuousDays]);

  const todayDate = new Date();

  const reviewTasks = useMemo(() => {
    return currentTasks
      .filter((t) => t.type === 'review' || t.type === 'exercise')
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.urgency] - order[b.urgency];
      });
  }, [currentTasks]);

  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();
  const calendarDays = useMemo(() => generateCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const typeBadge: Record<string, string> = {
    study: 'badge-primary',
    review: 'badge-warning',
    exercise: 'badge-success',
  };
  const typeLabel: Record<string, string> = {
    study: '学习',
    review: '复习',
    exercise: '练习',
  };

  const urgencyBg: Record<string, string> = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-green-200 bg-green-50',
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-primary-500 mb-6">学习计划</h1>

      <div className="card mb-6">
        {showSetup ? (
          <div className="max-w-lg animate-slide-up">
            <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-coral" />
              设置学习目标
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-ink mb-1.5">考试日期</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-ink mb-1.5">
                  目标分数：<span className="text-accent-coral font-bold">{targetScore}</span> 分
                </label>
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-ink mb-1.5">
                  每日学习量：<span className="text-primary-500 font-bold">{dailyTaskCount}</span> 个任务
                </label>
                <input
                  type="range"
                  value={dailyTaskCount}
                  onChange={(e) => setDailyTaskCount(Number(e.target.value))}
                  min={3}
                  max={15}
                  className="w-full h-2 rounded-full appearance-none bg-primary-100 accent-primary-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-surface-ink-light mt-1">
                  <span>3</span>
                  <span>15</span>
                </div>
              </div>
              <button onClick={handleGeneratePlan} className="btn-primary w-full">
                生成学习计划
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 animate-slide-up">
            <div>
              <p className="text-surface-ink-light text-sm">距考试还有</p>
              <p className={cn(
                'font-serif text-4xl font-bold',
                daysRemaining <= 7 ? 'text-accent-coral' : 'text-primary-500',
              )}>
                {daysRemaining > 0 ? daysRemaining : 0} <span className="text-xl font-normal">天</span>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-surface-ink-light text-sm">目标分数</p>
                <p className="text-2xl font-bold text-primary-500 font-mono">{studyPlan?.targetScore}</p>
              </div>
              <div className="text-center">
                <p className="text-surface-ink-light text-sm">每日任务</p>
                <p className="text-2xl font-bold text-primary-500 font-mono">{studyPlan?.dailyTaskCount}</p>
              </div>
              <div className="text-center">
                <p className="text-surface-ink-light text-sm">连续打卡</p>
                <p className="text-2xl font-bold text-accent-coral font-mono flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5" />
                  {continuousDays}
                </p>
              </div>
            </div>
            <button onClick={() => setShowSetup(true)} className="btn-ghost flex items-center gap-1">
              <Edit3 className="w-4 h-4" />
              修改计划
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-surface-ink flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                学习任务
                <span className="text-sm font-normal text-surface-ink-light">
                  ({completedCount}/{currentTasks.length})
                </span>
              </h2>
            </div>

            <div className="flex gap-1 mb-4 overflow-x-auto">
              {(() => {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
                weekStart.setHours(0, 0, 0, 0);
                return Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(weekStart);
                  date.setDate(weekStart.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = dateStr === todayStr;
                  const dayTasks = weeklyTasks[dateStr] || [];
                  const dayCompleted = dayTasks.filter(t => t.completed).length;
                  const dayTotal = dayTasks.length;
                  const allDone = dayTotal > 0 && dayCompleted === dayTotal;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDay(dateStr)}
                      className={cn(
                        'flex flex-col items-center px-3 py-2 rounded-btn text-xs transition-all shrink-0',
                        selectedDay === dateStr ? 'bg-primary-500 text-white' :
                        allDone ? 'bg-green-50 text-accent-success' :
                        isToday ? 'bg-primary-50 text-primary-500 font-semibold' :
                        'bg-surface-paper text-surface-ink-light hover:bg-primary-50',
                      )}
                    >
                      <span>{['一','二','三','四','五','六','日'][i]}</span>
                      <span className="font-mono text-sm font-bold">{date.getDate()}</span>
                      {dayTotal > 0 && (
                        <span className="text-xs">{dayCompleted}/{dayTotal}</span>
                      )}
                    </button>
                  );
                });
              })()}
            </div>

            <div className="space-y-2">
              {currentTasks.map((task) => (
                <label
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border border-surface-border transition-all duration-200 cursor-pointer',
                    task.completed ? 'bg-green-50 border-green-200' : 'hover:bg-primary-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompleted(task.id)}
                    className="w-5 h-5 rounded border-surface-border text-accent-success focus:ring-accent-success cursor-pointer accent-accent-success"
                  />
                  <div className={cn('flex-1 min-w-0', task.completed && 'line-through text-surface-ink-light')}>
                    <p className="font-medium text-sm truncate">{task.chapterTitle}</p>
                    <p className="text-xs text-surface-ink-light">{task.courseTitle}</p>
                  </div>
                  <span className={cn(typeBadge[task.type] || 'badge-primary')}>
                    {typeLabel[task.type] || task.type}
                  </span>
                  {task.completed && (
                    <CheckCircle2 className="w-5 h-5 text-accent-success shrink-0 animate-check" />
                  )}
                </label>
              ))}
              {currentTasks.length === 0 && (
                <p className="text-surface-ink-light text-center py-6">
                  {studyPlan
                    ? '暂无任务安排'
                    : '请先生成学习计划，系统将为您自动安排每日任务'}
                </p>
              )}
            </div>

            {selectedDay === todayStr && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                {checkedIn ? (
                  <button disabled className="btn-primary w-full bg-accent-success hover:bg-accent-success flex items-center justify-center gap-2 opacity-80">
                    <CheckCheck className="w-5 h-5" />
                    今日已打卡 ✓
                  </button>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    今日打卡
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent-gold" />
              复习提醒
            </h2>
            {reviewTasks.length > 0 ? (
              <div className="space-y-2">
                {reviewTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-colors',
                      task.completed ? 'bg-green-50 border-green-200' : urgencyBg[task.urgency],
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {task.urgency === 'high' && !task.completed && (
                        <Flame className="w-4 h-4 text-accent-coral shrink-0" />
                      )}
                      {task.urgency === 'high' && task.completed && (
                        <AlertTriangle className="w-4 h-4 text-accent-success shrink-0" />
                      )}
                      {task.urgency === 'medium' && !task.completed && (
                        <AlertTriangle className="w-4 h-4 text-accent-gold shrink-0" />
                      )}
                      <div className={cn('flex-1 min-w-0', task.completed && 'line-through text-surface-ink-light')}>
                        <p className="font-medium text-sm truncate">{task.chapterTitle}</p>
                        <p className="text-xs text-surface-ink-light">{task.courseTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.completed && (
                        <CheckCircle2 className="w-4 h-4 text-accent-success" />
                      )}
                      <UrgencyBadge urgency={task.urgency} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-ink-light text-center py-4">暂无需要复习的任务</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              {currentYear}年{currentMonth + 1}月
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAYS.map((d) => (
                <span key={d} className="text-xs font-medium text-surface-ink-light py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) {
                  return <div key={`e-${i}`} className="aspect-square" />;
                }
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isCheckedIn = checkInDates.has(dateStr);
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'aspect-square flex items-center justify-center rounded-lg text-sm relative transition-colors',
                      isToday && 'bg-primary-500 text-white font-bold',
                      !isToday && isCheckedIn && 'bg-green-50',
                      !isToday && !isCheckedIn && 'text-surface-ink-light',
                    )}
                  >
                    {day}
                    {isCheckedIn && (
                      <span
                        className={cn(
                          'absolute bottom-0.5 w-1 h-1 rounded-full',
                          isToday ? 'bg-white' : 'bg-accent-success',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-coral" />
              学习进度
            </h2>
            <div className="space-y-3">
              {courses.map((course) => {
                const courseChapters = chapters.filter((c) => c.courseId === course.id);
                const completed = courseChapters.filter((c) =>
                  studyProgress.some((sp) => sp.chapterId === c.id && sp.completed),
                ).length;
                const pct = courseChapters.length > 0 ? (completed / courseChapters.length) * 100 : 0;
                return (
                  <div key={course.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate max-w-[180px]">{course.title}</span>
                      <span className="text-surface-ink-light font-mono">
                        {completed}/{courseChapters.length}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}