import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from '@/pages/Login';
import Layout from '@/components/Layout';
import Courses from '@/pages/Courses';
import Exercises from '@/pages/Exercises';
import WrongQuestions from '@/pages/WrongQuestions';
import StudyPlan from '@/pages/StudyPlan';
import Scores from '@/pages/Scores';
import { useExamStore } from '@/store/examStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useExamStore();
  if (!currentUser) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { init, currentUser } = useExamStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          currentUser ? <Navigate to="/courses" replace /> : <Login />
        } />
        <Route path="/courses" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<Courses />} />
        </Route>
        <Route path="/exercises" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<Exercises />} />
        </Route>
        <Route path="/wrong-questions" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<WrongQuestions />} />
        </Route>
        <Route path="/study-plan" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<StudyPlan />} />
        </Route>
        <Route path="/scores" element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<Scores />} />
        </Route>
      </Routes>
    </Router>
  );
}
