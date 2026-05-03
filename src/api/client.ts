/**
 * Axios instance shared by every API module.
 *
 * - Base URL comes from VITE_API_URL (see .env.example).
 * - Request interceptor injects the JWT from authStorage.
 * - Response interceptor normalizes errors and auto-clears the session on 401.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, type AxiosInstance } from "axios";
import { toast } from "sonner";
import { authStorage } from "@/lib/auth-storage";
import type { ApiError, User, Project, Task, AuthResponse, Role } from "@/types";

// Use mock mode by default for frontend-only demo
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = authStorage.get();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    if (status === 401) {
      authStorage.clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        toast.error("Session expired. Please sign in again.");
        window.location.assign("/login");
      }
    } else if (status && status >= 500) {
      toast.error(apiMessage ?? "Something went wrong on the server.");
    } else if (apiMessage && status !== 404) {
      toast.error(apiMessage);
    } else if (error.code === "ERR_NETWORK") {
      toast.error("Network error. Is the API running?");
    }

    return Promise.reject(error);
  }
);

// ==================== Mock Data & Helpers ====================

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Access localStorage mock store
function getMockUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem("tf_users") || "[]");
  } catch {
    return [];
  }
}

function setMockUsers(users: User[]) {
  localStorage.setItem("tf_users", JSON.stringify(users));
}

function getMockProjects(): Project[] {
  try {
    return JSON.parse(localStorage.getItem("tf_projects") || "[]");
  } catch {
    return [];
  }
}

function setMockProjects(projects: Project[]) {
  localStorage.setItem("tf_projects", JSON.stringify(projects));
}

function getMockTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem("tf_tasks") || "[]");
  } catch {
    return [];
  }
}

function setMockTasks(tasks: Task[]) {
  localStorage.setItem("tf_tasks", JSON.stringify(tasks));
}

// ==================== Mock API Implementation ====================

if (USE_MOCK) {
  // Override adapters to use localStorage
  (api as any).__originalGet = api.get;
  (api as any).__originalPost = api.post;
  (api as any).__originalPatch = api.patch;
  (api as any).__originalDelete = api.delete;

  api.get = async <T>(url: string, config?: any): Promise<{ data: T }> => {
    await delay(300 + Math.random() * 200); // Simulate network latency

    // Auth endpoints
    if (url === "/auth/me") {
      const token = authStorage.get();
      if (!token) throw new AxiosError("Unauthorized", "401", undefined, undefined, { status: 401 } as any);
      const users = getMockUsers();
      const userId = token.replace("mock-jwt-", "").split("-")[0];
      const user = users.find((u) => u._id === userId);
      if (!user) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
      return { data: user as any };
    }

    // Projects endpoints
    if (url === "/projects") {
      return { data: getMockProjects() as any };
    }
    const projectMatch = url.match(/^\/projects\/(.+)$/);
    if (projectMatch && !url.includes("/members")) {
      const project = getMockProjects().find((p) => p._id === projectMatch[1]);
      if (!project) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
      return { data: project as any };
    }

    // Project members endpoints
    if (url.includes("/members")) {
      const projectId = url.split("/")[2];
      const project = getMockProjects().find((p) => p._id === projectId);
      if (!project) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
      if (url.split("/").length === 4) {
        // GET /projects/:id/members - return members
        return { data: project.members as any };
      }
    }

    // Tasks endpoints
    if (url === "/tasks") {
      const params = config?.params || {};
      let tasks = getMockTasks();
      if (params.projectId) tasks = tasks.filter((t) => t.projectId === params.projectId);
      if (params.status) tasks = tasks.filter((t) => t.status === params.status);
      if (params.assigneeId) tasks = tasks.filter((t) => t.assignee?._id === params.assigneeId);
      if (params.search) {
        const search = params.search.toLowerCase();
        tasks = tasks.filter((t) => t.title.toLowerCase().includes(search) || t.description?.toLowerCase().includes(search));
      }
      return { data: tasks as any };
    }
    const taskMatch = url.match(/^\/tasks\/(.+)$/);
    if (taskMatch) {
      const task = getMockTasks().find((t) => t._id === taskMatch[1]);
      if (!task) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
      return { data: task as any };
    }

    // Task stats
    if (url === "/tasks/stats") {
      const params = config?.params || {};
      const tasks = params.projectId
        ? getMockTasks().filter((t) => t.projectId === params.projectId)
        : getMockTasks();
      const now = new Date();
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length;
      return {
        data: {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === "todo").length,
          inProgress: tasks.filter((t) => t.status === "in_progress").length,
          done: tasks.filter((t) => t.status === "done").length,
          overdue,
        } as any,
      };
    }

    throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
  };

  api.post = async <T>(url: string, data?: any): Promise<{ data: T }> => {
    await delay(300 + Math.random() * 200);

    if (url === "/auth/login") {
      const users = getMockUsers();
      const user = users.find((u) => u.email === data.email);
      if (!user) throw new AxiosError("Invalid credentials", "401", undefined, undefined, { status: 401, data: { message: "Invalid email or password" } } as any);
      const token = `mock-jwt-${user._id}-${Date.now()}`;
      return { data: { token, user } as any };
    }

    if (url === "/auth/signup") {
      const users = getMockUsers();
      if (users.some((u) => u.email === data.email)) {
        throw new AxiosError("Conflict", "409", undefined, undefined, { status: 409, data: { message: "Email already exists" } } as any);
      }
      const newUser: User = {
        _id: `user-${Date.now()}`,
        email: data.email,
        role: "member",
        profile: { _id: `prof-${Date.now()}`, displayName: data.displayName },
        createdAt: new Date().toISOString(),
      };
      setMockUsers([...users, newUser]);
      const token = `mock-jwt-${newUser._id}-${Date.now()}`;
      return { data: { token, user: newUser } as any };
    }

    if (url === "/projects") {
      const projects = getMockProjects();
      const token = authStorage.get();
      if (!token) throw new AxiosError("Unauthorized", "401", undefined, undefined, { status: 401 } as any);
      const userId = token.replace("mock-jwt-", "").split("-")[0];
      const newProject: Project = {
        _id: `proj-${Date.now()}`,
        name: data.name,
        description: data.description,
        ownerId: userId,
        members: [
          {
            user: getMockUsers().find((u) => u._id === userId)!,
            role: "admin" as Role,
            joinedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMockProjects([...projects, newProject]);
      return { data: newProject as any };
    }

    if (url.includes("/projects/") && url.includes("/members")) {
      const projectId = url.split("/")[2];
      const projects = getMockProjects();
      const projectIndex = projects.findIndex((p) => p._id === projectId);
      if (projectIndex === -1) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);

      const user = getMockUsers().find((u) => u._id === data.userId);
      if (!user) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);

      projects[projectIndex].members.push({ user, role: data.role, joinedAt: new Date().toISOString() });
      projects[projectIndex].updatedAt = new Date().toISOString();
      setMockProjects(projects);
      return { data: projects[projectIndex] as any };
    }

    if (url === "/tasks") {
      const token = authStorage.get();
      if (!token) throw new AxiosError("Unauthorized", "401", undefined, undefined, { status: 401 } as any);
      const userId = token.replace("mock-jwt-", "").split("-")[0];

      const tasks = getMockTasks();
      const maxOrder = Math.max(...tasks.filter((t) => t.projectId === data.projectId && t.status === (data.status || "todo")).map((t) => t.order), -1);

      const assignee = data.assigneeId ? getMockUsers().find((u) => u._id === data.assigneeId) || null : null;

      const newTask: Task = {
        _id: `task-${Date.now()}`,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status || "todo",
        assignee,
        dueDate: data.dueDate || null,
        order: maxOrder + 1,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMockTasks([...tasks, newTask]);
      return { data: newTask as any };
    }

    throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
  };

  api.patch = async <T>(url: string, data?: any): Promise<{ data: T }> => {
    await delay(200 + Math.random() * 150);

    if (url.includes("/projects/") && !url.includes("/members")) {
      const projectId = url.split("/")[2];
      const projects = getMockProjects();
      const projectIndex = projects.findIndex((p) => p._id === projectId);
      if (projectIndex === -1) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);

      projects[projectIndex] = { ...projects[projectIndex], ...data, updatedAt: new Date().toISOString() };
      setMockProjects(projects);
      return { data: projects[projectIndex] as any };
    }

    if (url.includes("/projects/") && url.includes("/members")) {
      const parts = url.split("/");
      const projectId = parts[2];
      const userId = parts[4];
      const projects = getMockProjects();
      const projectIndex = projects.findIndex((p) => p._id === projectId);
      if (projectIndex === -1) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);

      if (data === null || data === undefined) {
        // DELETE member
        projects[projectIndex].members = projects[projectIndex].members.filter((m) => m.user._id !== userId);
      } else {
        // PATCH-like add (handled in POST)
      }
      projects[projectIndex].updatedAt = new Date().toISOString();
      setMockProjects(projects);
      return { data: projects[projectIndex] as any };
    }

    if (url.includes("/tasks/")) {
      const taskId = url.split("/")[2];
      const tasks = getMockTasks();
      const taskIndex = tasks.findIndex((t) => t._id === taskId);
      if (taskIndex === -1) throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);

      const users = getMockUsers();
      if (data.assigneeId !== undefined) {
        data.assignee = data.assigneeId ? users.find((u) => u._id === data.assigneeId) || null : null;
      }
      delete data.assigneeId;

      tasks[taskIndex] = { ...tasks[taskIndex], ...data, updatedAt: new Date().toISOString() };
      setMockTasks(tasks);
      return { data: tasks[taskIndex] as any };
    }

    throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
  };

  api.delete = async (url: string): Promise<{ data: void }> => {
    await delay(200 + Math.random() * 150);

    if (url.includes("/projects/")) {
      const projectId = url.split("/")[2];
      const projects = getMockProjects().filter((p) => p._id !== projectId);
      setMockProjects(projects);
      const tasks = getMockTasks().filter((t) => t.projectId !== projectId);
      setMockTasks(tasks);
      return { data: undefined as any };
    }

    if (url.includes("/tasks/")) {
      const taskId = url.split("/")[2];
      const tasks = getMockTasks().filter((t) => t._id !== taskId);
      setMockTasks(tasks);
      return { data: undefined as any };
    }

    if (url.includes("/members/")) {
      // Handled in PATCH above
      return { data: undefined as any };
    }

    throw new AxiosError("Not found", "404", undefined, undefined, { status: 404 } as any);
  };
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Unknown error";
}
