import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  completeProcessExecution,
  createProcessExecution,
  updateProcessExecutionProgress,
} from '@/api/manufacturing/processExecutions.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProcessActionBar } from '@/features/manufacturing/components/ProcessActionBar';
import { ProcessActivityTimeline } from '@/features/manufacturing/components/ProcessActivityTimeline';
import { ProcessWorkspaceHeader } from '@/features/manufacturing/components/ProcessWorkspaceHeader';
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
    refresh,
  } = useProcessExecution(stepId);
  const [latestValues, setLatestValues] =
    useState<Record<string, ProcessFieldValue>>(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLatestValues(initialValues);
  }, [initialValues]);

  const handleSaveProgress = async () => {
    if (!stepId) {
      return;
    }

    if (execution) {
      setIsSaving(true);
      try {
        await updateProcessExecutionProgress(execution.executionId, {
          quantityIn: getNumericValue(latestValues, ['quantityIn', 'quantity_in']),
          formData: latestValues,
          equipmentUsed: getRecordValue(latestValues.equipmentUsed),
          operatorNotes: getStringValue(latestValues.operatorNotes),
        });
        toast.success('Progress saved.');
        refresh();
      } catch (saveError) {
        toast.error(saveError instanceof Error ? saveError.message : 'Failed to save progress');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    try {
      await createProcessExecution({
        lotProcessStepId: Number(stepId),
        quantityIn: getNumericValue(latestValues, ['quantityIn', 'quantity_in']),
        formData: latestValues,
        equipmentUsed: getRecordValue(latestValues.equipmentUsed),
        operatorNotes: getStringValue(latestValues.operatorNotes),
      });
      toast.success('Process execution started and progress saved.');
      refresh();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteStage = () => {
    toast('Stage-level completion is waiting for backend schema support.');
    console.info(
      'TODO Complete Stage requires internal stage schema/API support',
      processStep.stepId
    );
  };

  const handleCompleteProcess = async () => {
    if (!stepId) {
      return;
    }

    if (!execution) {
      toast.error('Save progress before completing this process.');
      return;
    }

    setIsSaving(true);
    try {
      await completeProcessExecution(execution.executionId, {
        quantityOut: getNumericValue(latestValues, [
          'quantityOut',
          'quantity_out',
          'outputQuantity',
        ]),
        quantityLoss: getNumericValue(latestValues, ['quantityLoss', 'quantity_loss']) ?? 0,
        lossReason: getStringValue(latestValues.lossReason),
        formData: latestValues,
        equipmentUsed: getRecordValue(latestValues.equipmentUsed),
        operatorNotes: getStringValue(latestValues.operatorNotes),
        supervisorNotes: getStringValue(latestValues.supervisorNotes),
      });
      toast.success('Process completed. Workspace refreshed.');
      refresh();
    } catch (completeError) {
      toast.error(
        completeError instanceof Error ? completeError.message : 'Failed to complete process'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Process workspace
          </p>
          {isUsingMockSchema ? <Badge variant="outline">Temporary mock schema</Badge> : null}
          {isLoading ? <Badge variant="secondary">Loading</Badge> : null}
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
        <div className="rounded-md border border-destructive/40 bg-card p-4 text-sm text-destructive">
          Real manufacturing API read failed. Showing temporary fallback schema. {error}
        </div>
      ) : null}

      <ProcessWorkspaceHeader processStep={processStep} />

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
        onCompleteProcess={handleCompleteProcess}
        isSaving={isSaving}
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
