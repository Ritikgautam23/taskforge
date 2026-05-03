import { useMemo, useState } from "react";
import { format, subDays, startOfWeek, eachDayOfInterval, isWithinInterval, parseISO, isBefore } from "date-fns";
import { TrendingUp, TrendingDown, BarChart3, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  } from "recharts";

export default function Analytics() {
  const { state, getProjectById } = useApp();
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(now, 13 - i);
      return format(date, "yyyy-MM-dd");
    });

    // Daily throughput (tasks created vs completed)
    const dailyThroughput = last14Days.map((date) => {
      const created = state.tasks.filter((t) => format(parseISO(t.createdAt), "yyyy-MM-dd") === date).length;
      const completed = state.tasks.filter((t) => t.status === "done" && format(parseISO(t.updatedAt), "yyyy-MM-dd") === date).length;
      return { date: format(parseISO(date), "MMM d"), created, completed };
    });

    // Weekly completion rate
    const thisWeek = eachDayOfInterval({
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: now,
    }).map((d) => format(d, "yyyy-MM-dd"));

    const weeklyCreated = state.tasks.filter((t) => thisWeek.includes(format(parseISO(t.createdAt), "yyyy-MM-dd"))).length;
    const weeklyCompleted = state.tasks.filter((t) => t.status === "done" && thisWeek.includes(format(parseISO(t.updatedAt), "yyyy-MM-dd"))).length;

    // Overdue trend
    const overdueByProject = state.projects.map((project) => {
      const tasks = state.tasks.filter((t) => t.projectId === project._id);
      const overdue = tasks.filter((t) => t.dueDate && isBefore(parseISO(t.dueDate), now) && t.status !== "done").length;
      return { name: project.name.length > 12 ? project.name.substring(0, 12) + "…" : project.name, overdue };
    }).filter((p) => p.overdue > 0);

    // Status distribution
    const statusData = [
      { name: "To Do", value: state.tasks.filter((t) => t.status === "todo").length, fill: "#94a3b8" },
      { name: "In Progress", value: state.tasks.filter((t) => t.status === "in_progress").length, fill: "#3b82f6" },
      { name: "Done", value: state.tasks.filter((t) => t.status === "done").length, fill: "#22c55e" },
    ];

    // Assignee workload
    const assigneeWorkload = state.users
      .filter((user) => state.tasks.some((t) => t.assignee?._id === user._id))
      .map((user) => {
        const userTasks = state.tasks.filter((t) => t.assignee?._id === user._id);
        return {
          name: user.profile.displayName,
          total: userTasks.length,
          done: userTasks.filter((t) => t.status === "done").length,
          inProgress: userTasks.filter((t) => t.status === "in_progress").length,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // Key metrics
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = state.tasks.filter((t) => t.status === "in_progress").length;
    const overdueTasks = state.tasks.filter((t) => t.dueDate && isBefore(parseISO(t.dueDate), now) && t.status !== "done").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Project completion comparison
    const projectProgress = state.projects.map((project) => {
      const tasks = state.tasks.filter((t) => t.projectId === project._id);
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "done").length;
      return { name: project.name.length > 10 ? project.name.substring(0, 10) + "…" : project.name, total, completed };
    });

    return {
      dailyThroughput,
      weeklyCreated,
      weeklyCompleted,
      completionRate,
      overdueByProject,
      statusData,
      assigneeWorkload,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      projectProgress,
    };
  }, [state.tasks, state.projects, state.users]);

  const filteredProjectProgress = projectFilter === "all"
    ? analyticsData.projectProgress
    : analyticsData.projectProgress.filter((p) =>
        state.projects.find((proj) => proj.name === p.name)?._id === projectFilter
      );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Throughput, completion rate, overdue trend — powered by Recharts.
          </p>
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {state.projects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.completionRate}%</div>
            <div className="mt-2 flex items-center text-xs">
              {analyticsData.completionRate >= 50 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-amber-500 mr-1" />
              )}
              <span className="text-muted-foreground">
                {analyticsData.completedTasks} of {analyticsData.totalTasks} tasks done
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Throughput</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.weeklyCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              tasks completed this week
            </p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-muted-foreground">
                {analyticsData.weeklyCreated} created
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              tasks currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{analyticsData.overdueTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              tasks past deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Throughput (Last 14 Days)</CardTitle>
            <CardDescription>Tasks created vs completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.dailyThroughput}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorCreated)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>All tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {analyticsData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {analyticsData.statusData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Completion per project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={filteredProjectProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" name="Total" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assignee Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>Tasks per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.assigneeWorkload.length > 0 ? (
                analyticsData.assigneeWorkload.map((person) => (
                  <div key={person.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{person.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {person.done}/{person.total}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${person.total > 0 ? (person.done / person.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No assigned tasks yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Warning */}
      {analyticsData.overdueTasks > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Overdue Tasks Alert
            </CardTitle>
            <CardDescription className="text-red-600/80">
              {analyticsData.overdueTasks} task{analyticsData.overdueTasks !== 1 ? "s are" : " is"} past due date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.overdueByProject.map((proj) => (
                <div key={proj.name} className="flex items-center justify-between text-sm">
                  <span>{proj.name}</span>
                  <Badge variant="outline" className="border-red-300 text-red-700">
                    {proj.overdue} overdue
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
