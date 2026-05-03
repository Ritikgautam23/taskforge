import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { User, Project, Task, Role, TaskStatus, AuthResponse } from "@/types";
import { authApi, projectsApi, tasksApi } from "@/api";
import { authStorage } from "@/lib/auth-storage";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ==================== Seed Data ====================

const SEED_USERS: User[] = [
  {
    _id: "user-1",
    email: "alex@taskforge.dev",
    role: "admin",
    profile: { _id: "prof-1", displayName: "Alex Rivera", avatarUrl: "" },
    createdAt: "2025-01-15T08:00:00Z",
  },
  {
    _id: "user-2",
    email: "sam@taskforge.dev",
    role: "member",
    profile: { _id: "prof-2", displayName: "Sam Chen", avatarUrl: "" },
    createdAt: "2025-02-03T10:30:00Z",
  },
  {
    _id: "user-3",
    email: "maya@taskforge.dev",
    role: "member",
    profile: { _id: "prof-3", displayName: "Maya Patel", avatarUrl: "" },
    createdAt: "2025-03-10T14:20:00Z",
  },
  {
    _id: "user-4",
    email: "jordan@taskforge.dev",
    role: "member",
    profile: { _id: "prof-4", displayName: "Jordan Kim", avatarUrl: "" },
    createdAt: "2025-03-22T09:15:00Z",
  },
];

const SEED_PROJECTS: Project[] = [
  {
    _id: "proj-1",
    name: "Website Redesign",
    description: "Overhaul the marketing website with new branding, improved SEO, and faster load times.",
    ownerId: "user-1",
    members: [
      { user: SEED_USERS[0], role: "admin" as Role, joinedAt: "2025-01-15T08:00:00Z" },
      { user: SEED_USERS[1], role: "member" as Role, joinedAt: "2025-01-16T09:00:00Z" },
      { user: SEED_USERS[2], role: "member" as Role, joinedAt: "2025-01-17T11:30:00Z" },
    ],
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2025-04-28T14:20:00Z",
  },
  {
    _id: "proj-2",
    name: "Mobile App v2",
    description: "Build the next generation mobile experience with offline support and real-time sync.",
    ownerId: "user-2",
    members: [
      { user: SEED_USERS[1], role: "admin" as Role, joinedAt: "2025-02-03T10:30:00Z" },
      { user: SEED_USERS[3], role: "member" as Role, joinedAt: "2025-02-05T16:45:00Z" },
    ],
    createdAt: "2025-02-03T10:30:00Z",
    updatedAt: "2025-04-25T09:00:00Z",
  },
  {
    _id: "proj-3",
    name: "Analytics Dashboard",
    description: "Internal analytics dashboard for tracking team velocity, sprint health, and KPIs.",
    ownerId: "user-1",
    members: [
      { user: SEED_USERS[0], role: "admin" as Role, joinedAt: "2025-03-10T14:20:00Z" },
      { user: SEED_USERS[2], role: "member" as Role, joinedAt: "2025-03-11T08:00:00Z" },
      { user: SEED_USERS[3], role: "member" as Role, joinedAt: "2025-03-12T13:15:00Z" },
    ],
    createdAt: "2025-03-10T14:20:00Z",
    updatedAt: "2025-04-30T16:45:00Z",
  },
  {
    _id: "proj-4",
    name: "API Infrastructure",
    description: "Central API gateway, authentication service, and rate limiting for all products.",
    ownerId: "user-3",
    members: [
      { user: SEED_USERS[2], role: "admin" as Role, joinedAt: "2025-03-22T09:15:00Z" },
      { user: SEED_USERS[0], role: "member" as Role, joinedAt: "2025-03-23T10:00:00Z" },
    ],
    createdAt: "2025-03-22T09:15:00Z",
    updatedAt: "2025-04-20T11:30:00Z",
  },
];

