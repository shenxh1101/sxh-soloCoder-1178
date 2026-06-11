import { create } from 'zustand';
import type {
  User,
  Course,
  Chapter,
  Question,
  WrongQuestion,
  StudyProgress,
  ExerciseRecord,
  StudyPlan,
  CheckIn,
  Announcement,
  DailyTask,
  ExamResult,
} from '@/types';
import * as storage from '@/data/storage';
import { mockChapters } from '@/data/mockData';

interface ExamStore {
  currentUser: User | null;
  courses: Course[];
  chapters: Chapter[];
  questions: Question[];
  wrongQuestions: WrongQuestion[];
  studyProgress: StudyProgress[];
  studyPlan: StudyPlan | null;
  checkIns: CheckIn[];
  announcements: Announcement[];
  favoriteQuestionIds: string[];
  dailyTasks: DailyTask[];
  weeklyTasks: Record<string, DailyTask[]>;

  init: () => void;
  login: (email: string) => User | null;
  logout: () => void;
  register: (name: string, email: string, role: 'student' | 'teacher') => User;

  getCoursesByUser: () => Course[];
  getChaptersByCourse: (courseId: string) => Chapter[];
  isChapterCompleted: (chapterId: string) => boolean;
  getCourseProgress: (courseId: string) => { completed: number; total: number; percent: number };
  markChapterCompleted: (chapterId: string, completed: boolean) => void;

  getWrongQuestions: () => WrongQuestion[];
  addWrongQuestion: (questionId: string) => void;
  markAsMastered: (wrongQuestionId: string) => void;
  updateWrongNote: (wrongQuestionId: string, note: string) => void;
  getWrongQuestionsByKnowledgePoint: (kp: string) => WrongQuestion[];
  getAllKnowledgePoints: () => string[];

  toggleFavorite: (questionId: string) => boolean;
  isFavorite: (questionId: string) => boolean;
  getFavoriteQuestions: () => Question[];

  saveExerciseRecord: (questionId: string, isCorrect: boolean, mode: 'chapter' | 'random' | 'timed') => void;
  getExerciseRecordsCount: () => { total: number; correct: number };
  getPracticeRecordsCount: () => { total: number; correct: number };
  getCorrectRateByKnowledgePoint: () => Record<string, { total: number; correct: number; rate: number }>;
  saveExamSession: (totalQuestions: number, correctCount: number, timeUsed: number) => void;
  getExamSessions: () => ExamResult[];

  saveStudyPlan: (targetDate: string, targetScore: number, dailyTaskCount: number) => void;
  generateDailyTasks: () => DailyTask[];
  generateWeeklyTasks: () => void;
  ensureDailyTasksGenerated: () => void;
  toggleTaskCompleted: (taskId: string) => void;
  saveDailyCheckIn: () => void;
  hasCheckedInToday: () => boolean;
  getContinuousCheckInDays: () => number;

  addAnnouncement: (title: string, content: string) => void;
  getAnnouncements: () => Announcement[];

  getTotalProgress: () => number;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  currentUser: null,
  courses: [],
  chapters: [],
  questions: [],
  wrongQuestions: [],
  studyProgress: [],
  studyPlan: null,
  checkIns: [],
  announcements: [],
  favoriteQuestionIds: [],
  dailyTasks: [],
  weeklyTasks: {},

  init: () => {
    storage.initStorageIfEmpty();
    const user = storage.getCurrentUser();
    set({
      currentUser: user,
      courses: storage.getCourses(),
      chapters: storage.getChapters(),
      questions: storage.getQuestions(),
      announcements: storage.getAnnouncements(),
    });
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const savedTasks = storage.getDailyTasks(user.id, today);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weekly: Record<string, DailyTask[]> = {};
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const tasks = storage.getDailyTasks(user.id, dateStr);
        if (tasks) {
          weekly[dateStr] = tasks;
        }
      }

