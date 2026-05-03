/**
 * Shared domain types. Mirrors the contracts the Express + MongoDB backend
 * is expected to expose. Keep in sync with backend Mongoose schemas.
 */

export type Role = "admin" | "member";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Profile {
  /** Mongo ObjectId as string */
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface User {
  _id: string;
  email: string;
  role: Role;
  profile: Profile;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProjectMember {
  user: User;
  /** Per-project role; org-level role lives on User. */
  role: Role;
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: User | null;
  /** ISO date string */
  dueDate?: string | null;
  /** Sort order within a status column. */
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

/** Standard error envelope returned by the backend. */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
