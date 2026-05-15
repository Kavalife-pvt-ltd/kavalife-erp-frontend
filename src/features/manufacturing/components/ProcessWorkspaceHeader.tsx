import { Clock, Package2, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { LotProcessStepCard } from '@/features/manufacturing/types/process.types';
import {
  getProcessStatusClassName,
  getProcessStatusLabel,
  getProcessStatusTone,
} from '@/features/manufacturing/utils/processStatus';

type ProcessWorkspaceHeaderProps = {
  processStep: LotProcessStepCard;
};

export function ProcessWorkspaceHeader({ processStep }: ProcessWorkspaceHeaderProps) {
  const quantityLabel = `${processStep.quantity.toLocaleString()} ${processStep.unit}`;

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
              {processStep.processCode}
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground">
              {processStep.processName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{processStep.currentStage}</p>
          </div>
          <Badge
            variant={getProcessStatusTone(processStep.status)}
            className={getProcessStatusClassName(processStep.status)}
          >
            {getProcessStatusLabel(processStep.status)}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <HeaderMetric label="Batch" value={processStep.batchNumber} />
          <HeaderMetric label="Lot" value={processStep.lotNumber} />
          <HeaderMetric label="Product" value={processStep.productName} />
          <HeaderMetric label="Quantity" value={quantityLabel} />
        </div>

        <div className="grid gap-3 border-t pt-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>Updated by {processStep.lastUpdatedBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{processStep.lastUpdatedAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-background p-3 text-sm text-muted-foreground">
          <Package2 className="h-4 w-4 shrink-0" />
          <span>Backend-owned user and date fields are display-only in this workspace.</span>
        </div>
      </CardContent>
    </Card>
  );
}

type HeaderMetricProps = {
  label: string;
  value: string;
};

function HeaderMetric({ label, value }: HeaderMetricProps) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
