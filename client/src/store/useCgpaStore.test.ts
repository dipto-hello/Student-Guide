import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { api } from "@/lib/api";
import { useCgpaStore } from "@/store/useCgpaStore";

vi.mock("@/lib/api");

describe("useCgpaStore", () => {
  beforeEach(() => {
    useCgpaStore.setState({ courses: [] });
    vi.clearAllMocks();
  });

  it("adds a course optimistically and reconciles with server id", async () => {
    const serverCourse = { id: "server-123", name: "Math", creditHours: 3, grade: 4.0 };
    vi.mocked(api.post).mockResolvedValueOnce({ id: "server-123" });

    const store = useCgpaStore.getState();
    await store.addCourse({ name: "Math", creditHours: 3, grade: 4.0 });

    await waitFor(() => {
      const courses = useCgpaStore.getState().courses;
      expect(courses).toHaveLength(1);
      expect(courses[0].id).toBe("server-123");
      expect(courses[0].name).toBe("Math");
    });

    expect(api.post).toHaveBeenCalledWith("/api/user/courses", {
      name: "Math",
      creditHours: 3,
      grade: 4.0,
    });
  });

  it("rolls back optimistic add on server failure", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("Network error"));

    const store = useCgpaStore.getState();
    await store.addCourse({ name: "Physics", creditHours: 4, grade: 3.5 });

    await waitFor(() => {
      expect(useCgpaStore.getState().courses).toHaveLength(0);
    });
  });

  it("removes a course and rolls back on failure", async () => {
    const initial = [{ id: "1", name: "Chemistry", creditHours: 3, grade: 3.7 }];
    useCgpaStore.setState({ courses: initial });

    vi.mocked(api.delete).mockRejectedValueOnce(new Error("Server error"));

    const store = useCgpaStore.getState();
    await store.removeCourse("1");

    await waitFor(() => {
      expect(useCgpaStore.getState().courses).toEqual(initial);
    });
  });
});
