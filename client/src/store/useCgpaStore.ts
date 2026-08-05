import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface Course {
  id: string;
  name: string;
  creditHours: number;
  grade: number;
}

interface CgpaStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  updateCourse: (id: string, field: keyof Course, value: any) => Promise<void>;
  clearAll: () => Promise<void>;
  syncFromServer: () => Promise<void>;
}

export const useCgpaStore = create<CgpaStore>()(
  persist(
    (set, get) => ({
      courses: [
        { id: "1", name: "Mathematics", creditHours: 3, grade: 3.8 },
        { id: "2", name: "Programming", creditHours: 4, grade: 4.0 },
      ],
      setCourses: (courses) => set({ courses }),
      syncFromServer: async () => {
        try {
          const data = await api.get<Course[]>('/api/user/courses');
          if (Array.isArray(data) && data.length > 0) {
            set({ courses: data });
          }
        } catch {
          // Guests and offline users keep the persisted local list.
        }
      },
      addCourse: async (course) => {
        // Optimistic insert with a temporary id, reconciled with the server id
        // below. On failure the row is rolled back so the local list never
        // shows a course the server does not have.
        const tempId = `temp_${Date.now()}`;
        set((state) => ({ courses: [...state.courses, { ...course, id: tempId }] }));

        try {
          const data = await api.post<{ id: string }>('/api/user/courses', course);
          set((state) => ({
            courses: state.courses.map((c) => (c.id === tempId ? { ...c, id: data.id } : c)),
          }));
        } catch {
          set((state) => ({ courses: state.courses.filter((c) => c.id !== tempId) }));
        }
      },
      removeCourse: async (id) => {
        const previous = get().courses;
        set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
        try {
          await api.delete(`/api/user/courses/${encodeURIComponent(id)}`);
        } catch {
          set({ courses: previous });
        }
      },
      updateCourse: async (id, field, value) => {
        const previous = get().courses;
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
        }));
        try {
          await api.patch(`/api/user/courses/${encodeURIComponent(id)}`, { [field]: value });
        } catch {
          set({ courses: previous });
        }
      },
      clearAll: async () => {
        const previous = get().courses;
        set({ courses: [] });
        try {
          await api.delete('/api/user/courses');
        } catch {
          set({ courses: previous });
        }
      }
    }),
    {
      name: 'cgpa-storage',
    }
  )
);
