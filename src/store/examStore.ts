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
  getCorrectRateByKnowledgePoint: () => Record<string, { total: number; correct: number; rate: number }>;

  saveStudyPlan: (targetDate: string, targetScore: number, dailyTaskCount: number) => void;
  generateDailyTasks: () => DailyTask[];
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
      set({
        wrongQuestions: storage.getWrongQuestions(user.id),
        studyProgress: storage.getStudyProgress(user.id),
        studyPlan: storage.getStudyPlan(user.id),
        checkIns: storage.getCheckIns(user.id),
        favoriteQuestionIds: storage.getFavoriteQuestions(user.id).map(f => f.questionId),
        dailyTasks: savedTasks || [],
      });
    }
  },

  login: (email: string) => {
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      storage.setCurrentUser(user);
      const today = new Date().toISOString().split('T')[0];
      const savedTasks = storage.getDailyTasks(user.id, today);
      set({
        currentUser: user,
        wrongQuestions: storage.getWrongQuestions(user.id),
        studyProgress: storage.getStudyProgress(user.id),
        studyPlan: storage.getStudyPlan(user.id),
        checkIns: storage.getCheckIns(user.id),
        favoriteQuestionIds: storage.getFavoriteQuestions(user.id).map(f => f.questionId),
        announcements: storage.getAnnouncements(),
        dailyTasks: savedTasks || [],
      });
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

  getCorrectRateByKnowledgePoint: () => {
    const { currentUser, questions } = get();
    if (!currentUser) return {};
    const records = storage.getExerciseRecords(currentUser.id);

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
    const tasks = get().generateDailyTasks();
    set({ dailyTasks: tasks });
  },

  generateDailyTasks: () => {
    const { currentUser, chapters, studyProgress, courses, studyPlan } = get();
    if (!currentUser || !studyPlan) return [];

    const today = new Date().toISOString().split('T')[0];
    const savedTasks = storage.getDailyTasks(currentUser.id, today);
    if (savedTasks && savedTasks.length > 0) {
      return savedTasks;
    }

    const kpRates = get().getCorrectRateByKnowledgePoint();
    const weakKp: string[] = [];
    Object.entries(kpRates).forEach(([kp, data]) => {
      if (data.rate < 60) {
        for (let i = 0; i < 2; i++) weakKp.push(kp);
      } else if (data.rate < 70) {
        weakKp.push(kp);
      }
    });

    const tasks: DailyTask[] = [];
    let taskId = 1;

    courses.forEach(course => {
      const courseChapters = chapters.filter(c => c.courseId === course.id).sort((a, b) => a.order - b.order);
      courseChapters.forEach(chapter => {
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
        } else {
          get().questions.forEach(q => {
            if (q.chapterId === chapter.id) {
              if (weakKp.includes(q.knowledgePoint)) {
                tasks.push({
                  id: `task-${taskId++}`,
                  chapterId: chapter.id,
                  chapterTitle: chapter.title,
                  courseTitle: course.title,
                  type: 'exercise',
                  completed: false,
                  urgency: q.knowledgePoint in kpRates && kpRates[q.knowledgePoint].rate < 40 ? 'high' : 'medium',
                });
              }
            }
          });
        }
      });
    });

    tasks.sort((a, b) => {
      const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    const selectedTasks = tasks.slice(0, studyPlan.dailyTaskCount);
    storage.saveDailyTasks(currentUser.id, today, selectedTasks);
    return selectedTasks;
  },

  toggleTaskCompleted: (taskId: string) => {
    const { dailyTasks, currentUser } = get();
    const newTasks = dailyTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    set({ dailyTasks: newTasks });
    if (currentUser) {
      const today = new Date().toISOString().split('T')[0];
      storage.saveDailyTasks(currentUser.id, today, newTasks);
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