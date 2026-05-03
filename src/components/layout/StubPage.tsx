import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

interface StubProps {
  title: string;
  eyebrow: string;
  description: string;
  phase: string;
}

export function StubPage({ title, eyebrow, description, phase }: StubProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="p-6 sm:p-8">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-2 py-10">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Coming in {phase}
            </span>
            <p className="text-sm text-muted-foreground">
              This route is wired in the app shell. Real UI ships in {phase}.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
