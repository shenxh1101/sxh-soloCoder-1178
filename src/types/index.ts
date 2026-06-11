export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  totalChapters: number;
  coverColor: string;
}

export interface ChapterMaterial {
  type: 'video' | 'document';
  title: string;
  content: string;
  url: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  materials: ChapterMaterial[];
}

export interface Question {
  id: string;
  chapterId: string;
  knowledgePoint: string;
  type: 'single' | 'multiple' | 'judge';
  content: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WrongQuestion {
  id: string;
  userId: string;
  questionId: string;
  wrongCount: number;
  note: string;
  mastered: boolean;
  lastWrongAt: string;
}

export interface StudyProgress {
  id: string;
  userId: string;
  chapterId: string;
  completed: boolean;
  completedAt: string;
}

export interface ExerciseRecord {
  id: string;
  userId: string;
  questionId: string;
  isCorrect: boolean;
  mode: 'chapter' | 'random' | 'timed';
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  targetDate: string;
  targetScore: number;
  dailyTaskCount: number;
}

export interface CheckIn {
  id: string;
  userId: string;
  checkDate: string;
  completedTasks: number;
  totalTasks: number;
}

export interface FavoriteQuestion {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  teacherId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  chapterId: string;
  chapterTitle: string;
  courseTitle: string;
  type: 'study' | 'review' | 'exercise';
  completed: boolean;
  urgency: 'high' | 'medium' | 'low';
}

export interface ExamResult {
  id: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  mode: string;
  createdAt: string;
}