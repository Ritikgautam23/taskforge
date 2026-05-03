import { useState } from "react";
import { Plus, FolderKanban, MoreHorizontal, Trash2, Edit2, Users, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Link } from "react-router-dom";
import type { Project } from "@/types";

export default function Projects() {
  const { state, createProject, updateProject, deleteProject } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setIsSubmitting(true);
    try {
      createProject(newProjectName.trim(), newProjectDesc.trim() || undefined);
      toast.success("Project created");
      setIsCreateOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedProject || !newProjectName.trim()) return;
    setIsSubmitting(true);
    try {
      updateProject(selectedProject._id, {
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
      });
      toast.success("Project updated");
      setIsEditOpen(false);
      setSelectedProject(null);
    } catch {
      toast.error("Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      deleteProject(selectedProject._id);
      toast.success("Project deleted");
      setIsDeleteOpen(false);
      setSelectedProject(null);
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setNewProjectName(project.name);
    setNewProjectDesc(project.description || "");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Create projects, invite teammates, and group related tasks.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {state.projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {state.projects.map((project) => {
            // Get task count and completion stats
            const tasks = state.tasks.filter((t) => t.projectId === project._id);
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t) => t.status === "done").length;
            const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <Card
                key={project._id}
                className="group relative flex flex-col hover:shadow-md transition-all cursor-pointer"
              >
                <Link to={`/projects/${project._id}`} className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg truncate max-w-[160px]">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.preventDefault()}
                            aria-label="Project options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(project)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(project)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mb-4">
                        No description
                      </p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-0">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member.user?._id || Math.random()} className="h-7 w-7 border-2 border-background">
                          <AvatarFallback className="text-[10px]">
                            {member.user?.profile?.displayName?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-background">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                    </span>
                  </CardFooter>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Create your first project to start organizing tasks and collaborating with your team.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

       {/* Create Project Modal */}
       <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Create new project</DialogTitle>
             <DialogDescription>
               Projects help you organize tasks and collaborate with your team.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">
                 Project name <span className="text-destructive">*</span>
               </label>
               <input
                 type="text"
                 placeholder="e.g., Website Redesign"
                 value={newProjectName}
                 onChange={(e) => setNewProjectName(e.target.value)}
                 className="w-full px-3 py-2 border rounded-md bg-background"
                 required
                 autoFocus
               />
             </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Brief description of the project..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newProjectName.trim() || isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Edit Project Modal */}
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Edit project</DialogTitle>
             <DialogDescription>
               Update project details.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">
                 Project name <span className="text-destructive">*</span>
               </label>
               <input
                 type="text"
                 placeholder="e.g., Website Redesign"
                 value={newProjectName}
                 onChange={(e) => setNewProjectName(e.target.value)}
                 className="w-full px-3 py-2 border rounded-md bg-background"
                 required
                 autoFocus
               />
             </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Brief description of the project..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!newProjectName.trim() || isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{selectedProject?.name}&quot; and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
