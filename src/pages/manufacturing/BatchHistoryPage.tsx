import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchBatchHistory, type BatchHistoryDto } from '@/api/manufacturing/batches.api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BatchHistoryPage() {
  const { batchId } = useParams();
  const [history, setHistory] = useState<BatchHistoryDto | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(Boolean(batchId));

  useEffect(() => {
    if (!batchId) {
      return;
    }

    const requestedBatchId = batchId;
    let isMounted = true;

    async function loadBatchHistory() {
      setIsLoading(true);
      setError(undefined);

      try {
        const data = await fetchBatchHistory(requestedBatchId);

        if (isMounted) {
          setHistory(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load batch history');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBatchHistory();

    return () => {
      isMounted = false;
    };
  }, [batchId]);

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Manufacturing
          </p>
          <Badge variant="outline">Placeholder</Badge>
          {isLoading ? <Badge variant="secondary">Loading</Badge> : null}
        </div>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Batch history</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Basic read-only history for batch lots and process steps.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-white p-4 text-sm text-red-600">
          Batch history API read failed. {error}
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{history?.batch_number ?? batchId ?? 'Batch'} timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {history ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <HistoryMetric label="Product" value={history.product_name} />
                <HistoryMetric label="Status" value={history.status} />
                <HistoryMetric label="Lots" value={String(history.lots.length)} />
              </div>
              <div className="space-y-3">
                {history.lots.map((lot) => (
                  <div key={lot.id} className="rounded-md border bg-background p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-foreground">{lot.lot_number}</p>
                      <Badge variant="secondary">{lot.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Quantity: {lot.quantity}</p>
                    <div className="mt-3 space-y-2">
                      {lot.steps.map((step) => (
                        <div key={step.id} className="rounded-md border bg-card p-3 text-sm">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-medium text-foreground">
                              {step.step_order}. {step.process_name}
                            </span>
                            <span className="text-muted-foreground">{step.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              Batch history will appear here when the backend returns data for this batch id.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

type HistoryMetricProps = {
  label: string;
  value: string;
};

function HistoryMetric({ label, value }: HistoryMetricProps) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
