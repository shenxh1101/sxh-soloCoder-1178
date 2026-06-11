import { useState, useMemo } from 'react';
import { useExamStore } from '@/store/examStore';
import { cn } from '@/lib/utils';
import { getUsers } from '@/data/storage';
import type { User } from '@/types';
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
} from 'lucide-react';

const PIE_COLORS = ['#4caf7d', '#e07b5a'];
const BAR_COLORS = {
  good: '#4caf7d',
  medium: '#c9a96e',
  bad: '#e07b5a',
};

interface MockExam {
  id: string;
  name: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  date: string;
  rank: number;
}

const MOCK_EXAMS: MockExam[] = [
  { id: 'exam-1', name: '第一次模拟考试', score: 72, totalQuestions: 100, correctCount: 72, date: '2026-05-10', rank: 15 },
  { id: 'exam-2', name: '第二次模拟考试', score: 78, totalQuestions: 100, correctCount: 78, date: '2026-05-24', rank: 12 },
  { id: 'exam-3', name: '期中综合测试', score: 85, totalQuestions: 80, correctCount: 68, date: '2026-06-01', rank: 8 },
  { id: 'exam-4', name: '章节专项测试', score: 90, totalQuestions: 50, correctCount: 45, date: '2026-06-08', rank: 5 },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function Scores() {
  const currentUser = useExamStore((s) => s.currentUser);
  const getExerciseRecordsCount = useExamStore((s) => s.getExerciseRecordsCount);
  const getCorrectRateByKnowledgePoint = useExamStore((s) => s.getCorrectRateByKnowledgePoint);
  const getTotalProgress = useExamStore((s) => s.getTotalProgress);
  const getContinuousCheckInDays = useExamStore((s) => s.getContinuousCheckInDays);
  const announcements = useExamStore((s) => s.announcements);
  const addAnnouncement = useExamStore((s) => s.addAnnouncement);
  const courses = useExamStore((s) => s.courses);
  const chapters = useExamStore((s) => s.chapters);

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const { total, correct } = getExerciseRecordsCount();
  const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalProgress = Math.round(getTotalProgress());
  const continuousDays = getContinuousCheckInDays();
  const kpRates = getCorrectRateByKnowledgePoint();

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

  const students = useMemo(() => {
    try {
      return getUsers().filter((u: User) => u.role === 'student');
    } catch {
      return [];
    }
  }, []);

  const studentData = useMemo(() => {
    return students.map((s: User, i: number) => {
      const progress = 30 + Math.floor(Math.random() * 70);
      const cr = 40 + Math.floor(Math.random() * 55);
      return {
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        progress,
        correctRate: cr,
        lastActive: `${Math.floor(Math.random() * 3) + 1}天前`,
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
          <Trophy className="w-5 h-5 text-accent-gold" />
          模拟考试成绩
        </h2>
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
              {MOCK_EXAMS.map((exam, i) => {
                const rate = Math.round((exam.correctCount / exam.totalQuestions) * 100);
                return (
                  <tr key={exam.id} className="border-b border-surface-border last:border-0 hover:bg-primary-50/50 transition-colors">
                    <td className="p-3 text-surface-ink-light">{i + 1}</td>
                    <td className="p-3 font-medium">{exam.name}</td>
                    <td className="p-3 text-center font-mono font-bold text-primary-500">{exam.score}</td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        'font-mono',
                        rate >= 80 ? 'text-accent-success' : rate >= 60 ? 'text-accent-gold' : 'text-accent-coral',
                      )}>
                        {rate}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-surface-ink-light">{formatDate(exam.date)}</td>
                    <td className="p-3 text-center">
                      <span className="badge-primary font-mono">第{exam.rank}名</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                      <th className="text-center p-3 font-medium text-surface-ink">学习进度</th>
                      <th className="text-center p-3 font-medium text-surface-ink">正确率</th>
                      <th className="text-center p-3 font-medium text-surface-ink rounded-r-lg">最近活动</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.map((s) => (
                      <tr key={s.id} className="border-b border-surface-border last:border-0 hover:bg-primary-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-medium text-sm">
                              {s.name.charAt(0)}
                            </div>
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="progress-bar flex-1 max-w-[120px]">
                              <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                            </div>
                            <span className="font-mono text-xs text-surface-ink-light w-10">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={cn(
                            'font-mono',
                            s.correctRate >= 80 ? 'text-accent-success' : s.correctRate >= 60 ? 'text-accent-gold' : 'text-accent-coral',
                          )}>
                            {s.correctRate}%
                          </span>
                        </td>
                        <td className="p-3 text-center text-surface-ink-light">{s.lastActive}</td>
                      </tr>
                    ))}
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