import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, User, ChevronDown } from 'lucide-react';
import { useExamStore } from '@/store/examStore';

type Tab = 'login' | 'register';
type Role = 'student' | 'teacher';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useExamStore();

  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = login(email.trim());
    if (user) {
      navigate('/courses', { replace: true });
    } else {
      setLoginError('未找到该邮箱对应的账号，请检查邮箱或先注册');
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    register(name.trim(), email.trim(), role);
    navigate('/courses', { replace: true });
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-surface-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-card">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary-500 mb-1">
            备考通
          </h1>
          <p className="text-surface-ink-light text-sm">
            专注职业考试备考
          </p>
        </div>

        <div className="card p-0 overflow-hidden shadow-card">
          <div className="flex border-b border-surface-border">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-3.5 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'login'
                  ? 'text-primary-500'
                  : 'text-surface-ink-light hover:text-surface-ink'
              }`}
            >
              登录
              {activeTab === 'login' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full transition-all duration-200" />
              )}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-3.5 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'register'
                  ? 'text-primary-500'
                  : 'text-surface-ink-light hover:text-surface-ink'
              }`}
            >
              注册
              {activeTab === 'register' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full transition-all duration-200" />
              )}
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-ink mb-1.5">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-ink-light pointer-events-none" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="请输入邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-ink mb-1.5">
                    角色
                  </label>
                  <div className="relative">
                    <select
                      className="input-field appearance-none cursor-pointer"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                    >
                      <option value="student">学员</option>
                      <option value="teacher">老师</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-ink-light pointer-events-none" />
                  </div>
                </div>

                {loginError && (
                  <div className="text-sm text-accent-coral bg-red-50 rounded-btn px-4 py-2.5 animate-shake">
                    {loginError}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full py-3 text-base">
                  登录
                </button>

                <div className="text-center">
                  <p className="text-xs text-surface-ink-light leading-relaxed">
                    演示账号：student@example.com（学员） teacher@example.com（老师）
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-ink mb-1.5">
                    姓名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-ink-light pointer-events-none" />
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="请输入姓名"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-ink mb-1.5">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-ink-light pointer-events-none" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="请输入邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-ink mb-2">
                    角色
                  </label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-btn border-2 cursor-pointer transition-all duration-200 ${
                        role === 'student'
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-surface-border text-surface-ink-light hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={role === 'student'}
                        onChange={() => setRole('student')}
                        className="sr-only"
                      />
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">学员</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-btn border-2 cursor-pointer transition-all duration-200 ${
                        role === 'teacher'
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-surface-border text-surface-ink-light hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="teacher"
                        checked={role === 'teacher'}
                        onChange={() => setRole('teacher')}
                        className="sr-only"
                      />
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm font-medium">老师</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3 text-base">
                  注册
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-surface-ink-light mt-6">
          备考通 · 专注于职业考试备考效率
        </p>
      </div>
    </div>
  );
}