const SEED_TASKS: Task[] = [
  // Website Redesign tasks
  {
    _id: "task-1",
    projectId: "proj-1",
    title: "Design new homepage mockups",
    description: "Create 3 mockup variations for the new homepage",
    status: "done",
    assignee: SEED_USERS[1],
    dueDate: "2025-04-15",
    order: 0,
    createdBy: "user-1",
    createdAt: "2025-04-01T08:00:00Z",
    updatedAt: "2025-04-10T14:20:00Z",
  },
  {
    _id: "task-2",
    projectId: "proj-1",
    title: "Implement responsive navigation",
    description: "Build mobile-friendly navigation with hamburger menu",
    status: "in_progress",
    assignee: SEED_USERS[2],
    dueDate: "2025-05-05",
    order: 0,
    createdBy: "user-1",
    createdAt: "2025-04-05T10:00:00Z",
    updatedAt: "2025-04-28T09:15:00Z",
  },
  {
    _id: "task-3",
    projectId: "proj-1",
    title: "Optimize images and assets",
    description: "Compress all images, implement lazy loading",
    status: "todo",
    assignee: SEED_USERS[1],
    dueDate: "2025-05-10",
    order: 0,
    createdBy: "user-1",
    createdAt: "2025-04-10T11:30:00Z",
    updatedAt: "2025-04-10T11:30:00Z",
  },
  {
    _id: "task-4",
    projectId: "proj-1",
    title: "SEO audit and improvements",
    description: "Run SEO audit, fix meta tags, implement structured data",
    status: "todo",
    assignee: null,
    dueDate: "2025-05-15",
    order: 1,
    createdBy: "user-1",
    createdAt: "2025-04-12T14:00:00Z",
    updatedAt: "2025-04-12T14:00:00Z",
  },
  // Mobile App v2 tasks
  {
    _id: "task-5",
    projectId: "proj-2",
    title: "Design offline-first architecture",
    description: "Plan data sync strategy and local storage schema",
    status: "done",
    assignee: SEED_USERS[3],
    dueDate: "2025-04-10",
    order: 0,
    createdBy: "user-2",
    createdAt: "2025-03-20T09:00:00Z",
    updatedAt: "2025-04-08T16:30:00Z",
  },
  {
    _id: "task-6",
    projectId: "proj-2",
    title: "Implement real-time messaging",
    description: "WebSocket-based chat for team collaboration",
    status: "in_progress",
    assignee: SEED_USERS[1],
    dueDate: "2025-05-20",
    order: 0,
    createdBy: "user-2",
    createdAt: "2025-03-25T11:00:00Z",
    updatedAt: "2025-04-29T08:45:00Z",
  },
  {
    _id: "task-7",
    projectId: "proj-2",
    title: "Push notification system",
    description: "Setup FCM/APNS integration for task reminders",
    status: "todo",
    assignee: null,
    dueDate: "2025-05-25",
    order: 1,
    createdBy: "user-2",
    createdAt: "2025-04-01T13:15:00Z",
    updatedAt: "2025-04-01T13:15:00Z",
  },
  // Analytics Dashboard tasks
  {
    _id: "task-8",
    projectId: "proj-3",
    title: "Sprint velocity chart component",
    description: "Recharts-based velocity visualization",
    status: "done",
    assignee: SEED_USERS[0],
    dueDate: "2025-04-20",
    order: 0,
    createdBy: "user-3",
    createdAt: "2025-04-05T08:30:00Z",
    updatedAt: "2025-04-18T15:00:00Z",
  },
  {
    _id: "task-9",
    projectId: "proj-3",
    title: "Real-time data aggregation",
    description: "Live updates to charts when tasks change",
    status: "in_progress",
    assignee: SEED_USERS[2],
    dueDate: "2025-05-08",
    order: 0,
    createdBy: "user-3",
    createdAt: "2025-04-10T10:00:00Z",
    updatedAt: "2025-04-27T11:20:00Z",
  },
  {
    _id: "task-10",
    projectId: "proj-3",
    title: "Export to PDF/CSV",
    description: "Allow exporting analytic reports",
    status: "todo",
    assignee: null,
    dueDate: null,
    order: 2,
    createdBy: "user-3",
    createdAt: "2025-04-15T14:30:00Z",
    updatedAt: "2025-04-15T14:30:00Z",
  },
  // API Infrastructure tasks
  {
    _id: "task-11",
    projectId: "proj-4",
    title: "JWT authentication service",
    description: "Secure token-based auth with refresh rotation",
    status: "done",
    assignee: SEED_USERS[2],
    dueDate: "2025-04-05",
    order: 0,
    createdBy: "user-3",
    createdAt: "2025-03-22T09:15:00Z",
    updatedAt: "2025-04-03T12:00:00Z",
  },
  {
    _id: "task-12",
    projectId: "proj-4",
    title: "Rate limiting middleware",
    description: "Per-IP and per-user rate limits with Redis",
    status: "in_progress",
    assignee: SEED_USERS[0],
    dueDate: "2025-05-12",
    order: 0,
    createdBy: "user-3",
    createdAt: "2025-03-28T16:00:00Z",
    updatedAt: "2025-04-26T09:30:00Z",
  },
];

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  USERS: "tf_users",
  PROJECTS: "tf_projects",
  TASKS: "tf_tasks",
  TOKEN: "tf_token",
  CURRENT_USER: "tf_current_user",
} as const;

