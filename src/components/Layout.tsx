import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  FileQuestion,
  CheckSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  GraduationCap,
  User,
} from 'lucide-react';
import { useExamStore } from '@/store/examStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useExamStore();

  const navItems = [
    { path: '/courses', label: '课程学习', icon: BookOpen },
    { path: '/exercises', label: '题库练习', icon: FileQuestion },
    { path: '/wrong-questions', label: '错题本', icon: BookMarked },
    { path: '/study-plan', label: '学习计划', icon: CheckSquare },
    { path: '/scores', label: '成绩分析', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-paper flex">
      {/* 桌面侧边栏 */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-surface-border h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-primary-500">备考通</h1>
              <p className="text-xs text-surface-ink-light">专注职业考试备考</p>
            </div>
          </div>
          {currentUser && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">{currentUser.name}</p>
                <p className="text-xs text-primary-600">
                  {currentUser.role === 'student' ? '学员' : '老师'}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "sidebar-link",
                  isActive && "active"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 移动端头部 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-lg text-primary-500">备考通</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-primary-50"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 移动端侧边栏遮罩 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 移动端侧边栏 */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 w-72 h-full bg-white z-50 transform transition-transform duration-300 overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pt-16 h-full">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "sidebar-link",
                    isActive && "active"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <hr className="my-2 border-surface-border" />
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0">
        <div className="lg:pt-0 pt-16 min-h-full">
          <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}