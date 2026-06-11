import { useState, useMemo } from 'react';
import { useExamStore } from '@/store/examStore';
import { cn } from '@/lib/utils';
import * as storage from '@/data/storage';
import type { User, ExamResult } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  FileQuestion,
  TrendingUp,
  Flame,
  AlertTriangle,
  Trophy,
  Send,
  User2,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PIE_COLORS = ['#4caf7d', '#e07b5a'];
const BAR_COLORS = {
  good: '#4caf7d',
  medium: '#c9a96e',
  bad: '#e07b5a',
};

interface ReviewPeriod {
  label: string;
  practiceCount: number;
  correctCount: number;
  wrongCount: number;
  examCount: number;
  rate: number;
  knowledgePoints: string[];
  startDate: string;
  endDate: string;
  examAvgScore: number;
  examBestScore: number;
  examWorstScore: number;
  examList: ExamResult[];
}

function getWeekLabel(date: Date): string {
  const monday = new Date(date);
  monday.setDate(date.getDate() - date.getDay() + 1);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function formatExamDate(isoStr: string): string {
  return isoStr.split('T')[0];
}

const MODE_LABELS: Record<string, string> = {
  chapter: '章节',
  random: '随机',
  timed: '限时',
};

function getStudentDetail(studentId: string) {
  const progress = storage.getStudyProgress(studentId);
  const records = storage.getExerciseRecords(studentId);
  const wrongQs = storage.getWrongQuestions(studentId);
  const checkIns = storage.getCheckIns(studentId);
  const chapters = storage.getChapters();
  return { progress, records, wrongQs, checkIns, chapters };
}

export default function Scores() {
  const currentUser = useExamStore((s) => s.currentUser);
  const getPracticeRecordsCount = useExamStore((s) => s.getPracticeRecordsCount);
  const getCorrectRateByKnowledgePoint = useExamStore((s) => s.getCorrectRateByKnowledgePoint);
  const getTotalProgress = useExamStore((s) => s.getTotalProgress);
  const getContinuousCheckInDays = useExamStore((s) => s.getContinuousCheckInDays);
  const announcements = useExamStore((s) => s.announcements);
  const addAnnouncement = useExamStore((s) => s.addAnnouncement);
  const courses = useExamStore((s) => s.courses);
  const chapters = useExamStore((s) => s.chapters);
  const getExamSessions = useExamStore((s) => s.getExamSessions);
  const getTeacherReminderNote = useExamStore((s) => s.getTeacherReminderNote);
  const saveTeacherReminderNote = useExamStore((s) => s.saveTeacherReminderNote);

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<'week' | 'month'>('week');
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [reminderNotes, setReminderNotes] = useState<Record<string, string>>({});

  const { total, correct } = getPracticeRecordsCount();
  const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalProgress = Math.round(getTotalProgress());
  const continuousDays = getContinuousCheckInDays();
  const kpRates = getCorrectRateByKnowledgePoint();

  const examSessions = getExamSessions ? getExamSessions() : [];

  const pieData = useMemo(() => [
    { name: '正确', value: correct },
    { name: '错误', value: total - correct },
  ], [correct, total]);

  const barData = useMemo(() => {
    return Object.entries(kpRates)
      .map(([name, data]) => ({ name, rate: Math.round(data.rate), total: data.total, correct: data.correct }))
      .sort((a, b) => a.rate - b.rate);
  }, [kpRates]);

  const weaknessList = useMemo(() => {
    return Object.entries(kpRates)
      .map(([name, data]) => ({ name, rate: Math.round(data.rate), total: data.total, correct: data.correct }))
      .sort((a, b) => a.rate - b.rate);
  }, [kpRates]);

  const reviewData = useMemo(() => {
    if (!currentUser) return [];

    const records = storage.getExerciseRecords(currentUser.id);
    const exams = storage.getExamResults(currentUser.id);

    const getLabel = reviewMode === 'week' ? getWeekLabel : getMonthLabel;

    const groups = new Map<string, { practiceCount: number; correctCount: number; wrongCount: number; examCount: number; knowledgePoints: Set<string>; startDate: string; endDate: string; examScores: number[]; examList: ExamResult[]; }>();

    for (const record of records) {
      const date = new Date(record.createdAt);
      const label = getLabel(date);
      if (!groups.has(label)) {
        groups.set(label, { practiceCount: 0, correctCount: 0, wrongCount: 0, examCount: 0, knowledgePoints: new Set(), startDate: record.createdAt, endDate: record.createdAt, examScores: [], examList: [] });
      }
      const g = groups.get(label)!;
      g.practiceCount++;
      if (record.isCorrect) {
        g.correctCount++;
      } else {
        g.wrongCount++;
      }
      const question = storage.getQuestionById(record.questionId);
      if (question) {
        g.knowledgePoints.add(question.knowledgePoint);
      }
      if (record.createdAt < g.startDate) g.startDate = record.createdAt;
      if (record.createdAt > g.endDate) g.endDate = record.createdAt;
    }

    for (const exam of exams) {
      const date = new Date(exam.createdAt);
      const label = getLabel(date);
      if (!groups.has(label)) {
        groups.set(label, { practiceCount: 0, correctCount: 0, wrongCount: 0, examCount: 0, knowledgePoints: new Set(), startDate: exam.createdAt, endDate: exam.createdAt, examScores: [], examList: [] });
      }
      const g = groups.get(label)!;
      g.examCount++;
      g.examScores.push(exam.score);
      g.examList.push(exam);
      if (exam.createdAt < g.startDate) g.startDate = exam.createdAt;
      if (exam.createdAt > g.endDate) g.endDate = exam.createdAt;
    }

    const result: ReviewPeriod[] = [];
    for (const [label, g] of groups) {
      const scores = g.examScores;
      const hasExams = scores.length > 0;
      result.push({
        label,
        practiceCount: g.practiceCount,
        correctCount: g.correctCount,
        wrongCount: g.wrongCount,
        examCount: g.examCount,
        rate: g.practiceCount > 0 ? Math.round((g.correctCount / g.practiceCount) * 100) : 0,
        knowledgePoints: Array.from(g.knowledgePoints),
        startDate: g.startDate,
        endDate: g.endDate,
        examAvgScore: hasExams ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        examBestScore: hasExams ? Math.max(...scores) : 0,
        examWorstScore: hasExams ? Math.min(...scores) : 0,
        examList: g.examList,
      });
    }

    result.sort((a, b) => a.label.localeCompare(b.label));
    return result;
  }, [currentUser, reviewMode]);

  const chartData = useMemo(() => {
    return reviewData.map((p) => ({
      label: p.label,
      rate: p.rate,
      practiceCount: p.practiceCount,
      wrongCount: p.wrongCount,
      examAvgScore: p.examAvgScore,
      examCount: p.examCount,
    }));
  }, [reviewData]);

  const togglePeriod = (label: string) => {
    setExpandedPeriod(expandedPeriod === label ? null : label);
  };

  const students = useMemo(() => {
    return storage.getUsers().filter(u => u.id !== currentUser?.id);
  }, [currentUser]);

  const studentData = useMemo(() => {
    const allChapters = storage.getChapters();

    return students.map((s: User) => {
      const progress = storage.getStudyProgress(s.id);
      const progressPercent = allChapters.length > 0
        ? Math.round((progress.filter(p => p.completed).length / allChapters.length) * 100)
        : 0;

      const records = storage.getExerciseRecords(s.id);
      const correctRecords = records.filter(r => r.isCorrect).length;
      const correctRatePercent = records.length > 0 ? Math.round((correctRecords / records.length) * 100) : 0;

      const lastActive = storage.getLastActiveDate(s.id);

      return {
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        progress: progressPercent,
        correctRate: correctRatePercent,
        lastActive,
        role: s.role,
      };
    });
  }, [students]);

  const handlePublish = () => {
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement(annTitle.trim(), annContent.trim());
    setAnnTitle('');
    setAnnContent('');
  };

  const getBarColor = (rate: number) => {
    if (rate >= 70) return BAR_COLORS.good;
    if (rate >= 40) return BAR_COLORS.medium;
    return BAR_COLORS.bad;
  };

  const isTeacher = currentUser?.role === 'teacher';

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-primary-500 mb-6">成绩分析</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-hover text-center">
          <PieChartIcon className="w-8 h-8 text-accent-success mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-accent-success">{correctRate}%</p>
          <p className="text-sm text-surface-ink-light">总正确率</p>
        </div>
        <div className="card-hover text-center">
          <FileQuestion className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-primary-500">{total}</p>
          <p className="text-sm text-surface-ink-light">总做题数</p>
        </div>
        <div className="card-hover text-center">
          <TrendingUp className="w-8 h-8 text-accent-gold mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-accent-gold">{totalProgress}%</p>
          <p className="text-sm text-surface-ink-light">学习进度</p>
        </div>
        <div className="card-hover text-center">
          <Flame className="w-8 h-8 text-accent-coral mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-accent-coral">{continuousDays}</p>
          <p className="text-sm text-surface-ink-light">连续打卡</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            知识点正确率
          </h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7d8e' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7d8e' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e8e4df',
                    boxShadow: '0 4px 12px rgba(30,58,95,0.1)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value}%`, '正确率']}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-surface-ink-light">
              暂无练习数据，开始做题后会显示正确率统计
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary-500" />
            正确率分布
          </h2>
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e8e4df',
                    boxShadow: '0 4px 12px rgba(30,58,95,0.1)',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-sm text-surface-ink">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-surface-ink-light">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent-coral" />
          薄弱知识点分析
        </h2>
        {weaknessList.length > 0 ? (
          <div className="space-y-3">
            {weaknessList.map((item) => {
              const isWeak = item.rate < 40;
              return (
                <div
                  key={item.name}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-xl transition-colors',
                    isWeak ? 'bg-red-50 border border-red-200' : 'hover:bg-primary-50',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm flex items-center gap-2">
                      {item.name}
                      {isWeak && <span className="badge-danger text-xs">薄弱</span>}
                    </p>
                    <div className="progress-bar mt-1">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          item.rate >= 70
                            ? 'bg-accent-success'
                            : item.rate >= 40
                              ? 'bg-accent-gold'
                              : 'bg-accent-coral',
                        )}
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('font-mono font-bold text-sm', isWeak ? 'text-accent-coral' : 'text-surface-ink')}>
                      {item.rate}%
                    </p>
                    <p className="text-xs text-surface-ink-light">
                      {item.correct}/{item.total}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-surface-ink-light text-center py-8">开始练习后，这里会显示各知识点正确率分析</p>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          复盘视图
        </h2>

        <div className="flex gap-2 mb-4">
          {(['week', 'month'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setReviewMode(mode)}
              className={cn(
                'px-4 py-1.5 rounded-btn text-sm font-medium transition-all',
                reviewMode === mode ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-500 hover:bg-primary-100',
              )}
            >
              {mode === 'week' ? '按周' : '按月'}
            </button>
          ))}
        </div>

        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7d8e' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7d8e' }} domain={[0, 100]} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7d8e' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e8e4df', fontSize: '13px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rate" stroke="#4caf7d" strokeWidth={2} name="正确率(%)" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="practiceCount" stroke="#1e3a5f" strokeWidth={2} name="做题数" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="wrongCount" stroke="#e07b5a" strokeWidth={2} name="错题数" dot={{ r: 4 }} />
                <Line yAxisId="left" type="monotone" dataKey="examAvgScore" stroke="#c9a96e" strokeWidth={2} name="模考均分" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="examCount" stroke="#7c3aed" strokeWidth={1.5} name="考试次数" dot={{ r: 3 }} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {reviewData.map((period, idx) => (
                <div key={period.label}>
                  <div
                    onClick={() => togglePeriod(period.label)}
                    className="flex justify-between items-center p-3 rounded-xl bg-primary-50/30 cursor-pointer hover:bg-primary-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-surface-ink">{period.label}</span>
                    <span className="text-xs text-surface-ink-light">
                      练习{period.practiceCount}题 | 正确率{period.rate}% | 错题{period.wrongCount} | 模考{period.examCount}次 | 均分{period.examAvgScore}
                    </span>
                  </div>
                  {expandedPeriod === period.label && (
                    <div className="mt-2 p-3 bg-primary-50/50 rounded-xl">
                      <p className="text-sm font-medium mb-2">涉及知识点：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {period.knowledgePoints.map(kp => (
                          <span key={kp} className="badge-primary">{kp}</span>
                        ))}
                      </div>
                      {period.examList && period.examList.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">模考记录：</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-primary-50 rounded-lg">
                                <th className="text-left p-2 font-medium text-surface-ink">考试名称</th>
                                <th className="text-center p-2 font-medium text-surface-ink">得分</th>
                                <th className="text-center p-2 font-medium text-surface-ink">正确率</th>
                                <th className="text-center p-2 font-medium text-surface-ink">日期</th>
                              </tr>
                            </thead>
                            <tbody>
                              {period.examList.map((exam, ei) => (
                                <tr key={exam.id} className="border-b border-surface-border last:border-0">
                                  <td className="p-2 font-medium">模拟考试 #{ei + 1}</td>
                                  <td className="p-2 text-center font-mono font-bold text-primary-500">{exam.score}</td>
                                  <td className="p-2 text-center">
                                    <span className={cn(
                                      'font-mono',
                                      exam.totalQuestions > 0 && (exam.correctCount / exam.totalQuestions * 100) >= 80 ? 'text-accent-success'
                                        : exam.totalQuestions > 0 && (exam.correctCount / exam.totalQuestions * 100) >= 60 ? 'text-accent-gold'
                                        : 'text-accent-coral',
                                    )}>
                                      {exam.totalQuestions > 0 ? Math.round((exam.correctCount / exam.totalQuestions) * 100) : 0}%
                                    </span>
                                  </td>
                                  <td className="p-2 text-center text-surface-ink-light">{formatExamDate(exam.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-surface-ink-light text-center py-8">暂无练习记录，开始刷题后会显示复盘分析</p>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-gold" />
          模拟考试成绩
        </h2>
        {examSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 rounded-lg">
                  <th className="text-left p-3 font-medium text-surface-ink rounded-l-lg">序号</th>
                  <th className="text-left p-3 font-medium text-surface-ink">考试名称</th>
                  <th className="text-center p-3 font-medium text-surface-ink">得分</th>
                  <th className="text-center p-3 font-medium text-surface-ink">正确率</th>
                  <th className="text-center p-3 font-medium text-surface-ink">日期</th>
                  <th className="text-center p-3 font-medium text-surface-ink rounded-r-lg">排名</th>
                </tr>
              </thead>
              <tbody>
                {examSessions.map((exam, i) => (
                  <tr key={exam.id} className="border-b border-surface-border last:border-0 hover:bg-primary-50/50 transition-colors">
                    <td className="p-3 text-surface-ink-light">{i + 1}</td>
                    <td className="p-3 font-medium">模拟考试 #{i + 1}</td>
                    <td className="p-3 text-center font-mono font-bold text-primary-500">{exam.score}</td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        'font-mono',
                        exam.score >= 80 ? 'text-accent-success' : exam.score >= 60 ? 'text-accent-gold' : 'text-accent-coral',
                      )}>
                        {exam.score}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-surface-ink-light">{formatExamDate(exam.createdAt)}</td>
                    <td className="p-3 text-center">
                      <span className="text-surface-ink-light font-mono">-</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-surface-ink-light text-center py-8">暂无模拟考试记录</p>
        )}
      </div>

      {isTeacher && (
        <div className="space-y-6 animate-slide-up">
          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary-500" />
              发布公告
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="公告标题"
                className="input-field"
              />
              <textarea
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="公告内容..."
                className="input-field min-h-[100px] resize-none"
                rows={4}
              />
              <button onClick={handlePublish} className="btn-primary">
                发布公告
              </button>
            </div>
          </div>

          {announcements.length > 0 && (
            <div className="card">
              <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4">已发布公告</h2>
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl border border-surface-border bg-primary-50/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-ink">{ann.title}</p>
                        <p className="text-sm text-surface-ink-light mt-1 line-clamp-2">{ann.content}</p>
                      </div>
                      <span className="text-xs text-surface-ink-light shrink-0">
                        {formatDate(ann.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="font-serif text-lg font-semibold text-surface-ink mb-4 flex items-center gap-2">
              <User2 className="w-5 h-5 text-primary-500" />
              学员完成情况
            </h2>
            {studentData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary-50 rounded-lg">
                      <th className="text-left p-3 font-medium text-surface-ink rounded-l-lg">学员</th>
                      <th className="text-center p-3 font-medium text-surface-ink">角色</th>
                      <th className="text-center p-3 font-medium text-surface-ink">学习进度</th>
                      <th className="text-center p-3 font-medium text-surface-ink">正确率</th>
                      <th className="text-center p-3 font-medium text-surface-ink rounded-r-lg">最近活动</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.map((s) => {
                      const isExpanded = expandedStudentId === s.id;
                      const detail = isExpanded ? getStudentDetail(s.id) : null;
                      const last7Days = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return d.toISOString().split('T')[0];
                      }).reverse();

                      return (
                        <tr key={s.id}>
                          <td colSpan={5} className="p-0">
                            <table className="w-full text-sm">
                              <tbody>
                                <tr
                                  className={cn(
                                    'border-b border-surface-border last:border-0 hover:bg-primary-50/50 transition-colors cursor-pointer',
                                    isExpanded && 'bg-primary-50/50',
                                  )}
                                  onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                                >
                                  <td className="p-3" style={{ width: '30%' }}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-medium text-sm">
                                        {s.name.charAt(0)}
                                      </div>
                                      <span className="font-medium">{s.name}</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-surface-ink-light ml-auto" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-surface-ink-light ml-auto" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center" style={{ width: '12%' }}>
                                    <span className="text-xs text-surface-ink-light">
                                      {s.role === 'teacher' ? '老师' : '学员'}
                                    </span>
                                  </td>
                                  <td className="p-3" style={{ width: '28%' }}>
                                    <div className="flex items-center gap-2 justify-center">
                                      <div className="progress-bar flex-1 max-w-[120px]">
                                        <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                                      </div>
                                      <span className="font-mono text-xs text-surface-ink-light w-10">{s.progress}%</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center" style={{ width: '15%' }}>
                                    <span className={cn(
                                      'font-mono',
                                      s.correctRate >= 80 ? 'text-accent-success' : s.correctRate >= 60 ? 'text-accent-gold' : 'text-accent-coral',
                                    )}>
                                      {s.correctRate}%
                                    </span>
                                  </td>
                                  <td className="p-3 text-center text-surface-ink-light" style={{ width: '15%' }}>{s.lastActive}</td>
                                </tr>
                              </tbody>
                            </table>
                            {isExpanded && detail && (
                              <div className="bg-primary-50/50 p-6 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="card">
                                    <h4 className="font-serif font-semibold text-primary-500 mb-3">课程进度</h4>
                                    <div className="space-y-2">
                                      {courses.map((course) => {
                                        const courseChapters = detail.chapters.filter(c => c.courseId === course.id);
                                        const completed = courseChapters.filter(c =>
                                          detail.progress.some(sp => sp.chapterId === c.id && sp.completed),
                                        ).length;
                                        const pct = courseChapters.length > 0 ? (completed / courseChapters.length) * 100 : 0;
                                        return (
                                          <div key={course.id}>
                                            <div className="flex justify-between text-xs mb-1">
                                              <span className="font-medium truncate max-w-[140px]">{course.title}</span>
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
                                  <div className="card">
                                    <h4 className="font-serif font-semibold text-primary-500 mb-3">最近练习</h4>
                                    {detail.records.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {detail.records.slice(-5).reverse().map((r) => (
                                          <div key={r.id} className="flex items-center justify-between text-xs py-1 border-b border-surface-border last:border-0">
                                            <span className="font-mono text-surface-ink-light">{r.questionId}</span>
                                            <span className={r.isCorrect ? 'text-accent-success' : 'text-accent-coral'}>
                                              {r.isCorrect ? '✓' : '✗'}
                                            </span>
                                            <span className="text-surface-ink-light">{MODE_LABELS[r.mode] || r.mode}</span>
                                            <span className="text-surface-ink-light">{formatExamDate(r.createdAt)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-surface-ink-light text-sm">暂无练习记录</p>
                                    )}
                                  </div>
                                  <div className="card">
                                    <h4 className="font-serif font-semibold text-primary-500 mb-3">错题统计</h4>
                                    <p className="text-3xl font-mono font-bold text-accent-coral">{detail.wrongQs.length}</p>
                                    <p className="text-sm text-surface-ink-light">当前未掌握错题</p>
                                  </div>
                                  <div className="card">
                                    <h4 className="font-serif font-semibold text-primary-500 mb-3">最近打卡</h4>
                                    {(() => {
                                      const checkedInDates = detail.checkIns
                                        .filter(c => last7Days.includes(c.checkDate))
                                        .map(c => c.checkDate);
                                      return checkedInDates.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {last7Days.map((date) => {
                                            const isChecked = checkedInDates.includes(date);
                                            return (
                                              <span
                                                key={date}
                                                className={cn(
                                                  'px-2 py-1 rounded text-xs font-mono',
                                                  isChecked
                                                    ? 'bg-accent-success/10 text-accent-success border border-accent-success/30'
                                                    : 'bg-surface-border/30 text-surface-ink-light',
                                                )}
                                              >
                                                {date.slice(5)}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="text-surface-ink-light text-sm">暂无打卡记录</p>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <div className="card mt-4">
                                  <h4 className="font-serif font-semibold text-primary-500 mb-3">本周 vs 上周</h4>
                                  {(() => {
                                    const now = new Date();
                                    const thisWeekStart = new Date(now);
                                    thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
                                    thisWeekStart.setHours(0, 0, 0, 0);
                                    const thisWeekEnd = now;

                                    const lastWeekStart = new Date(thisWeekStart);
                                    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
                                    const lastWeekEnd = new Date(thisWeekStart);
                                    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

                                    const filterByRange = (records: any[], start: Date, end: Date) => {
                                      return records.filter(r => {
                                        const d = new Date(r.createdAt || r.checkDate);
                                        return d >= start && d <= end;
                                      });
                                    };

                                    const thisWeekRecords = filterByRange(detail.records, thisWeekStart, thisWeekEnd);
                                    const lastWeekRecords = filterByRange(detail.records, lastWeekStart, lastWeekEnd);

                                    const thisWeekRate = thisWeekRecords.length > 0
                                      ? Math.round((thisWeekRecords.filter(r => r.isCorrect).length / thisWeekRecords.length) * 100)
                                      : null;
                                    const lastWeekRate = lastWeekRecords.length > 0
                                      ? Math.round((lastWeekRecords.filter(r => r.isCorrect).length / lastWeekRecords.length) * 100)
                                      : null;

                                    const thisWeekWrong = thisWeekRecords.filter(r => !r.isCorrect).length;
                                    const lastWeekWrong = lastWeekRecords.filter(r => !r.isCorrect).length;

                                    const thisWeekCheckIns = filterByRange(detail.checkIns, thisWeekStart, thisWeekEnd);
                                    const lastWeekCheckIns = filterByRange(detail.checkIns, lastWeekStart, lastWeekEnd);

                                    const thisWeekProgress = storage.getStudyProgress(s.id).filter(p => {
                                      const d = new Date(p.completedAt);
                                      return d >= thisWeekStart && d <= thisWeekEnd;
                                    }).length;
                                    const lastWeekProgress = storage.getStudyProgress(s.id).filter(p => {
                                      const d = new Date(p.completedAt);
                                      return d >= lastWeekStart && d <= lastWeekEnd;
                                    }).length;

                                    return (
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-surface-ink-light">做题正确率</span>
                                          <div className="flex items-center gap-2">
                                            {lastWeekRate !== null && (
                                              <span className="text-sm text-surface-ink-light">{lastWeekRate}%</span>
                                            )}
                                            {lastWeekRate !== null && thisWeekRate !== null && (
                                              <span className="text-xs">
                                                {thisWeekRate > lastWeekRate ? '↑' : thisWeekRate < lastWeekRate ? '↓' : '→'}
                                              </span>
                                            )}
                                            <span className={cn(
                                              'font-mono font-bold',
                                              thisWeekRate !== null && thisWeekRate >= 80
                                                ? 'text-accent-success'
                                                : thisWeekRate !== null && thisWeekRate >= 60
                                                  ? 'text-accent-gold'
                                                  : 'text-accent-coral',
                                            )}>
                                              {thisWeekRate !== null ? `${thisWeekRate}%` : '-'}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-surface-ink-light">完成章节</span>
                                          <div className="flex items-center gap-2">
                                            {lastWeekProgress > 0 && (
                                              <span className="text-sm text-surface-ink-light">{lastWeekProgress}章</span>
                                            )}
                                            {lastWeekProgress > 0 && (
                                              <span className="text-xs">
                                                {thisWeekProgress > lastWeekProgress ? '↑' : thisWeekProgress < lastWeekProgress ? '↓' : '→'}
                                              </span>
                                            )}
                                            <span className="font-mono font-bold text-primary-500">{thisWeekProgress}章</span>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-surface-ink-light">当前错题</span>
                                          <div className="flex items-center gap-2">
                                            {lastWeekWrong > 0 && (
                                              <span className="text-sm text-surface-ink-light">{lastWeekWrong}题</span>
                                            )}
                                            {lastWeekWrong > 0 && thisWeekWrong > 0 && (
                                              <span className="text-xs">
                                                {thisWeekWrong > lastWeekWrong ? '↑' : thisWeekWrong < lastWeekWrong ? '↓' : '→'}
                                              </span>
                                            )}
                                            <span className="font-mono font-bold text-accent-coral">{thisWeekWrong}题</span>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-surface-ink-light">本周打卡</span>
                                          <div className="flex items-center gap-2">
                                            {lastWeekCheckIns.length > 0 && (
                                              <span className="text-sm text-surface-ink-light">{lastWeekCheckIns.length}天</span>
                                            )}
                                            {lastWeekCheckIns.length > 0 && thisWeekCheckIns.length > 0 && (
                                              <span className="text-xs">
                                                {thisWeekCheckIns.length > lastWeekCheckIns.length ? '↑' : thisWeekCheckIns.length < lastWeekCheckIns.length ? '↓' : '→'}
                                              </span>
                                            )}
                                            <span className={cn(
                                              'font-mono font-bold',
                                              thisWeekCheckIns.length >= 3 ? 'text-accent-success' : 'text-accent-gold',
                                            )}>
                                              {thisWeekCheckIns.length}天
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="card mt-4">
                                  <h4 className="font-serif font-semibold text-primary-500 mb-3">跟进备注</h4>
                                  <textarea
                                    className="input-field min-h-[100px] resize-none w-full text-sm"
                                    rows={4}
                                    value={reminderNotes[s.id] ?? getTeacherReminderNote(s.id)}
                                    onChange={(e) => setReminderNotes({ ...reminderNotes, [s.id]: e.target.value })}
                                    placeholder="写下对这个学员的跟进提醒..."
                                  />
                                  <div className="mt-3 flex justify-end">
                                    <button
                                      className="btn-primary px-4 py-2 text-sm"
                                      onClick={() => {
                                        const note = reminderNotes[s.id] ?? getTeacherReminderNote(s.id);
                                        saveTeacherReminderNote(s.id, note);
                                      }}
                                    >
                                      保存备注
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-surface-ink-light text-center py-8">暂无学员数据</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}