      set({
        wrongQuestions: storage.getWrongQuestions(user.id),
        studyProgress: storage.getStudyProgress(user.id),
        studyPlan: storage.getStudyPlan(user.id),
        checkIns: storage.getCheckIns(user.id),
        favoriteQuestionIds: storage.getFavoriteQuestions(user.id).map(f => f.questionId),
        dailyTasks: savedTasks || [],
        weeklyTasks: weekly,
      });

      const hasAnyWeeklyTask = Object.values(weekly).some(arr => arr.length > 0);
      if (!hasAnyWeeklyTask) {
        const plan = storage.getStudyPlan(user.id);
        if (plan) {
          get().generateWeeklyTasks();
        }
      } else if (!savedTasks || savedTasks.length === 0) {
        const plan = storage.getStudyPlan(user.id);
        if (plan) {
          const tasks = get().generateDailyTasks();
          set({ dailyTasks: tasks });
        }
      }
    }
  },

  login: (email: string) => {
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      storage.setCurrentUser(user);
      const today = new Date().toISOString().split('T')[0];
      const savedTasks = storage.getDailyTasks(user.id, today);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weekly: Record<string, DailyTask[]> = {};
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const tasks = storage.getDailyTasks(user.id, dateStr);
        if (tasks) {
          weekly[dateStr] = tasks;
        }
      }

      set({
        currentUser: user,
        wrongQuestions: storage.getWrongQuestions(user.id),
        studyProgress: storage.getStudyProgress(user.id),
        studyPlan: storage.getStudyPlan(user.id),
        checkIns: storage.getCheckIns(user.id),
        favoriteQuestionIds: storage.getFavoriteQuestions(user.id).map(f => f.questionId),
        announcements: storage.getAnnouncements(),
        dailyTasks: savedTasks || [],
        weeklyTasks: weekly,
      });

      const hasAnyWeeklyTask = Object.values(weekly).some(arr => arr.length > 0);
      if (!hasAnyWeeklyTask) {
        const plan = storage.getStudyPlan(user.id);
        if (plan) {
          get().generateWeeklyTasks();
        }
      } else if (!savedTasks || savedTasks.length === 0) {
        const plan = storage.getStudyPlan(user.id);
        if (plan) {
          const tasks = get().generateDailyTasks();
          set({ dailyTasks: tasks });
        }
      }
      return user;
    }
    return null;
  },

  logout: () => {
    storage.setCurrentUser(null);
    set({
      currentUser: null,
      wrongQuestions: [],
      studyProgress: [],
      studyPlan: null,
      checkIns: [],
      favoriteQuestionIds: [],
      dailyTasks: [],
      weeklyTasks: {},
    });
  },

  register: (name: string, email: string, role: 'student' | 'teacher') => {
    const users = storage.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('exam_app_users', JSON.stringify(users));
    storage.setCurrentUser(newUser);
    set({
      currentUser: newUser,
    });
    return newUser;
  },

  getCoursesByUser: () => {
    return get().courses;
  },

  getChaptersByCourse: (courseId: string) => {
    return get().chapters.filter(c => c.courseId === courseId).sort((a, b) => a.order - b.order);
  },

  isChapterCompleted: (chapterId: string) => {
    return get().studyProgress.some(sp => sp.chapterId === chapterId && sp.completed);
  },

  getCourseProgress: (courseId: string) => {
    const { chapters, isChapterCompleted } = get();
    const courseChapters = chapters.filter(c => c.courseId === courseId);
    const completed = courseChapters.filter(c => isChapterCompleted(c.id)).length;
    return {
      completed,
      total: courseChapters.length,
      percent: courseChapters.length > 0 ? (completed / courseChapters.length) * 100 : 0,
    };
  },

  markChapterCompleted: (chapterId: string, completed: boolean) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const progress: StudyProgress = {
      id: `${currentUser.id}-${chapterId}`,
      userId: currentUser.id,
      chapterId,
      completed,
      completedAt: new Date().toISOString(),
    };

    storage.markChapterCompleted(progress);
    const newProgress = [...get().studyProgress.filter(p => !(p.userId === currentUser.id && p.chapterId === chapterId)), progress];
    set({ studyProgress: newProgress });
  },

  getWrongQuestions: () => {
    return get().wrongQuestions;
  },

  addWrongQuestion: (questionId: string) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const wrongQ: WrongQuestion = {
      id: `${currentUser.id}-${questionId}-${Date.now()}`,
      userId: currentUser.id,
      questionId,
      wrongCount: 1,
      note: '',
      mastered: false,
      lastWrongAt: new Date().toISOString(),
    };

    storage.addWrongQuestion(wrongQ);
    set({ wrongQuestions: storage.getWrongQuestions(currentUser.id) });
  },

  markAsMastered: (wrongQuestionId: string) => {
    storage.markWrongQuestionMastered(wrongQuestionId);
    const { currentUser } = get();
    if (currentUser) {
      set({ wrongQuestions: storage.getWrongQuestions(currentUser.id) });
    }
  },

  updateWrongNote: (wrongQuestionId: string, note: string) => {
    storage.updateWrongQuestionNote(wrongQuestionId, note);
    const { currentUser } = get();
    if (currentUser) {
      set({ wrongQuestions: storage.getWrongQuestions(currentUser.id) });
    }
  },

  getWrongQuestionsByKnowledgePoint: (kp: string) => {
    const { wrongQuestions } = get();
    const { questions } = get();
    return wrongQuestions.filter(wq => {
      const q = questions.find(question => question.id === wq.questionId);
      return q && q.knowledgePoint === kp;
    });
  },

  getAllKnowledgePoints: () => {
    const { wrongQuestions, questions } = get();
    const points = new Set<string>();
    wrongQuestions.forEach(wq => {
      const q = questions.find(q => q.id === wq.questionId);
      if (q) {
        points.add(q.knowledgePoint);
      }
    });
    return Array.from(points).sort();
  },

  toggleFavorite: (questionId: string) => {
    const { currentUser, favoriteQuestionIds } = get();
    if (!currentUser) return false;

    const isFav = favoriteQuestionIds.includes(questionId);
    const result = storage.toggleFavorite({
      id: `${currentUser.id}-${questionId}`,
      userId: currentUser.id,
      questionId,
      createdAt: new Date().toISOString(),
    });

    let newFavs;
    if (isFav) {
      newFavs = favoriteQuestionIds.filter(id => id !== questionId);
    } else {
      newFavs = [...favoriteQuestionIds, questionId];
    }
    set({ favoriteQuestionIds: newFavs });
    return result;
  },

  isFavorite: (questionId: string) => {
    return get().favoriteQuestionIds.includes(questionId);
  },

  getFavoriteQuestions: () => {
    const { favoriteQuestionIds, questions } = get();
    return questions.filter(q => favoriteQuestionIds.includes(q.id));
  },

  saveExerciseRecord: (questionId: string, isCorrect: boolean, mode: 'chapter' | 'random' | 'timed') => {
    const { currentUser } = get();
    if (!currentUser) return;

    const record: ExerciseRecord = {
      id: `record-${Date.now()}`,
      userId: currentUser.id,
      questionId,
      isCorrect,
      mode,
      createdAt: new Date().toISOString(),
    };

    storage.saveExerciseRecord(record);

    if (!isCorrect) {
      const wrongQ: WrongQuestion = {
        id: `wq-${currentUser.id}-${questionId}`,
        userId: currentUser.id,
        questionId,
        wrongCount: 1,
        note: '',
        mastered: false,
        lastWrongAt: new Date().toISOString(),
      };
      storage.addWrongQuestion(wrongQ);
      set({ wrongQuestions: storage.getWrongQuestions(currentUser.id) });
    }
  },

  getExerciseRecordsCount: () => {
    const { currentUser } = get();
    if (!currentUser) return { total: 0, correct: 0 };
    const records = storage.getExerciseRecords(currentUser.id);
    const correct = records.filter(r => r.isCorrect).length;
    return { total: records.length, correct };
  },

  getPracticeRecordsCount: () => {
    const { currentUser } = get();
    if (!currentUser) return { total: 0, correct: 0 };
    const allRecords = storage.getExerciseRecords(currentUser.id);
    const records = allRecords.filter(r => r.mode !== 'timed');
    const correct = records.filter(r => r.isCorrect).length;
    return { total: records.length, correct };
  },

  getCorrectRateByKnowledgePoint: () => {
    const { currentUser, questions } = get();
    if (!currentUser) return {};
    const allRecords = storage.getExerciseRecords(currentUser.id);
    const records = allRecords.filter(r => r.mode !== 'timed');

    const result: Record<string, { total: number; correct: number; rate: number }> = {};

    records.forEach(record => {
      const q = questions.find(question => question.id === record.questionId);
      if (!q) return;
      const kp = q.knowledgePoint;
      if (!result[kp]) {
        result[kp] = { total: 0, correct: 0, rate: 0 };
      }
      result[kp].total += 1;
      if (record.isCorrect) {
        result[kp].correct += 1;
      }
    });

    Object.keys(result).forEach(kp => {
      const data = result[kp];
      data.rate = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    });

    return result;
  },

  saveExamSession: (totalQuestions: number, correctCount: number, timeUsed: number) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const result: ExamResult = {
      id: `exam-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      score: Math.round((correctCount / totalQuestions) * 100),
      totalQuestions,
      correctCount,
      mode: '模拟考试',
      createdAt: new Date().toISOString(),
    };

    storage.saveExamResult(result);
  },

  getExamSessions: () => {
    const { currentUser } = get();
    if (!currentUser) return [];
    return storage.getExamResults(currentUser.id);
  },

  saveStudyPlan: (targetDate: string, targetScore: number, dailyTaskCount: number) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const plan: StudyPlan = {
      id: `plan-${currentUser.id}`,
      userId: currentUser.id,
      targetDate,
      targetScore,
      dailyTaskCount,
    };

    storage.saveStudyPlan(plan);
    set({ studyPlan: plan });
    get().generateWeeklyTasks();
    const todayStr = new Date().toISOString().split('T')[0];
    set({ dailyTasks: get().weeklyTasks[todayStr] || [] });
  },

  ensureDailyTasksGenerated: () => {
    const { currentUser, weeklyTasks, studyPlan } = get();
    if (!currentUser || !studyPlan) return;
    const hasAnyWeeklyTask = Object.values(weeklyTasks).some(arr => arr.length > 0);
    if (!hasAnyWeeklyTask) {
      get().generateWeeklyTasks();
    }
    const today = new Date().toISOString().split('T')[0];
    if (!weeklyTasks[today] || weeklyTasks[today].length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      set({ dailyTasks: get().weeklyTasks[todayStr] || [] });
    }
  },

  generateDailyTasks: () => {
    const { currentUser, chapters, studyProgress, courses, studyPlan } = get();
    if (!currentUser || !studyPlan) return [];

    const today = new Date().toISOString().split('T')[0];
    const savedTasks = storage.getDailyTasks(currentUser.id, today);
    if (savedTasks && savedTasks.length > 0) {
      return savedTasks;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayTasks = storage.getDailyTasks(currentUser.id, yesterdayStr);

    const daysUntilExam = Math.ceil((new Date(studyPlan.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const adjustedDailyCount = daysUntilExam <= 14
      ? Math.min(studyPlan.dailyTaskCount + 2, 15)
      : studyPlan.dailyTaskCount;

    const kpRates = get().getCorrectRateByKnowledgePoint();
    const weakKp: { kp: string; rate: number }[] = [];
    Object.entries(kpRates).forEach(([kp, data]) => {
      if (data.rate < 70) {
        weakKp.push({ kp, rate: data.rate });
      }
    });
    weakKp.sort((a, b) => a.rate - b.rate);

    const tasks: DailyTask[] = [];
    let taskId = 1;

    if (yesterdayTasks) {
      yesterdayTasks.forEach(yt => {
        if (!yt.completed) {
          tasks.push({
            id: `task-${taskId++}`,
            chapterId: yt.chapterId,
            chapterTitle: yt.chapterTitle,
            courseTitle: yt.courseTitle,
            type: yt.type,
            completed: false,
            urgency: yt.urgency === 'high' ? 'high' : 'medium',
          });
        }
      });
    }

    const notYetCompletedCount = tasks.length;

    courses.forEach(course => {
      const courseChapters = chapters.filter(c => c.courseId === course.id).sort((a, b) => a.order - b.order);
      courseChapters.forEach(chapter => {
        const taskExists = tasks.some(t => t.chapterId === chapter.id);
        if (taskExists) return;

        const isCompleted = studyProgress.some(sp => sp.chapterId === chapter.id && sp.completed);
        if (!isCompleted) {
          tasks.push({
            id: `task-${taskId++}`,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            courseTitle: course.title,
            type: 'study',
            completed: false,
            urgency: 'medium',
          });
        }
      });
    });

    const reviewStartIndex = tasks.length;
    weakKp.forEach(({ kp }) => {
      const relatedQuestions = get().questions.filter(q => q.knowledgePoint === kp);
      if (relatedQuestions.length > 0) {
        const chId = relatedQuestions[0].chapterId;
        const chapter = get().chapters.find(c => c.id === chId);
        if (chapter && !tasks.some(t => t.chapterId === chId && t.type !== 'study')) {
          tasks.push({
            id: `task-${taskId++}`,
            chapterId: chId,
            chapterTitle: chapter.title,
            courseTitle: courses.find(c => c.id === chapter.courseId)?.title || '',
            type: 'exercise',
            completed: false,
            urgency: kpRates[kp] && kpRates[kp].rate < 40 ? 'high' : 'medium',
          });
        }
      }
    });

    tasks.sort((a, b) => {
      const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    const selectedTasks = tasks.slice(0, adjustedDailyCount);
    storage.saveDailyTasks(currentUser.id, today, selectedTasks);
    return selectedTasks;
  },

  generateWeeklyTasks: () => {
    const { currentUser, chapters, studyProgress, courses, studyPlan } = get();
    if (!currentUser || !studyPlan) return;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const allTasks: Record<string, DailyTask[]> = {};

    const kpRates = get().getCorrectRateByKnowledgePoint();
    const weakKp: { kp: string; rate: number }[] = [];
    Object.entries(kpRates).forEach(([kp, data]) => {
      if (data.rate < 70) weakKp.push({ kp, rate: data.rate });
    });
    weakKp.sort((a, b) => a.rate - b.rate);

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      const saved = storage.getDailyTasks(currentUser.id, dateStr);
      if (saved && saved.length > 0) {
        allTasks[dateStr] = saved;
        continue;
      }

      const tasks: DailyTask[] = [];
      let taskId = 1;

      if (day === 0) {
        const lastWeekTasks: DailyTask[] = [];
        for (let d = 1; d <= 7; d++) {
          const prev = new Date(weekStart);
          prev.setDate(prev.getDate() - d);
          const s = storage.getDailyTasks(currentUser.id, prev.toISOString().split('T')[0]);
          if (s) {
            s.forEach(t => {
              if (!t.completed) lastWeekTasks.push(t);
            });
          }
        }
        lastWeekTasks.forEach(yt => {
          tasks.push({
            id: `task-${taskId++}`,
            chapterId: yt.chapterId,
            chapterTitle: yt.chapterTitle,
            courseTitle: yt.courseTitle,
            type: yt.type,
            completed: false,
            urgency: 'high',
          });
        });
      } else {
        const prevDate = new Date(weekStart);
        prevDate.setDate(prevDate.getDate() + day - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        const prevAll = allTasks[prevDateStr] || [];
        prevAll.forEach(pt => {
          if (!pt.completed) {
            tasks.push({
              ...pt,
              id: `task-${taskId++}`,
              urgency: 'high',
            });
          }
        });
      }

      const daysUntilExam = Math.ceil((new Date(studyPlan.targetDate).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const adjustedCount = daysUntilExam <= 14
        ? Math.min(studyPlan.dailyTaskCount + 2, 15)
        : studyPlan.dailyTaskCount;

      const newTasksNeeded = adjustedCount - tasks.length;
      if (newTasksNeeded > 0) {
        courses.forEach(course => {
          const courseChapters = chapters.filter(c => c.courseId === course.id).sort((a, b) => a.order - b.order);
          courseChapters.forEach(chapter => {
            if (tasks.length >= adjustedCount) return;
            const taskExists = tasks.some(t => t.chapterId === chapter.id && t.type === 'study');
            if (taskExists) return;
            const isCompleted = studyProgress.some(sp => sp.chapterId === chapter.id && sp.completed);
            if (!isCompleted) {
              tasks.push({
                id: `task-${taskId++}`,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                courseTitle: course.title,
                type: 'study',
                completed: false,
                urgency: 'medium',
              });
            }
          });
        });
      }

      weakKp.forEach(({ kp, rate }) => {
        if (tasks.length >= adjustedCount) return;
        const relatedQ = get().questions.find(q => q.knowledgePoint === kp);
        if (relatedQ) {
          const ch = get().chapters.find(c => c.id === relatedQ.chapterId);
          if (ch && !tasks.some(t => t.chapterId === ch.id && t.type !== 'study')) {
            tasks.push({
              id: `task-${taskId++}`,
              chapterId: ch.id,
              chapterTitle: ch.title,
              courseTitle: courses.find(c => c.id === ch.courseId)?.title || '',
              type: 'exercise',
              completed: false,
              urgency: rate < 40 ? 'high' : 'medium',
            });
          }
        }
      });

      tasks.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 } as Record<string, number>;
        return order[a.urgency] - order[b.urgency];
      });

      storage.saveDailyTasks(currentUser.id, dateStr, tasks);
      allTasks[dateStr] = tasks;
    }

    set({ weeklyTasks: allTasks });
  },

  toggleTaskCompleted: (taskId: string) => {
    const { dailyTasks, currentUser, weeklyTasks } = get();
    const newTasks = dailyTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    set({ dailyTasks: newTasks });
    if (currentUser) {
      const today = new Date().toISOString().split('T')[0];
      storage.saveDailyTasks(currentUser.id, today, newTasks);
      set({ weeklyTasks: { ...weeklyTasks, [today]: newTasks } });
    }
  },

  saveDailyCheckIn: () => {
    const { currentUser, dailyTasks } = get();
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    const completed = dailyTasks.filter(t => t.completed).length;
    const total = dailyTasks.length;

    const checkIn: CheckIn = {
      id: `checkin-${currentUser.id}-${today}`,
      userId: currentUser.id,
      checkDate: today,
      completedTasks: completed,
      totalTasks: total,
    };

    storage.saveCheckIn(checkIn);

    const newCheckIns = [...get().checkIns.filter(c => !(c.userId === currentUser.id && c.checkDate === today)), checkIn];
    set({ checkIns: newCheckIns });
  },

  hasCheckedInToday: () => {
    const { currentUser, checkIns } = get();
    if (!currentUser) return false;
    const today = new Date().toISOString().split('T')[0];
    return checkIns.some(c => c.checkDate === today);
  },

  getContinuousCheckInDays: () => {
    const { currentUser, checkIns } = get();
    if (!currentUser) return 0;
    let count = 0;
    const today = new Date();
    const sortedCheckIns = checkIns.sort((a, b) => a.checkDate.localeCompare(b.checkDate));

    for (let i = sortedCheckIns.length - 1; i >= 0; i--) {
      const checkDate = new Date(sortedCheckIns[i].checkDate);
      const diff = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === count) {
        count++;
      } else if (diff < count) {
        continue;
      } else {
        break;
      }
    }
    return count;
  },

  addAnnouncement: (title: string, content: string) => {
    const { currentUser } = get();
    if (!currentUser || currentUser.role !== 'teacher') return;

    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      teacherId: currentUser.id,
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    storage.addAnnouncement(announcement);
    set({ announcements: storage.getAnnouncements() });
  },

  getAnnouncements: () => {
    return get().announcements;
  },

  getTotalProgress: () => {
    const { chapters, studyProgress } = get();
    const completedCount = studyProgress.filter(sp => sp.completed).length;
    return chapters.length > 0 ? (completedCount / chapters.length) * 100 : 0;
  },
}));