// ==================== Initial State ====================

function getInitialState() {
  const { USERS, PROJECTS, TASKS } = STORAGE_KEYS;

  // Initialize localStorage with seed data if empty
  try {
    if (!localStorage.getItem(USERS)) {
      localStorage.setItem(USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(PROJECTS)) {
      localStorage.setItem(PROJECTS, JSON.stringify(SEED_PROJECTS));
    }
    if (!localStorage.getItem(TASKS)) {
      localStorage.setItem(TASKS, JSON.stringify(SEED_TASKS));
    }
  } catch {
    // ignore storage errors
  }

  // Read back from localStorage (or use seed as fallback if JSON parse fails)
  let users: User[] = SEED_USERS;
  let projects: Project[] = SEED_PROJECTS;
  let tasks: Task[] = SEED_TASKS;

  try {
    const storedUsers = localStorage.getItem(USERS);
    if (storedUsers) users = JSON.parse(storedUsers);
  } catch { /* ignore parse errors */ }
  try {
    const storedProjects = localStorage.getItem(PROJECTS);
    if (storedProjects) projects = JSON.parse(storedProjects);
  } catch { /* ignore parse errors */ }
  try {
    const storedTasks = localStorage.getItem(TASKS);
    if (storedTasks) tasks = JSON.parse(storedTasks);
  } catch { /* ignore parse errors */ }

  const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

  return {
    users,
    projects,
    tasks,
    token: storedToken,
    currentUser: storedUser ? JSON.parse(storedUser) : null,
  };
}

// ==================== Types ====================

type State = {
  users: User[];
  projects: Project[];
  tasks: Task[];
  token: string | null;
  currentUser: User | null;
};

type Action =
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "ADD_MEMBER"; payload: { projectId: string; member: { user: User; role: Role; joinedAt: string } } }
  | { type: "REMOVE_MEMBER"; payload: { projectId: string; userId: string } }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: { projectId: string; tasks: Task[] } }
  | { type: "LOGIN"; payload: AuthResponse }
  | { type: "LOGOUT" };

// ==================== Reducer ====================

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p._id === action.payload._id ? { ...p, ...action.payload, updatedAt: new Date().toISOString() } : p
        ),
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p._id !== action.payload),
        tasks: state.tasks.filter((t) => t.projectId !== action.payload),
      };
    case "ADD_MEMBER": {
      const { projectId, member } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p._id === projectId
            ? { ...p, members: [...p.members, member], updatedAt: new Date().toISOString() }
            : p
        ),
      };
    }
    case "REMOVE_MEMBER": {
      const { projectId, userId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p._id === projectId
            ? { ...p, members: p.members.filter((m) => m.user._id !== userId), updatedAt: new Date().toISOString() }
            : p
        ),
      };
    }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t._id === action.payload._id ? { ...t, ...action.payload, updatedAt: new Date().toISOString() } : t
        ),
      };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t._id !== action.payload) };
    case "REORDER_TASKS": {
      const { projectId, tasks } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          const updated = tasks.find((nt) => nt._id === t._id);
          if (updated && updated.projectId === projectId) {
            return { ...t, status: updated.status, order: updated.order };
          }
          return t;
        }),
      };
    }
    case "LOGIN":
      return {
        ...state,
        token: action.payload.token,
        currentUser: action.payload.user,
      };
    case "LOGOUT":
      return { ...state, token: null, currentUser: null };
    default:
      return state;
  }
}

