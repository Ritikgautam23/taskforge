import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { Task, TaskStatus, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Column definitions
const COLUMNS: { id: TaskStatus; title: string; color: string; icon: typeof Clock }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-100", icon: Clock },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100", icon: AlertTriangle },
  { id: "done", title: "Done", color: "bg-green-100", icon: CheckCircle2 },
];

// Sortable Task Card
function SortableTaskCard({ task }: { task: Task }) {
  const { updateTask, deleteTask, state } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editDue, setEditDue] = useState(task.dueDate || "");
  const [editAssignee, setEditAssignee] = useState(task.assignee?._id || "");

  const assignee = task.assignee;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== "done";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveEdit = () => {
    updateTask(task._id, {
      title: editTitle,
      description: editDesc,
      dueDate: editDue || null,
      assigneeId: editAssignee || null,
    });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    deleteTask(task._id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary/30"
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium line-clamp-2 flex-1">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2" aria-label="Task options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${
                    isOverdue ? "text-red-600" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{format(dueDate, "MMM d")}</span>
                </div>
              )}
            </div>

            {assignee ? (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {assignee.profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                ?
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due date</Label>
                <Input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
              </div>
              <div>
                <Label>Assignee</Label>
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Unassigned</option>
                  {state.users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.profile.displayName}
                    </option>
                  ))}
                </select>
              </div>
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
              This will permanently delete &quot;{task.title}&quot;. This action cannot be undone.
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
    </>
  );
}

// Column Component
function KanbanColumn({
  column,
  tasks,
  projectId,
  onAddTask,
}: {
  column: typeof COLUMNS[0];
  tasks: Task[];
  projectId: string;
  onAddTask: (status: TaskStatus) => void;
}) {
  const Icon = column.icon;
  const taskCount = tasks.length;

  const statusColors: Record<string, string> = {
    todo: "text-slate-500",
    in_progress: "text-blue-500",
    done: "text-green-500",
  };

  return (
    <div className="flex flex-col rounded-lg border bg-muted/30">
      {/* Column Header */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${column.color} rounded-t-lg`}>
        <Icon className={`h-4 w-4 ${statusColors[column.id]}`} />
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {taskCount}
        </Badge>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 space-y-3 min-h-[400px]">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} />
          ))}
        </SortableContext>

        {/* Add Task Button */}
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors mt-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add task</span>
        </button>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, createTask, moveTask } = useApp();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const project = useMemo(() => {
    if (!id) return undefined;
    return state.projects.find((p) => p._id === id);
  }, [id, state.projects]);

  const tasks = useMemo(
    () => (id ? state.tasks.filter((t) => t.projectId === id) : []),
    [id, state.tasks]
  );

  // Prepare sensors and sorted tasks before any early return
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    Object.keys(grouped).forEach((key) => {
      grouped[key as TaskStatus].sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [tasks]);

  // Project not found - after hooks are set up
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button asChild>
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t._id === activeId);
    const overTask = tasks.find((t) => t._id === overId);

    if (!activeTask || !overTask) return;

    // Find the column of the over item (could be a column id)
    const overColumnId = over.id === "todo" || over.id === "in_progress" || over.id === "done"
      ? over.id as TaskStatus
      : overTask.status;

    if (activeTask.status !== overColumnId) {
      // Move to different column - will update order on drag end
      moveTask(activeId, overColumnId, overTask.order);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t._id === activeId);
    const overTask = tasks.find((t) => t._id === overId);

    if (!activeTask) return;

    // Determine target column and new index
    let targetColumn: TaskStatus = activeTask.status;
    let targetIndex = activeTask.order;

    // Check if dropped on a column
    if (overId === "todo" || overId === "in_progress" || overId === "done") {
      targetColumn = overId as TaskStatus;
      // Insert at end of column
      const columnTasks = tasksByStatus[targetColumn];
      targetIndex = columnTasks.length > 0 ? Math.max(...columnTasks.map((t) => t.order)) + 1 : 0;
    } else if (overTask) {
      // Dropped on another task
      targetColumn = overTask.status;
      targetIndex = overTask.order;

      // Reorder within column
      const columnTasks = tasksByStatus[targetColumn]
        .filter((t) => t._id !== activeId)
        .sort((a, b) => a.order - b.order);

      const overIndex = columnTasks.findIndex((t) => t._id === overId);
      if (overIndex >= 0) {
        columnTasks.splice(overIndex, 0, activeTask);
        // Update orders for all tasks in this column
        columnTasks.forEach((task, idx) => {
          if (task._id !== activeId) {
            moveTask(task._id, targetColumn, idx);
          }
        });
      }
    }

    // Update the dragged task
    if (targetColumn !== activeTask.status || targetIndex !== activeTask.order) {
      moveTask(activeId, targetColumn, targetIndex);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    if (!id) return;
    setNewTaskStatus(status);
    setIsAddTaskOpen(true);
  };

  const handleCreateTask = () => {
    if (!id || !newTaskTitle.trim()) return;
    createTask({
      projectId: id,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      assigneeId: newTaskAssignee || undefined,
      dueDate: newTaskDue || undefined,
      status: newTaskStatus,
    });
    setIsAddTaskOpen(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskAssignee("");
    setNewTaskDue("");
  };

  if (!project) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b">
        <Button asChild variant="ghost" size="sm">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-display font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map((member) => (
              <Avatar key={member.user?._id || Math.random()} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {member.user?.profile?.displayName?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full w-full">
            {COLUMNS.map((column) => (
              <div key={column.id} className="w-full lg:flex-1 min-w-[280px]">
                <KanbanColumn
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  projectId={project._id}
                  onAddTask={handleAddTask}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <Card className="shadow-lg rotate-3 cursor-grabbing border-l-4 border-l-primary/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium line-clamp-2">{activeTask.title}</h4>
                  {activeTask.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {activeTask.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Task Modal */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add task to {COLUMNS.find((c) => c.id === newTaskStatus)?.title}
            </DialogTitle>
            <DialogDescription>
              Create a new task in this column
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Add more details..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due date</Label>
                <Input type="date" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} />
              </div>
              <div>
                <Label>Assignee</Label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Unassigned</option>
                  {project.members.map((member) => (
                    <option key={member.user?._id || Math.random()} value={member.user?._id}>
                      {member.user?.profile?.displayName || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
