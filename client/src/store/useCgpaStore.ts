import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
          const res = await fetch('/api/user/courses', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data) && data.length > 0) {
              set({ courses: data });
            }
          }
        } catch (e) {
          // fail silently
        }
      },
      addCourse: async (course) => {
        const tempId = Date.now().toString();
        const newCourse = { ...course, id: tempId };
        set((state) => ({ courses: [...state.courses, newCourse] }));
        
        try {
          const res = await fetch('/api/user/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            set((state) => ({
              courses: state.courses.map(c => c.id === tempId ? { ...c, id: data.id } : c)
            }));
          }
        } catch (e) {}
      },
      removeCourse: async (id) => {
        set((state) => ({ courses: state.courses.filter(c => c.id !== id) }));
        try {
          await fetch(`/api/user/courses/${id}`, { method: 'DELETE', credentials: 'include' });
        } catch (e) {}
      },
      updateCourse: async (id, field, value) => {
        set((state) => ({
          courses: state.courses.map(c => c.id === id ? { ...c, [field]: value } : c)
        }));
        try {
          await fetch(`/api/user/courses/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value }),
            credentials: 'include'
          });
        } catch (e) {}
      },
      clearAll: async () => {
        set({ courses: [] });
        try {
          await fetch('/api/user/courses', { method: 'DELETE', credentials: 'include' });
        } catch (e) {}
      }
    }),
    {
      name: 'cgpa-storage',
    }
  )
);
