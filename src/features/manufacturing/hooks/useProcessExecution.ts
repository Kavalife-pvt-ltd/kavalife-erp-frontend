import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchLotProcessStepById } from '@/api/manufacturing/lotProcessSteps.api';
import { fetchProcessDefinitionById } from '@/api/manufacturing/processDefinitions.api';
import {
  completeProcessExecution,
  createProcessExecution,
  fetchProcessExecutionInputs,
  fetchProcessExecutionOutputs,
  fetchProcessExecutionsByStepId,
  updateProcessExecutionProgress,
  type CompleteProcessExecutionPayload,
  type CreateProcessExecutionPayload,
  type ProcessExecutionDto,
  type ProcessExecutionInputDto,
  type ProcessExecutionOutputDto,
  type UpdateProcessExecutionProgressPayload,
} from '@/api/manufacturing/processExecutions.api';
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
  rawExecution?: ProcessExecutionDto;
  schema: ProcessFormSchema;
  initialValues: Record<string, ProcessFieldValue>;
  activity: ProcessActivityItem[];
  isLoading: boolean;
  error?: string;
  isUsingMockSchema: boolean;
  
  // Runtime Contract Added State
  inputs: ProcessExecutionInputDto[];
  outputs: ProcessExecutionOutputDto[];
  loading: boolean;
  submitting: boolean;
  savingProgress: boolean;
  completing: boolean;
};

export function useProcessExecution(stepId?: string) {
  const [state, setState] = useState<ProcessExecutionState>({
    processStep: temporaryWorkspaceStep,
    schema: temporarySchema,
    initialValues: temporaryInitialValues,
    activity: temporaryActivity,
    isLoading: Boolean(stepId),
    loading: Boolean(stepId),
    isUsingMockSchema: true,
    inputs: [],
    outputs: [],
    submitting: false,
    savingProgress: false,
    completing: false,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const resetError = useCallback(() => {
    setState((s) => ({ ...s, error: undefined }));
  }, []);

  const loadProcessExecution = useCallback(async () => {
    if (!stepId) return;
    
    setState((s) => ({ ...s, isLoading: true, loading: true, error: undefined }));
    try {
      const step = await fetchLotProcessStepById(stepId);
      const [definition, executions] = await Promise.all([
        fetchProcessDefinitionById(String(step.process_definition_id)),
        fetchProcessExecutionsByStepId(stepId).catch(() => []),
      ]);
      const latestExecution = executions[0];

      setState((s) => ({
        ...s,
        processStep: mapStepDetailToCard(step, definition, latestExecution),
        execution: latestExecution ? mapProcessExecution(latestExecution, step.process_code) : undefined,
        rawExecution: latestExecution,
        schema: mapProcessDefinitionSchema(definition, temporarySchema),
        initialValues: latestExecution ? mapExecutionValues(latestExecution) : {},
        activity: mapExecutionActivity(step, executions),
        isLoading: false,
        loading: false,
        isUsingMockSchema: !definition.defaultFormSchema,
      }));

      // If we have an execution, optionally fetch its inputs and outputs
      if (latestExecution?.id) {
        fetchProcessExecutionInputs(String(latestExecution.id))
          .then((inputs) => setState((s) => ({ ...s, inputs })))
          .catch(console.error);

        fetchProcessExecutionOutputs(String(latestExecution.id))
          .then((outputs) => setState((s) => ({ ...s, outputs })))
          .catch(console.error);
      }
    } catch (error) {
      setState((s) => ({
        ...s,
        processStep: { ...temporaryWorkspaceStep, stepId },
        schema: temporarySchema,
        initialValues: temporaryInitialValues,
        activity: temporaryActivity,
        isLoading: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load process execution',
        isUsingMockSchema: true,
      }));
    }
  }, [stepId]);

  useEffect(() => {
    void loadProcessExecution();
  }, [loadProcessExecution, refreshKey]);

  const refreshExecution = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const fetchInputs = useCallback(async () => {
    if (!state.rawExecution?.id) return;
    try {
      const inputs = await fetchProcessExecutionInputs(String(state.rawExecution.id));
      setState((s) => ({ ...s, inputs }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to fetch inputs' }));
    }
  }, [state.rawExecution?.id]);

  const fetchOutputs = useCallback(async () => {
    if (!state.rawExecution?.id) return;
    try {
      const outputs = await fetchProcessExecutionOutputs(String(state.rawExecution.id));
      setState((s) => ({ ...s, outputs }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to fetch outputs' }));
    }
  }, [state.rawExecution?.id]);

  const createExecution = useCallback(
    async (payload: CreateProcessExecutionPayload) => {
      setState((s) => ({ ...s, submitting: true, error: undefined }));
      try {
        const result = await createProcessExecution(payload);
        setState((s) => ({ ...s, rawExecution: result, submitting: false }));
        refreshExecution();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Create execution failed';
        setState((s) => ({ ...s, error: msg, submitting: false }));
        throw err;
      }
    },
    [refreshExecution]
  );

  const saveProgress = useCallback(
    async (payload: UpdateProcessExecutionProgressPayload) => {
      if (!state.rawExecution?.id) throw new Error('No active process execution to update');
      setState((s) => ({ ...s, savingProgress: true, error: undefined }));
      try {
        const result = await updateProcessExecutionProgress(String(state.rawExecution.id), payload);
        setState((s) => ({ ...s, rawExecution: result, savingProgress: false }));
        refreshExecution();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Save progress failed';
        setState((s) => ({ ...s, error: msg, savingProgress: false }));
        throw err;
      }
    },
    [state.rawExecution?.id, refreshExecution]
  );

  const completeExecution = useCallback(
    async (payload: CompleteProcessExecutionPayload) => {
      if (!state.rawExecution?.id) throw new Error('No active process execution to complete');
      setState((s) => ({ ...s, completing: true, error: undefined }));
      try {
        const result = await completeProcessExecution(String(state.rawExecution.id), payload);
        setState((s) => ({ ...s, rawExecution: result, completing: false }));
        refreshExecution();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Complete execution failed';
        setState((s) => ({ ...s, error: msg, completing: false }));
        throw err;
      }
    },
    [state.rawExecution?.id, refreshExecution]
  );

  return useMemo(
    () => ({
      ...state,
      refresh: refreshExecution,
      refreshExecution,
      createExecution,
      saveProgress,
      completeExecution,
      fetchInputs,
      fetchOutputs,
      resetError,
    }),
    [state, refreshExecution, createExecution, saveProgress, completeExecution, fetchInputs, fetchOutputs, resetError]
  );
}
