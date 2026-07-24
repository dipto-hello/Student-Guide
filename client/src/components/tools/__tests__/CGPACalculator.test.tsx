import { describe, it, expect, beforeEach } from 'vitest';
import { useCgpaStore } from '../../../store/useCgpaStore';

describe('CGPA Calculator Logic', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCgpaStore.setState({
      courses: [
        { id: "1", name: "Mathematics", creditHours: 3, grade: 3.8 },
        { id: "2", name: "Programming", creditHours: 4, grade: 4.0 },
      ]
    });
  });

  it('calculates the initial GPA correctly', () => {
    const { courses } = useCgpaStore.getState();
    const totalPoints = courses.reduce((sum, c) => sum + c.grade * c.creditHours, 0);
    const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
    const gpa = (totalPoints / totalCredits).toFixed(2);
    
    expect(gpa).toBe("3.91"); // (3*3.8 + 4*4.0) / 7 = 3.9142... -> 3.91
  });

  it('adds a course and recalculates GPA', () => {
    const store = useCgpaStore.getState();
    store.addCourse({ name: "Physics", creditHours: 3, grade: 3.0 });
    
    const { courses } = useCgpaStore.getState();
    expect(courses.length).toBe(3);
    
    const totalPoints = courses.reduce((sum, c) => sum + c.grade * c.creditHours, 0);
    const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
    const gpa = (totalPoints / totalCredits).toFixed(2);
    
    expect(gpa).toBe("3.64"); // (11.4 + 16 + 9) / 10 = 36.4 / 10 = 3.64
  });

  it('removes a course correctly', () => {
    const store = useCgpaStore.getState();
    store.removeCourse("1");
    
    const { courses } = useCgpaStore.getState();
    expect(courses.length).toBe(1);
    expect(courses[0].name).toBe("Programming");
  });

  it('updates a course correctly', () => {
    const store = useCgpaStore.getState();
    store.updateCourse("2", "grade", 3.0);
    
    const { courses } = useCgpaStore.getState();
    expect(courses[1].grade).toBe(3.0);
  });
});
