import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessCard } from '@/features/manufacturing/components/ProcessCard';
import { ProcessTabs } from '@/features/manufacturing/components/ProcessTabs';
import { useProcessBoard } from '@/features/manufacturing/hooks/useProcessBoard';
import { manufacturingRoutes } from '@/features/manufacturing/utils/processRoutes';

export function ProcessBoardPage() {
  const navigate = useNavigate();
  const { processCode: processCodeParam } = useParams();
  const [searchParams] = useSearchParams();
  const queryProcessCode = searchParams.get('processCode') ?? undefined;
  const requestedProcessCode = processCodeParam ?? queryProcessCode;
  const { processes, activeProcessCode, activeProcess, cards, isUsingMockData, isLoading, error } =
    useProcessBoard(requestedProcessCode);
  const firstBatchId = cards.find((card) => card.batchId)?.batchId;

  return (
    <section className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
              Manufacturing
            </p>
            {isUsingMockData ? <Badge variant="outline">Temporary mock data</Badge> : null}
            {isLoading ? <Badge variant="secondary">Loading</Badge> : null}
          </div>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Dynamic process board</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            A generic runtime board that renders process work by process code.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!firstBatchId}
          onClick={() => {
            if (firstBatchId) {
              navigate(manufacturingRoutes.batchHistory(firstBatchId));
            }
          }}
        >
          Batch History
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/40 bg-card">
          <CardContent className="p-4 text-sm text-destructive">
            Real manufacturing API read failed. Showing temporary fallback data. {error}
          </CardContent>
        </Card>
      ) : null}

      <ProcessTabs processes={processes} activeProcessCode={activeProcessCode} />

      <div className="rounded-md border bg-card p-4 text-card-foreground">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selected process</p>
            <p className="text-xl font-semibold">
              {activeProcess?.processName ?? activeProcessCode}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {activeProcessCode}
              </span>
            </p>
          </div>
          <Badge variant="secondary">{cards.length} active cards</Badge>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold text-foreground">No active runtime cards</p>
            <p className="mt-2 text-muted-foreground">
              The backend will populate this board with active lot process steps.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {cards.map((card) => (
            <ProcessCard
              key={card.stepId}
              processStep={card}
              onOpen={(stepId) => navigate(manufacturingRoutes.workspace(stepId))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
