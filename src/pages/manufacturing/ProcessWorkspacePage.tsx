import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import type { CompleteProcessExecutionPayload } from '@/api/manufacturing/processExecutions.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompleteProcessDialog } from '@/features/manufacturing/components/CompleteProcessDialog';
import { ConsumedInputsList } from '@/features/manufacturing/components/ConsumedInputsList';
import { ProcessActionBar } from '@/features/manufacturing/components/ProcessActionBar';
import { ProcessActivityTimeline } from '@/features/manufacturing/components/ProcessActivityTimeline';
import { ProcessWorkspaceHeader } from '@/features/manufacturing/components/ProcessWorkspaceHeader';
import { ProducedOutputsList } from '@/features/manufacturing/components/ProducedOutputsList';
import { DynamicProcessForm } from '@/features/manufacturing/dynamic-form/DynamicProcessForm';
import { useProcessExecution } from '@/features/manufacturing/hooks/useProcessExecution';
import type { ProcessFieldValue } from '@/features/manufacturing/types/formSchema.types';
import { manufacturingRoutes } from '@/features/manufacturing/utils/processRoutes';

export function ProcessWorkspacePage() {
  const navigate = useNavigate();
  const { stepId } = useParams();
  const {
    processStep,
    execution,
    schema,
    initialValues,
    activity,
    isLoading,
    error,
    isUsingMockSchema,
    inputs,
    outputs,
    loading,
    savingProgress,
    completing,
    saveProgress,
    completeExecution,
    resetError,
  } = useProcessExecution(stepId);
  
  const [latestValues, setLatestValues] = useState<Record<string, ProcessFieldValue>>(initialValues);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  useEffect(() => {
    setLatestValues(initialValues);
  }, [initialValues]);

  const handleSaveProgress = async () => {
    if (!stepId || !execution) return;
    
    resetError();
    try {
      await saveProgress({
        quantityIn: getNumericValue(latestValues, ['quantityIn', 'quantity_in']),
        formData: latestValues,
        equipmentUsed: getRecordValue(latestValues.equipmentUsed),
        operatorNotes: getStringValue(latestValues.operatorNotes),
      });
      toast.success('Progress saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save progress');
    }
  };

  const handleCompleteProcess = async (payload: CompleteProcessExecutionPayload) => {
    if (!stepId || !execution) return;
    
    resetError();
    try {
      await completeExecution({
        ...payload,
        formData: latestValues,
        equipmentUsed: getRecordValue(latestValues.equipmentUsed),
        operatorNotes: getStringValue(latestValues.operatorNotes),
        supervisorNotes: getStringValue(latestValues.supervisorNotes),
      });
      toast.success('Process completed.');
      setIsCompleteDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete process');
    }
  };

  const handleCompleteStage = () => {
    toast('Stage-level completion is waiting for backend schema support.');
  };

  const isAwaitingQaQc = processStep.status === 'qa_pending' || outputs.some((o) => o.status === 'under_qaqc');
  const isReady = !isLoading && !loading;

  return (
    <section className="space-y-6 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Process workspace
          </p>
          {isUsingMockSchema ? <Badge variant="outline">Temporary mock schema</Badge> : null}
          {!isReady ? <Badge variant="secondary">Loading</Badge> : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => navigate(manufacturingRoutes.boardForProcess(processStep.processCode))}
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Processes
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Error: {error}
        </div>
      ) : null}

      {isAwaitingQaQc && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-500 font-medium">
          This process is awaiting QA/QC approval. Outputs are currently Under QA/QC.
        </div>
      )}

      {isReady && !execution ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-xl font-semibold text-foreground">No active execution found</p>
            <p className="text-muted-foreground">
              No process job has been started for this step. Please start it from the process board.
            </p>
            <Button
              variant="default"
              onClick={() => navigate(manufacturingRoutes.boardForProcess(processStep.processCode))}
            >
              Go to Process Board
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {execution && (
        <>
          <ProcessWorkspaceHeader processStep={processStep} />
          
          <ConsumedInputsList inputs={inputs} />
          <ProducedOutputsList outputs={outputs} />
          
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <DynamicProcessForm
              schema={schema}
              initialValues={initialValues}
              onChange={setLatestValues}
            />
            <ProcessActivityTimeline items={activity} />
          </div>

          <ProcessActionBar
            onSaveProgress={handleSaveProgress}
            onCompleteStage={handleCompleteStage}
            onCompleteProcess={() => setIsCompleteDialogOpen(true)}
            isSaving={savingProgress}
          />
        </>
      )}

      <CompleteProcessDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        onConfirm={handleCompleteProcess}
        isCompleting={completing}
        unitOfMeasure={processStep.unit}
        targetProductId={1}
      />
    </section>
  );
}

function getNumericValue(
  values: Record<string, ProcessFieldValue>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = values[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsedValue = Number(value);
      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
}

function getStringValue(value: ProcessFieldValue | undefined): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function getRecordValue(value: ProcessFieldValue | undefined): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  return undefined;
}
