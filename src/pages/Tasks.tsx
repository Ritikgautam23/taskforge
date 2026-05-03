import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { Task, TaskStatus, User } from "@/types";
import { format, isAfter, isBefore, startOfToday } from "date-fns";

export default function Tasks() {
  const { state, updateTask, deleteTask, getProjectById } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "createdAt" | "title">("dueDate");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...state.tasks];

    // Search
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== "all") {
      result = result.filter((t) => t.projectId === projectFilter);
    }

    // Assignee filter
    if (assigneeFilter !== "all") {
      result = result.filter((t) => t.assignee?._id === assigneeFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      }
      if (sortBy === "createdAt") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [state.tasks, search, statusFilter, projectFilter, assigneeFilter, sortBy]);

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditDue(task.dueDate || "");
    setEditAssignee(task.assignee?._id || "");
    setEditStatus(task.status);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTask) return;
    updateTask(selectedTask._id, {
      title: editTitle,
      description: editDesc,
      dueDate: editDue || null,
      assigneeId: editAssignee || null,
      status: editStatus,
    });
    toast.success("Task updated");
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    deleteTask(selectedTask._id);
    toast.success("Task deleted");
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const getStatusBadge = (status: TaskStatus) => {
    const styles: Record<TaskStatus, string> = {
      todo: "bg-slate-100 text-slate-700 border-slate-200",
      in_progress: "bg-blue-100 text-blue-700 border-blue-200",
      done: "bg-green-100 text-green-700 border-green-200",
    };
    return <Badge variant="outline" className={styles[status]}>{status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const isTaskOverdue = (task: Task) => {
    return task.dueDate && isBefore(new Date(task.dueDate), startOfToday()) && task.status !== "done";
  };

  const getTaskRowStyle = (task: Task) => {
    if (isTaskOverdue(task)) return "bg-red-50/50";
    return "";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Every task assigned to you across all projects, with search and filters.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Project Filter */}
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Project" />
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

        {/* Assignee Filter */}
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[180px]">
            <User className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {state.users.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.profile.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due date</SelectItem>
            <SelectItem value="createdAt">Recently added</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const project = getProjectById(task.projectId);
            const isOverdue = isTaskOverdue(task);
            return (
              <Card key={task._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link to={`/projects/${task.projectId}`} className="font-medium hover:underline line-clamp-2">
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Task options">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(task)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(task)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                    {getStatusBadge(task.status)}
                    {project && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Link
                          to={`/projects/${project._id}`}
                          className="flex items-center gap-1 hover:underline truncate max-w-[120px]"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary/60" />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </>
                    )}
                    {task.assignee ? (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {task.assignee.profile.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[80px]">{task.assignee.profile.displayName}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span>Unassigned</span>
                      </>
                    )}
                    {task.dueDate && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div
                          className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(task.dueDate), "MMM d")}</span>
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== "all" || projectFilter !== "all" || assigneeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const project = getProjectById(task.projectId);
                    const isOverdue = isTaskOverdue(task);

                    return (
                      <TableRow
                        key={task._id}
                        className={`group hover:bg-muted/50 ${getTaskRowStyle(task)}`}
                      >
                        <TableCell>
                          <Link
                            to={`/projects/${task.projectId}`}
                            className="font-medium hover:underline"
                          >
                            {task.title}
                          </Link>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {task.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <Link
                            to={`/projects/${project?._id}`}
                            className="text-sm hover:underline flex items-center gap-2"
                          >
                            {project && (
                              <>
                                <div className="h-2 w-2 rounded-full bg-primary/60" />
                                {project.name}
                              </>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">
                                  {task.assignee.profile.displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{task.assignee.profile.displayName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div
                              className={`flex items-center gap-2 text-sm ${
                                isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                              }`}
                            >
                              <Calendar className="h-4 w-4" />
                              {format(new Date(task.dueDate), "MMM d, yyyy")}
                              {isOverdue && <AlertTriangle className="h-4 w-4" />}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            aria-label="Task options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => openDeleteDialog(task)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Clock className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-lg font-medium">No tasks found</p>
                        <p className="text-sm">
                          {search || statusFilter !== "all" || projectFilter !== "all" || assigneeFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Create your first task to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Due date</label>
                <Input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <select
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Unassigned</option>
                {state.users.map((user: User) => (
                  <option key={user._id} value={user._id}>
                    {user.profile.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{selectedTask?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
