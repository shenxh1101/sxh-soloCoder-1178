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
  FavoriteQuestion,
  Announcement,
} from '@/types';
import {
  mockUsers,
  mockCourses,
  mockChapters,
  mockQuestions,
  mockAnnouncements,
} from './mockData';

const STORAGE_KEYS = {
  users: 'exam_app_users',
  currentUser: 'exam_app_current_user',
  courses: 'exam_app_courses',
  chapters: 'exam_app_chapters',
  questions: 'exam_app_questions',
  wrongQuestions: 'exam_app_wrong_questions',
  studyProgress: 'exam_app_study_progress',
  exerciseRecords: 'exam_app_exercise_records',
  studyPlans: 'exam_app_study_plans',
  checkIns: 'exam_app_checkins',
  favorites: 'exam_app_favorites',
  announcements: 'exam_app_announcements',
};

export function initStorageIfEmpty(): void {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
    localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(mockCourses));
    localStorage.setItem(STORAGE_KEYS.chapters, JSON.stringify(mockChapters));
    localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(mockQuestions));
    localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(mockAnnouncements));
    localStorage.setItem(STORAGE_KEYS.wrongQuestions, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.studyProgress, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.exerciseRecords, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.studyPlans, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([]));
  }
}

function loadData<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getUsers(): User[] {
  return loadData<User>(STORAGE_KEYS.users);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.currentUser);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

export function getCourses(): Course[] {
  return loadData<Course>(STORAGE_KEYS.courses);
}

export function getChapters(): Chapter[] {
  return loadData<Chapter>(STORAGE_KEYS.chapters);
}

export function getQuestions(): Question[] {
  return loadData<Question>(STORAGE_KEYS.questions);
}

export function getWrongQuestions(userId: string): WrongQuestion[] {
  return loadData<WrongQuestion>(STORAGE_KEYS.wrongQuestions)
    .filter(wq => wq.userId === userId && !wq.mastered);
}

export function addWrongQuestion(wrongQuestion: WrongQuestion): void {
  const list = loadData<WrongQuestion>(STORAGE_KEYS.wrongQuestions);
  const existing = list.find(wq => wq.userId === wrongQuestion.userId && wq.questionId === wrongQuestion.questionId);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastWrongAt = wrongQuestion.lastWrongAt;
    existing.mastered = false;
  } else {
    list.push(wrongQuestion);
  }
  saveData(STORAGE_KEYS.wrongQuestions, list);
}

export function markWrongQuestionMastered(id: string): void {
  const list = loadData<WrongQuestion>(STORAGE_KEYS.wrongQuestions);
  const item = list.find(wq => wq.id === id);
  if (item) {
    item.mastered = true;
    saveData(STORAGE_KEYS.wrongQuestions, list);
  }
}

export function updateWrongQuestionNote(id: string, note: string): void {
  const list = loadData<WrongQuestion>(STORAGE_KEYS.wrongQuestions);
  const item = list.find(wq => wq.id === id);
  if (item) {
    item.note = note;
    saveData(STORAGE_KEYS.wrongQuestions, list);
  }
}

export function getStudyProgress(userId: string): StudyProgress[] {
  return loadData<StudyProgress>(STORAGE_KEYS.studyProgress)
    .filter(sp => sp.userId === userId);
}

export function markChapterCompleted(progress: StudyProgress): void {
  const list = loadData<StudyProgress>(STORAGE_KEYS.studyProgress);
  const existing = list.find(sp => sp.userId === progress.userId && sp.chapterId === progress.chapterId);
  if (existing) {
    existing.completed = progress.completed;
    existing.completedAt = progress.completedAt;
  } else {
    list.push(progress);
  }
  saveData(STORAGE_KEYS.studyProgress, list);
}

export function saveExerciseRecord(record: ExerciseRecord): void {
  const list = loadData<ExerciseRecord>(STORAGE_KEYS.exerciseRecords);
  list.push(record);
  saveData(STORAGE_KEYS.exerciseRecords, list);
}