// ==================== Context ====================

interface AppContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  // Helper functions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  createProject: (name: string, description?: string) => Project;
  updateProject: (id: string, data: Partial<Pick<Project, "name" | "description">>) => void;
  deleteProject: (id: string) => void;
  addProjectMember: (projectId: string, userId: string, role: Role) => void;
  removeProjectMember: (projectId: string, userId: string) => void;
  createTask: (data: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
    status?: TaskStatus;
  }) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  getProjectById: (id: string) => Project | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getUserById: (userId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

// ==================== Persistence ====================

function persistState(state: State) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(state.projects));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    if (state.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, state.token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
    if (state.currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch {
    // Ignore storage errors
  }
}

// ==================== Provider ====================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  // Persist on every state change
  useEffect(() => {
    persistState(state);
  }, [state]);

  // Helper functions
  const login = async (email: string, password: string): Promise<boolean> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const user = state.users.find((u) => u.email === email);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      const token = `mock-jwt-${user._id}-${Date.now()}`;
      const response: AuthResponse = { token, user };
      dispatch({ type: "LOGIN", payload: response });
      return true;
    } else {
      const response = await authApi.login({ email, password });
      dispatch({ type: "LOGIN", payload: response });
      authStorage.set(response.token);
      return true;
    }
  };

  const signup = async (email: string, password: string, displayName: string): Promise<boolean> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (state.users.some((u) => u.email === email)) {
        throw new Error("Email already exists");
      }
      const newUser: User = {
        _id: `user-${Date.now()}`,
        email,
        role: "member",
        profile: { _id: `prof-${Date.now()}`, displayName },
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "SET_USERS", payload: [...state.users, newUser] });
      const token = `mock-jwt-${newUser._id}-${Date.now()}`;
      const response: AuthResponse = { token, user: newUser };
      dispatch({ type: "LOGIN", payload: response });
      return true;
    } else {
      const response = await authApi.signup({ email, password, displayName });
      dispatch({ type: "LOGIN", payload: response });
      authStorage.set(response.token);
      return true;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    authStorage.clear();
    try {
      localStorage.removeItem("taskforge_remembered_credentials");
    } catch {
      // ignore
    }
  };

  const createProject = async (name: string, description?: string): Promise<Project> => {
    if (USE_MOCK) {
      const newProject: Project = {
        _id: `proj-${Date.now()}`,
        name,
        description,
        ownerId: state.currentUser!._id,
        members: [
          {
            user: state.currentUser!,
            role: "admin",
            joinedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_PROJECT", payload: newProject });
      return newProject;
    } else {
      const project = await projectsApi.create({ name, description });
      dispatch({ type: "ADD_PROJECT", payload: project });
      return project;
    }
  };

  const updateProject = async (id: string, data: Partial<Pick<Project, "name" | "description">>) => {
    if (USE_MOCK) {
      const existing = state.projects.find((p) => p._id === id);
      if (!existing) return;
      dispatch({ type: "UPDATE_PROJECT", payload: { ...existing, ...data } });
    } else {
      const updated = await projectsApi.update(id, data);
      dispatch({ type: "UPDATE_PROJECT", payload: updated });
    }
  };

  const deleteProject = async (id: string) => {
    if (USE_MOCK) {
      dispatch({ type: "DELETE_PROJECT", payload: id });
    } else {
      await projectsApi.remove(id);
      dispatch({ type: "DELETE_PROJECT", payload: id });
    }
  };

  const addProjectMember = async (projectId: string, userId: string, role: Role) => {
    if (USE_MOCK) {
      const user = state.users.find((u) => u._id === userId);
      if (!user) return;
      dispatch({
        type: "ADD_MEMBER",
        payload: {
          projectId,
          member: { user, role, joinedAt: new Date().toISOString() },
        },
      });
    } else {
      const updated = await projectsApi.addMember(projectId, { userId, role });
      dispatch({ type: "UPDATE_PROJECT", payload: updated });
    }
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    if (USE_MOCK) {
      dispatch({ type: "REMOVE_MEMBER", payload: { projectId, userId } });
    } else {
      const updated = await projectsApi.removeMember(projectId, userId);
      dispatch({ type: "UPDATE_PROJECT", payload: updated });
    }
  };

  const createTask = async (data: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
    status?: TaskStatus;
  }): Promise<Task> => {
    if (USE_MOCK) {
      const maxOrder = Math.max(...state.tasks.filter((t) => t.projectId === data.projectId && t.status === data.status || "todo").map((t) => t.order), -1);
      const newTask: Task = {
        _id: `task-${Date.now()}`,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status || "todo",
        assignee: data.assigneeId ? state.users.find((u) => u._id === data.assigneeId) || null : null,
        dueDate: data.dueDate || null,
        order: maxOrder + 1,
        createdBy: state.currentUser!._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_TASK", payload: newTask });
      return newTask;
    } else {
      const task = await tasksApi.create({ ...data, status: data.status || "todo" });
      dispatch({ type: "ADD_TASK", payload: task });
      return task;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    if (USE_MOCK) {
      const existing = state.tasks.find((t) => t._id === id);
      if (!existing) return;
      const updatedTask = { ...existing, ...data };
      if (data.assigneeId !== undefined) {
        updatedTask.assignee = data.assigneeId ? state.users.find((u) => u._id === data.assigneeId) || null : null;
      }
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
    } else {
      const updated = await tasksApi.update(id, data);
      dispatch({ type: "UPDATE_TASK", payload: updated });
    }
  };

  const deleteTask = async (id: string) => {
    if (USE_MOCK) {
      dispatch({ type: "DELETE_TASK", payload: id });
    } else {
      await tasksApi.remove(id);
      dispatch({ type: "DELETE_TASK", payload: id });
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    const task = state.tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (USE_MOCK) {
      // Update the moved task
      const movedTask = { ...task, status: newStatus, order: newOrder };
      dispatch({ type: "UPDATE_TASK", payload: movedTask });

      // Reorder other tasks in the target column
      const sameStatusTasks = state.tasks.filter((t) => t.projectId === task.projectId && t.status === newStatus && t._id !== taskId);
      const toUpdate = sameStatusTasks
        .filter((t) => t.order >= newOrder)
        .map((t) => ({ ...t, order: t.order + 1 }));

      toUpdate.forEach((t) => dispatch({ type: "UPDATE_TASK", payload: t }));

      // Reorder tasks in the old column
      const oldStatusTasks = state.tasks.filter((t) => t.projectId === task.projectId && t.status === task.status && t._id !== taskId);
      const oldToUpdate = oldStatusTasks
        .filter((t) => t.order > task.order)
        .map((t) => ({ ...t, order: t.order - 1 }));

      oldToUpdate.forEach((t) => dispatch({ type: "UPDATE_TASK", payload: t }));
    } else {
      // For real backend, just update the task with new status and order
      await tasksApi.update(taskId, { status: newStatus, order: newOrder });
      dispatch({ type: "UPDATE_TASK", payload: { ...task, status: newStatus, order: newOrder } });
    }
  };

  const getProjectById = (id: string) => state.projects.find((p) => p._id === id);
  const getTasksByProject = (projectId: string) => state.tasks.filter((t) => t.projectId === projectId);
  const getTasksByUser = (userId: string) => state.tasks.filter((t) => t.assignee?._id === userId);
  const getUserById = (userId: string) => state.users.find((u) => u._id === userId);

  const value: AppContextType = {
    state,
    dispatch,
    login,
    signup,
    logout,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getProjectById,
    getTasksByProject,
    getTasksByUser,
    getUserById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
