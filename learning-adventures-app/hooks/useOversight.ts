import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface StudentStats {
  totalAdventures: number;
  completedAdventures: number;
  completionRate: number;
  achievements: number;
  activeGoals: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  createdAt: string;
  classroomId?: string;
  classroomName?: string;
  enrolledAt?: string;
  stats: StudentStats;
}

export interface DetailedStudentStats extends StudentStats {
  inProgressAdventures: number;
  averageScore: number;
  totalTimeSpent: number;
  completedGoals: number;
  currentLevel: number;
  totalXP: number;
  currentStreak: number;
  byCategory: Record<string, {
    total: number;
    completed: number;
    totalScore: number;
    totalTime: number;
  }>;
}

export interface DetailedStudent extends Student {
  subjects: string[];
  role: string;
  stats: DetailedStudentStats;
  progress: any[];
  achievements: any[];
  goals: any[];
  level: any;
  recentActivity: any[];
}

export function useOversight() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/oversight/students');

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents
  };
}

export function useStudentDetail(studentId: string | null) {
  const { data: session } = useSession();
  const [student, setStudent] = useState<DetailedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!session?.user?.id || !studentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/oversight/student/${studentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const data = await response.json();
      setStudent({
        ...data.student,
        stats: data.stats,
        progress: data.progress,
        achievements: data.achievements,
        goals: data.goals,
        level: data.level,
        recentActivity: data.recentActivity
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, studentId]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return {
    student,
    loading,
    error,
    refetch: fetchStudent
  };
}
