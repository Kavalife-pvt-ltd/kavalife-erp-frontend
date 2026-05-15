import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { ProcessActionBar } from '@/features/manufacturing/components/ProcessActionBar';
import { ProcessActivityTimeline } from '@/features/manufacturing/components/ProcessActivityTimeline';
import { ProcessWorkspaceHeader } from '@/features/manufacturing/components/ProcessWorkspaceHeader';
import { DynamicProcessForm } from '@/features/manufacturing/dynamic-form/DynamicProcessForm';
import { useProcessExecution } from '@/features/manufacturing/hooks/useProcessExecution';
import type { ProcessFieldValue } from '@/features/manufacturing/types/formSchema.types';

export function ProcessWorkspacePage() {
  const { stepId } = useParams();
  const { processStep, schema, initialValues, activity, isUsingMockSchema } =
    useProcessExecution(stepId);
  const [latestValues, setLatestValues] =
    useState<Record<string, ProcessFieldValue>>(initialValues);

  const handleSaveProgress = () => {
    console.info('Save Progress placeholder', latestValues);
  };

  const handleCompleteStage = () => {
    console.info('Complete Stage placeholder', processStep.stepId);
  };

  const handleCompleteProcess = () => {
    console.info('Complete Process placeholder', processStep.stepId);
  };

  return (
    <section className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
          Process workspace
        </p>
        {isUsingMockSchema ? <Badge variant="outline">Temporary mock schema</Badge> : null}
      </div>

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
      />
    </section>
  );
}
