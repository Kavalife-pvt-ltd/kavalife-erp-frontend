import type { ReactNode } from 'react';
import { ArrowRight, CalendarCheck2, Clock, Package2, Play, UserRound } from 'lucide-react';

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
  onAction: (card: LotProcessStepCard) => void;
};

export function ProcessCard({ processStep, onAction }: ProcessCardProps) {
  const batchLotQuantityLabel = formatQuantity(processStep.quantity, processStep.unit);
  const executionQuantityLabel = formatOptionalQuantity(
    processStep.executionQuantityIn,
    processStep.unit
  );
  const outputQuantityLabel = formatOptionalQuantity(
    processStep.executionQuantityOut,
    processStep.unit
  );
  const hasExecution =
    processStep.status === 'in_progress' ||
    processStep.status === 'qa_pending' ||
    processStep.status === 'completed';
  const actionLabel = getCardActionLabel(processStep.status);

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
            <ProcessCardDetail label="Material" value={processStep.productName} />
            <ProcessCardDetail label="Source lot" value={processStep.lotNumber} />
            <ProcessCardDetail label="Batch/Lot Qty" value={batchLotQuantityLabel} />
            {executionQuantityLabel ? (
              <ProcessCardDetail label="Execution Qty" value={executionQuantityLabel} />
            ) : null}
            {outputQuantityLabel ? (
              <ProcessCardDetail label="Output Qty" value={outputQuantityLabel} />
            ) : null}
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
          <ProcessInlineDetail
            icon={<Package2 className="h-4 w-4 shrink-0" />}
            value={`Execution: ${hasExecution ? getProcessStatusLabel(processStep.status) : 'Not started'}`}
          />
          <div className="flex min-w-0 items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0" />
            <span className="truncate">Updated by {processStep.lastUpdatedBy}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="truncate">{processStep.lastUpdatedAt}</span>
          </div>
          {processStep.startedAt ? (
            <ProcessInlineDetail
              icon={<Play className="h-4 w-4 shrink-0" />}
              value={`Started ${processStep.startedAt}`}
            />
          ) : null}
          {processStep.completedAt ? (
            <ProcessInlineDetail
              icon={<CalendarCheck2 className="h-4 w-4 shrink-0" />}
              value={`Completed ${processStep.completedAt}`}
            />
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 sm:px-6">
        <Button
          size="lg"
          variant={processStep.status === 'ready' ? 'default' : 'outline'}
          className="min-h-12 w-full text-base"
          onClick={() => onAction(processStep)}
        >
          {actionLabel}
          <ArrowRight className="ml-2 h-5 w-5" />
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

type ProcessInlineDetailProps = {
  icon: ReactNode;
  value: string;
};

function ProcessInlineDetail({ icon, value }: ProcessInlineDetailProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon}
      <span className="truncate">{value}</span>
    </div>
  );
}

function getCardActionLabel(status: LotProcessStepCard['status']): string {
  if (status === 'ready') {
    return 'Start Process';
  }

  if (status === 'in_progress') {
    return 'Continue Workspace';
  }

  if (status === 'qa_pending') {
    return 'View QA/QC Status';
  }

  if (status === 'completed') {
    return 'View Summary';
  }

  return 'View Details';
}

function formatQuantity(quantity: number, unit: string): string {
  if (quantity > 0) {
    return `${quantity.toLocaleString()} ${unit}`;
  }

  return 'Not provided';
}

function formatOptionalQuantity(
  quantity: number | null | undefined,
  unit: string
): string | undefined {
  if (quantity === undefined || quantity === null) {
    return undefined;
  }

  return `${quantity.toLocaleString()} ${unit}`;
}
