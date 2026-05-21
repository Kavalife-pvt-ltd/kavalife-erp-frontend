import { useEffect, useMemo, useState } from 'react';

import { fetchLotProcessStepById } from '@/api/manufacturing/lotProcessSteps.api';
import { fetchProcessDefinitionById } from '@/api/manufacturing/processDefinitions.api';
import { fetchProcessExecutionsByStepId } from '@/api/manufacturing/processExecutions.api';
import type {
  ProcessFieldValue,
  ProcessFormSchema,
} from '@/features/manufacturing/types/formSchema.types';
import type {
  LotProcessStepCard,
  ProcessActivityItem,
  ProcessExecution,
} from '@/features/manufacturing/types/process.types';
import {
  mapExecutionActivity,
  mapExecutionValues,
  mapProcessDefinitionSchema,
  mapProcessExecution,
  mapStepDetailToCard,
} from '@/features/manufacturing/utils/processAdapters';

const temporaryWorkspaceStep: LotProcessStepCard = {
  stepId: 'step-ext-001',
  processDefinitionId: 'process-extraction',
  processName: 'Extraction',
  processCode: 'EXTRACTION',
  batchNumber: 'BATCH-2026-001',
  lotNumber: 'LOT-A1',
  productName: 'Kava Root Crude Extract',
  quantity: 240,
  unit: 'kg',
  status: 'in_progress',
  currentStage: 'Heating and wash log',
  lastUpdatedBy: 'Production Operator',
  lastUpdatedAt: '2026-05-15 14:20',
};

const temporarySchema: ProcessFormSchema = {
  id: 'schema-extraction-runtime-v1',
  processCode: 'EXTRACTION',
  version: 1,
  title: 'Runtime process form',
  description: 'Temporary schema used until process execution schemas are served by the backend.',
  sections: [
    {
      id: 'section-system',
      title: 'System context',
      description: 'Backend-owned values are visible to operators but cannot be edited here.',
      fields: [
        {
          id: 'field-operator',
          name: 'operatorName',
          label: 'Last updated by',
          type: 'text',
          backendOwned: true,
          readOnly: true,
        },
        {
          id: 'field-update-date',
          name: 'lastUpdatedAt',
          label: 'Last updated at',
          type: 'datetime',
          backendOwned: true,
          readOnly: true,
        },
      ],
    },
    {
      id: 'section-stage',
      title: 'Stage details',
      description: 'Generic runtime fields for the currently active process stage.',
      fields: [
        {
          id: 'field-vessel',
          name: 'vesselId',
          label: 'Vessel ID',
          type: 'text',
          placeholder: 'Enter vessel or equipment ID',
          required: true,
        },
        {
          id: 'field-notes',
          name: 'operatorNotes',
          label: 'Operator notes',
          type: 'textarea',
          placeholder: 'Add concise process notes',
        },
      ],
    },
  ],
};

const temporaryInitialValues: Record<string, ProcessFieldValue> = {
  operatorName: 'Production Operator',
  lastUpdatedAt: '2026-05-15T14:20',
  vesselId: 'VSL-04',
  operatorNotes: '',
};

const temporaryActivity: ProcessActivityItem[] = [
  {
    id: 'activity-001',
    label: 'Step activated',
    actor: 'System',
    occurredAt: '2026-05-15 10:05',
    description: 'Activated after GRN QA/QC completion.',
  },
];

type ProcessExecutionState = {
  processStep: LotProcessStepCard;
  execution?: ProcessExecution;
  schema: ProcessFormSchema;
  initialValues: Record<string, ProcessFieldValue>;
  activity: ProcessActivityItem[];
  isLoading: boolean;
  error?: string;
  isUsingMockSchema: boolean;
};

export function useProcessExecution(stepId?: string) {
  const [state, setState] = useState<ProcessExecutionState>({
    processStep: temporaryWorkspaceStep,
    schema: temporarySchema,
    initialValues: temporaryInitialValues,
    activity: temporaryActivity,
    isLoading: Boolean(stepId),
    isUsingMockSchema: true,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!stepId) {
      return;
    }

    const requestedStepId = stepId;
    let isMounted = true;

    async function loadProcessExecution() {
      setState((currentState) => ({ ...currentState, isLoading: true, error: undefined }));

      try {
        const step = await fetchLotProcessStepById(requestedStepId);
        const [definition, executions] = await Promise.all([
          fetchProcessDefinitionById(String(step.process_definition_id)),
          fetchProcessExecutionsByStepId(requestedStepId).catch(() => []),
        ]);
        const latestExecution = executions[0];

        if (!isMounted) {
          return;
        }

        setState({
          processStep: mapStepDetailToCard(step, definition, latestExecution),
          execution: latestExecution
            ? mapProcessExecution(latestExecution, step.process_code)
            : undefined,
          schema: mapProcessDefinitionSchema(definition, temporarySchema),
          initialValues: latestExecution ? mapExecutionValues(latestExecution) : {},
          activity: mapExecutionActivity(step, executions),
          isLoading: false,
          isUsingMockSchema: !definition.defaultFormSchema,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          processStep: { ...temporaryWorkspaceStep, stepId: requestedStepId },
          schema: temporarySchema,
          initialValues: temporaryInitialValues,
          activity: temporaryActivity,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load process execution',
          isUsingMockSchema: true,
        });
      }
    }

    void loadProcessExecution();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, stepId]);

  return useMemo(
    () => ({
      ...state,
      refresh: () => setRefreshKey((currentKey) => currentKey + 1),
    }),
    [state]
  );
}
