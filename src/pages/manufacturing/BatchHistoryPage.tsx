import { useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BatchHistoryPage() {
  const { batchId } = useParams();

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Manufacturing
          </p>
          <Badge variant="outline">Placeholder</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Batch history</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Basic placeholder for the VIR to GRN to QA/QC to process execution history.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{batchId ?? 'Batch'} timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Deep implementation will be added after the backend runtime history API shape is
            confirmed.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
