import { api } from "./client";
import type { Task, TaskStats, TaskStatus } from "@/types";

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  assigneeId?: string;
  search?: string;
}

export const tasksApi = {
  list: (filters: TaskFilters = {}) =>
    api.get<Task[]>("/tasks", { params: filters }).then((r) => r.data),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (payload: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
    status?: TaskStatus;
  }) => api.post<Task>("/tasks", payload).then((r) => r.data),
  update: (
    id: string,
    payload: Partial<
      Pick<Task, "title" | "description" | "status" | "dueDate" | "order"> & {
        assigneeId?: string | null;
      }
    >
  ) => api.patch<Task>(`/tasks/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete<void>(`/tasks/${id}`).then((r) => r.data),
  stats: (projectId?: string) =>
    api
      .get<TaskStats>("/tasks/stats", { params: { projectId } })
      .then((r) => r.data),
};
