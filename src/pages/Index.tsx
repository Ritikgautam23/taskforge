import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, KanbanSquare, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: KanbanSquare,
    title: "Kanban that flows",
    body: "Drag tasks across Todo, In Progress, and Done. Status syncs instantly.",
  },
  {
    icon: CheckCircle2,
    title: "Built for teams",
    body: "Projects, members, and role-based access. Admins lead, members ship.",
  },
  {
    icon: LineChart,
    title: "Insight, not noise",
    body: "Throughput, overdue trend, and completion rate — at a glance.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-sm">
            T
          </div>
          <span className="font-display text-lg font-semibold">TaskForge</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              A calmer way to ship work
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Plan, assign, and finish work — <em className="not-italic text-accent">together.</em>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              TaskForge is a focused team task manager. Projects, Kanban, deadlines,
              and analytics — without the bloat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Open dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/projects">Browse projects</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border bg-card p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-3">
                {(["todo", "progress", "done"] as const).map((k, i) => (
                  <div
                    key={k}
                    className={
                      "rounded-lg p-3 " +
                      (k === "todo"
                        ? "bg-status-todo text-status-todo-foreground"
                        : k === "progress"
                        ? "bg-status-progress text-status-progress-foreground"
                        : "bg-status-done text-status-done-foreground")
                    }
                  >
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                      {k === "progress" ? "In progress" : k}
                    </p>
                    <div className="space-y-2">
                      {[0, 1].map((j) => (
                        <div
                          key={j}
                          className="rounded-md bg-background/60 p-2 text-xs shadow-sm"
                        >
                          {["Design login", "Audit RLS", "Ship beta", "QA pass", "Wire charts", "Polish"][i * 2 + j]}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 pb-24 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 shadow-sm">
              <f.icon className="mb-3 h-5 w-5 text-accent" />
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
