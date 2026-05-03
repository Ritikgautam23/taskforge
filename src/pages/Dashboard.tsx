import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowUp, FolderKanban, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import type { TaskStats, Task, Project } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#94a3b8", "#3b82f6", "#22c55e"];

export default function Dashboard() {
  const { state, getProjectById, getTasksByProject } = useApp();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      // Calculate stats from all tasks
      const now = new Date();
      const tasks = state.tasks;
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length;

      setStats({
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        done: tasks.filter((t) => t.status === "done").length,
        overdue,
      });

      // Get recent tasks (last 5 updated)
      setRecentTasks([...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));

      // Get active projects (those with tasks)
      const projectsWithTasks = state.projects.filter((p) => tasks.some((t) => t.projectId === p._id));
      setActiveProjects(projectsWithTasks.slice(0, 4));

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [state.tasks, state.projects]);

  const completionRate = stats ? Math.round((stats.done / stats.total) * 100) || 0 : 0;

  const projectProgress = activeProjects.map((project) => {
    const tasks = getTasksByProject(project._id);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + "…" : project.name,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  const statusData = stats
    ? [
        { name: "To Do", value: stats.todo, fill: COLORS[0] },
        { name: "In Progress", value: stats.inProgress, fill: COLORS[1] },
        { name: "Done", value: stats.done, fill: COLORS[2] },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your team&apos;s task health at a glance — Kanban summary, deadlines, and weekly throughput.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">{stats?.inProgress || 0}</div>
              {stats && stats.inProgress > stats.done && (
                <ArrowUp className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <Progress value={stats ? (stats.inProgress / stats.total) * 100 : 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">{stats?.done || 0}</div>
              <Badge variant="secondary" className="text-xs">
                {completionRate}%
              </Badge>
            </div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Projects */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks pending</span>
                <span className="font-medium">{stats?.todo || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Active projects completion</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/projects">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectProgress.length > 0 ? (
                projectProgress.map((project) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{project.name}</span>
                      <span className="text-muted-foreground">
                        {project.completed}/{project.total}
                      </span>
                    </div>
                    <Progress value={project.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No projects yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/projects">
                      <Plus className="h-4 w-4 mr-2" />
                      Create project
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Latest activity across all projects</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/tasks">View all tasks</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => {
                const project = getProjectById(task.projectId);
                const assignee = task.assignee;
                const statusColors: Record<string, string> = {
                  todo: "bg-slate-100 text-slate-700 border-slate-200",
                  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
                  done: "bg-green-100 text-green-700 border-green-200",
                };
                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.status === "done"
                            ? "bg-green-500"
                            : task.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-slate-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${task.projectId}`}
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {project && (
                            <>
                              <span className="truncate">{project.name}</span>
                              <span>•</span>
                            </>
                          )}
                          {task.dueDate && (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusColors[task.status]}>
                        {task.status === "in_progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                      {assignee ? (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {assignee.profile.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          ?
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Tasks will appear here once created</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Quick start</CardTitle>
            <CardDescription>Common actions to get going</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/projects">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tasks">View My Tasks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Focus</CardTitle>
            <CardDescription>Tasks due today</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const today = new Date().toISOString().split("T")[0];
              const dueToday = state.tasks.filter((t) => t.dueDate === today && t.status !== "done");
              return (
                dueToday.length > 0 ? (
                  <div className="space-y-2">
                    {dueToday.slice(0, 3).map((task) => (
                      <Link
                        key={task._id}
                        to={`/projects/${task.projectId}`}
                        className="block text-sm hover:text-accent transition-colors"
                      >
                        {task.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks due today</p>
                )
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
