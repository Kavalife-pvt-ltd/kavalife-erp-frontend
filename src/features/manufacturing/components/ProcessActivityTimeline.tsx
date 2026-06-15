import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProcessActivityItem } from '@/features/manufacturing/types/process.types';

type ProcessActivityTimelineProps = {
  items: ProcessActivityItem[];
};

export function ProcessActivityTimeline({ items }: ProcessActivityTimelineProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="text-xl">Activity timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
        {items.length === 0 ? (
          <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
            No process activity has been recorded yet.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-[12px_1fr] gap-3">
              <span className="mt-2 h-3 w-3 rounded-full bg-primary" />
              <div className="rounded-md border bg-background p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.occurredAt}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">By {item.actor}</p>
                {item.description ? (
                  <p className="mt-2 text-sm text-foreground">{item.description}</p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
