import { ArrowRight, Clock, Package2, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { LotProcessStepCard } from '@/features/manufacturing/types/process.types';
import {
  getProcessStatusClassName,
  getProcessStatusLabel,
  getProcessStatusTone,
} from '@/features/manufacturing/utils/processStatus';

type ProcessCardProps = {
  processStep: LotProcessStepCard;
  onOpen: (stepId: string) => void;
};

export function ProcessCard({ processStep, onOpen }: ProcessCardProps) {
  const quantityLabel =
    processStep.quantity > 0
      ? `${processStep.quantity.toLocaleString()} ${processStep.unit}`
      : 'Not provided';

  return (
    <Card className="flex min-h-80 flex-col border-border bg-card shadow-sm">
      <CardHeader className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
              {processStep.processCode}
            </p>
            <CardTitle className="mt-1 text-2xl leading-tight text-card-foreground">
              {processStep.processName}
            </CardTitle>
          </div>
          <Badge
            variant={getProcessStatusTone(processStep.status)}
            className={getProcessStatusClassName(processStep.status)}
          >
            {getProcessStatusLabel(processStep.status)}
          </Badge>
        </div>

        <div className="rounded-md border bg-background p-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <ProcessCardDetail label="Batch" value={processStep.batchNumber} />
            <ProcessCardDetail label="Lot" value={processStep.lotNumber} />
            <ProcessCardDetail label="Product" value={processStep.productName} />
            <ProcessCardDetail label="Quantity" value={quantityLabel} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5 sm:px-6">
        <div className="flex items-center gap-3 rounded-md bg-secondary p-4 text-secondary-foreground">
          <Package2 className="h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Current stage
            </p>
            <p className="truncate text-lg font-semibold">{processStep.currentStage}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0" />
            <span className="truncate">Updated by {processStep.lastUpdatedBy}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="truncate">{processStep.lastUpdatedAt}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 sm:px-6">
        <Button
          size="lg"
          className="min-h-12 w-full text-base"
          onClick={() => onOpen(processStep.stepId)}
        >
          {processStep.status === 'pending' ? 'Open' : 'Continue'}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

type ProcessCardDetailProps = {
  label: string;
  value: string;
};

function ProcessCardDetail({ label, value }: ProcessCardDetailProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="truncate text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
