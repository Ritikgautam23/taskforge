import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Settings, LogOut, User, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useApp } from "@/lib/store";
import type { Task, Project } from "@/types";
import { format } from "date-fns";

export function Topbar() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = state.currentUser;
  const userInitials = user?.profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  // Global search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { tasks: [], projects: [] };

    const query = searchQuery.toLowerCase();
    const tasks = state.tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const projects = state.projects.filter((p) =>
      p.name.toLowerCase().includes(query)
    ).slice(0, 3);

    return { tasks, projects };
  }, [searchQuery, state.tasks, state.projects]);

  const handleTaskClick = (task: Task) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/projects/${task.projectId}`);
  };

  const handleProjectClick = (project: Project) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/projects/${project._id}`);
  };

  const handleLogout = () => {
    logout();
  };

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex flex-1 items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex h-9 w-64 justify-start text-muted-foreground bg-background/60"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search tasks, projects...
            <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.profile.displayName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Global Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search tasks, projects, or people..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Projects */}
          {searchResults.projects.length > 0 && (
            <CommandGroup heading="Projects">
              {searchResults.projects.map((project) => (
                <CommandItem
                  key={project._id}
                  onSelect={() => handleProjectClick(project)}
                  className="flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Command className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span>{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {project.members.length} member{project.members.length !== 1 ? "s" : ""} • {state.tasks.filter((t) => t.projectId === project._id).length} tasks
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Tasks */}
          {searchResults.tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {searchResults.tasks.map((task) => {
                const project = state.projects.find((p) => p._id === task.projectId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

                return (
                  <CommandItem
                    key={task._id}
                    onSelect={() => handleTaskClick(task)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`h-3 w-3 rounded-full ${
                        task.status === "done"
                          ? "bg-green-500"
                          : task.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">{task.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        {project && <span>{project.name}</span>}
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <span className={isOverdue ? "text-red-500" : ""}>
                              {format(new Date(task.dueDate), "MMM d")}
                            </span>
                          </>
                        )}
                        {task.assignee && (
                          <>
                            <span>•</span>
                            <span>{task.assignee.profile.displayName}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {searchResults.tasks.length === 0 && searchResults.projects.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{searchQuery}&quot;
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