export function getExerciseRecords(userId: string): ExerciseRecord[] {
  return loadData<ExerciseRecord>(STORAGE_KEYS.exerciseRecords)
    .filter(r => r.userId === userId);
}

export function getStudyPlan(userId: string): StudyPlan | null {
  const plans = loadData<StudyPlan>(STORAGE_KEYS.studyPlans)
    .filter(p => p.userId === userId);
  return plans.length > 0 ? plans[0] : null;
}

export function saveStudyPlan(plan: StudyPlan): void {
  const plans = loadData<StudyPlan>(STORAGE_KEYS.studyPlans);
  const existing = plans.find(p => p.userId === plan.userId);
  if (existing) {
    Object.assign(existing, plan);
  } else {
    plans.push(plan);
  }
  saveData(STORAGE_KEYS.studyPlans, plans);
}

export function getCheckIns(userId: string): CheckIn[] {
  return loadData<CheckIn>(STORAGE_KEYS.checkIns)
    .filter(c => c.userId === userId);
}

export function saveCheckIn(checkIn: CheckIn): void {
  const list = loadData<CheckIn>(STORAGE_KEYS.checkIns);
  const existing = list.find(c => c.userId === checkIn.userId && c.checkDate === checkIn.checkDate);
  if (existing) {
    existing.completedTasks = checkIn.completedTasks;
    existing.totalTasks = checkIn.totalTasks;
  } else {
    list.push(checkIn);
  }
  saveData(STORAGE_KEYS.checkIns, list);
}

export function isQuestionFavorite(userId: string, questionId: string): boolean {
  const favorites = loadData<FavoriteQuestion>(STORAGE_KEYS.favorites)
    .filter(f => f.userId === userId);
  return favorites.some(f => f.questionId === questionId);
}

export function getFavoriteQuestions(userId: string): FavoriteQuestion[] {
  return loadData<FavoriteQuestion>(STORAGE_KEYS.favorites)
    .filter(f => f.userId === userId);
}

export function toggleFavorite(favorite: FavoriteQuestion): boolean {
  const favorites = loadData<FavoriteQuestion>(STORAGE_KEYS.favorites);
  const existingIndex = favorites.findIndex(
    f => f.userId === favorite.userId && f.questionId === favorite.questionId
  );
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    saveData(STORAGE_KEYS.favorites, favorites);
    return false;
  } else {
    favorites.push(favorite);
    saveData(STORAGE_KEYS.favorites, favorites);
    return true;
  }
}

export function getAnnouncements(): Announcement[] {
  return loadData<Announcement>(STORAGE_KEYS.announcements)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addAnnouncement(announcement: Announcement): void {
  const list = loadData<Announcement>(STORAGE_KEYS.announcements);
  list.push(announcement);
  saveData(STORAGE_KEYS.announcements, list);
}

export function getAllQuestionsByChapter(chapterId: string): Question[] {
  return getQuestions().filter(q => q.chapterId === chapterId);
}

export function getChapterById(id: string): Chapter | null {
  return getChapters().find(c => c.id === id) || null;
}

export function getCourseById(id: string): Course | null {
  return getCourses().find(c => c.id === id) || null;
}

export function getQuestionById(id: string): Question | null {
  return getQuestions().find(q => q.id === id) || null;
}

export function getWrongQuestionByQuestionId(userId: string, questionId: string): WrongQuestion | null {
  return loadData<WrongQuestion>(STORAGE_KEYS.wrongQuestions)
    .find(wq => wq.userId === userId && wq.questionId === questionId && !wq.mastered) || null;
}

export function getAllKnowledgePoints(userId: string): string[] {
  const wrongQs = getWrongQuestions(userId);
  const points = new Set<string>();
  wrongQs.forEach(wq => {
    const q = getQuestionById(wq.questionId);
    if (q) {
      points.add(q.knowledgePoint);
    }
  });
  return Array.from(points).sort();
}