import { api } from "./client";
import type { Project, Role } from "@/types";

export const projectsApi = {
  list: () => api.get<Project[]>("/projects").then((r) => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (payload: { name: string; description?: string }) =>
    api.post<Project>("/projects", payload).then((r) => r.data),
  update: (id: string, payload: Partial<Pick<Project, "name" | "description">>) =>
    api.patch<Project>(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete<void>(`/projects/${id}`).then((r) => r.data),
  addMember: (id: string, payload: { userId: string; role: Role }) =>
    api.post<Project>(`/projects/${id}/members`, payload).then((r) => r.data),
  removeMember: (id: string, userId: string) =>
    api.delete<Project>(`/projects/${id}/members/${userId}`).then((r) => r.data),
};
