import { useState, useMemo } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useExamStore } from '@/store/examStore';
import { cn } from '@/lib/utils';
import type { Course, Chapter, ChapterMaterial } from '@/types';

function MaterialCard({
  material,
  isActive,
  onClick,
  index,
}: {
  material: ChapterMaterial;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card flex items-start gap-4 cursor-pointer transition-all duration-200',
        isActive
          ? 'border-primary-300 shadow-card-hover'
          : 'card-hover border-surface-border'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          material.type === 'video' ? 'bg-accent-coral/10 text-accent-coral' : 'bg-primary-50 text-primary-500'
        )}
      >
        {material.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-ink">资料 {index + 1}：{material.title}</p>
        <p className="text-xs text-surface-ink-light mt-0.5">
          {material.type === 'video' ? '视频' : '文档'}
        </p>
      </div>
    </div>
  );
}

export default function Courses() {
  const {
    courses,
    chapters,
    getChaptersByCourse,
    getCourseProgress,
    isChapterCompleted,
    markChapterCompleted,
  } = useExamStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const courseChapters: Chapter[] = useMemo(
    () => (selectedCourseId ? getChaptersByCourse(selectedCourseId) : []),
    [selectedCourseId, getChaptersByCourse, chapters]
  );

  const courseProgress = useMemo(
    () => (selectedCourseId ? getCourseProgress(selectedCourseId) : null),
    [selectedCourseId, getCourseProgress]
  );

  const selectedChapter = useMemo(
    () => courseChapters.find((ch) => ch.id === selectedChapterId) || null,
    [courseChapters, selectedChapterId]
  );

  const materials: ChapterMaterial[] = selectedChapter?.materials || [];
  const totalMaterials = materials.length;

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    const chs = getChaptersByCourse(course.id);
    const firstChapterId = chs.length > 0 ? chs[0].id : null;
    setSelectedChapterId(firstChapterId);
    setActiveMaterialIndex(0);
  };

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveMaterialIndex(0);
  };

  const handlePrevMaterial = () => {
    setActiveMaterialIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMaterial = () => {
    setActiveMaterialIndex((prev) => Math.min(totalMaterials - 1, prev + 1));
  };

  const handleToggleComplete = () => {
    if (!selectedChapterId) return;
    markChapterCompleted(selectedChapterId, !isChapterCompleted(selectedChapterId));
  };

  const completed = selectedChapterId ? isChapterCompleted(selectedChapterId) : false;
  const chapterIndex = courseChapters.findIndex((ch) => ch.id === selectedChapterId);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-surface-ink-light animate-fade-in">
      <BookOpen className="w-16 h-16 mb-4 opacity-30" />
      <p className="text-lg font-medium text-surface-ink mb-1">选择课程开始学习</p>
      <p className="text-sm">点击左侧课程卡，开始你的学习之旅</p>
    </div>
  );

  const renderChapterEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48 text-surface-ink-light animate-fade-in">
      <GraduationCap className="w-12 h-12 mb-3 opacity-30" />
      <p className="text-sm">该课程暂无章节内容</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-surface-ink mb-6">
        课程学习
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ===== 左侧区域 ===== */}
        <div className="lg:w-80 lg:shrink-0 flex flex-col gap-4">
          {/* 课程选择 */}
          <div className="space-y-3">
            <h2 className="font-medium text-surface-ink-light text-sm uppercase tracking-wider">
              选择课程
            </h2>
            {courses.map((course) => {
              const progress = getCourseProgress(course.id);
              const isSelected = selectedCourseId === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className={cn(
                    'card cursor-pointer transition-all duration-200 p-4 border-l-[3px]',
                    isSelected
                      ? 'border-l-primary-500 shadow-card-hover bg-primary-50/50'
                      : 'border-l-transparent card-hover'
                  )}
                >
                  <p className="font-medium text-surface-ink truncate">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="badge-primary">{course.subject}</span>
                    <span className="text-xs text-surface-ink-light">
                      {course.totalChapters} 章
                    </span>
                  </div>
                  <p className="text-xs text-surface-ink-light mt-1.5 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-surface-ink-light">学习进度</span>
                      <span className="text-xs font-medium text-primary-500">
                        {progress.percent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 章节树形列表 */}
          {selectedCourse && (
            <div className="space-y-3 animate-slide-up">
              <h2 className="font-medium text-surface-ink-light text-sm uppercase tracking-wider">
                章节列表
              </h2>
              {courseChapters.length === 0 ? (
                renderChapterEmptyState()
              ) : (
                <div className="space-y-1">
                  {courseChapters.map((chapter) => {
                    const done = isChapterCompleted(chapter.id);
                    const isCurrent = selectedChapterId === chapter.id;
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => handleSelectChapter(chapter.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                          isCurrent
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-surface-ink hover:bg-primary-50/50'
                        )}
                      >
                        <span
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                            isCurrent
                              ? 'bg-primary-500 text-white'
                              : 'bg-primary-100 text-primary-600'
                          )}
                        >
                          {chapter.order}
                        </span>
                        <span
                          className={cn(
                            'flex-1 text-sm truncate',
                            done && 'line-through text-surface-ink-light'
                          )}
                        >
                          {chapter.title}
                        </span>
                        {done && (
                          <CheckCircle2 className="w-4 h-4 text-accent-success shrink-0 animate-check" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== 右侧区域 ===== */}
        <div className="flex-1 min-w-0">
          {!selectedCourse || !selectedChapter ? (
            renderEmptyState()
          ) : (
            <div className="animate-slide-up space-y-6">
              {/* 课程标题与进度 */}
              <div className="card">
                <h2 className="font-serif text-xl font-bold text-surface-ink">
                  {selectedCourse.title}
                </h2>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-surface-ink-light">
                    第 {chapterIndex + 1}/{courseChapters.length} 章 · 已完成{' '}
                    {courseProgress?.percent.toFixed(0)}%
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${courseProgress?.percent ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 当前章节资料 */}
              <div>
                <h3 className="font-serif text-lg font-semibold text-surface-ink mb-3">
                  {selectedChapter.title}
                </h3>

                {/* 资料卡片列表 */}
                <div className="space-y-3 mb-4">
                  {materials.map((mat, i) => (
                    <MaterialCard
                      key={i}
                      material={mat}
                      index={i}
                      isActive={i === activeMaterialIndex}
                      onClick={() => setActiveMaterialIndex(i)}
                    />
                  ))}
                </div>

                {/* 资料内容展示 */}
                {materials.length > 0 && materials[activeMaterialIndex] && (
                  <div className="card bg-white animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
                      {materials[activeMaterialIndex].type === 'video' ? (
                        <Video className="w-4 h-4 text-accent-coral" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary-500" />
                      )}
                      <span className="text-sm font-medium text-surface-ink">
                        {materials[activeMaterialIndex].title}
                      </span>
                      <span className="text-xs text-surface-ink-light ml-auto">
                        {activeMaterialIndex + 1} / {totalMaterials}
                      </span>
                    </div>
                    <div className="text-surface-ink leading-relaxed whitespace-pre-line text-sm">
                      {materials[activeMaterialIndex].content}
                    </div>
                  </div>
                )}

                {/* 导航与操作按钮 */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevMaterial}
                      disabled={activeMaterialIndex <= 0}
                      className="btn-ghost flex items-center gap-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一节
                    </button>
                    <button
                      onClick={handleNextMaterial}
                      disabled={activeMaterialIndex >= totalMaterials - 1}
                      className="btn-ghost flex items-center gap-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      下一节
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleToggleComplete}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-all duration-200',
                      completed
                        ? 'btn-secondary'
                        : 'btn-primary'
                    )}
                  >
                    {completed && <CheckCircle2 className="w-4 h-4" />}
                    {completed ? '已完成' : '标记为已完成'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}