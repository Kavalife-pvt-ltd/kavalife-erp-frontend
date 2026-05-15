import { useMemo } from 'react';

import type {
  ProcessFieldValue,
  ProcessFormSchema,
} from '@/features/manufacturing/types/formSchema.types';
import type {
  LotProcessStepCard,
  ProcessActivityItem,
  ProcessExecution,
} from '@/features/manufacturing/types/process.types';

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
          id: 'field-temperature',
          name: 'targetTemperature',
          label: 'Target temperature',
          type: 'number',
          placeholder: 'Temperature',
        },
        {
          id: 'field-solvent',
          name: 'solventType',
          label: 'Solvent type',
          type: 'select',
          placeholder: 'Select solvent',
          options: [
            { label: 'Water', value: 'water' },
            { label: 'Ethanol', value: 'ethanol' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          id: 'field-notes',
          name: 'operatorNotes',
          label: 'Operator notes',
          type: 'textarea',
          placeholder: 'Add concise process notes',
        },
        {
          id: 'field-stage-check',
          name: 'stageCheckComplete',
          label: 'Stage check complete',
          type: 'checkbox',
          placeholder: 'Required checks are complete',
        },
      ],
    },
    {
      id: 'section-wash-log',
      title: 'Repeatable process log',
      description: 'Use this for wash logs, heating logs, recovery logs, or similar runtime rows.',
      fields: [
        {
          id: 'field-wash-log',
          name: 'washLog',
          label: 'Wash log',
          type: 'repeatable_table',
          columns: [
            {
              id: 'wash-time',
              name: 'time',
              label: 'Time',
              type: 'time',
            },
            {
              id: 'wash-temp',
              name: 'temperature',
              label: 'Temp',
              type: 'number',
              placeholder: 'C',
            },
            {
              id: 'wash-notes',
              name: 'notes',
              label: 'Notes',
              type: 'text',
              placeholder: 'Observation',
            },
          ],
        },
      ],
    },
  ],
};

const temporaryInitialValues: Record<string, ProcessFieldValue> = {
  operatorName: 'Production Operator',
  lastUpdatedAt: '2026-05-15T14:20',
  vesselId: 'VSL-04',
  targetTemperature: 68,
  solventType: 'ethanol',
  operatorNotes: '',
  stageCheckComplete: false,
  washLog: [{ time: '14:00', temperature: 66, notes: 'Initial heating check' }],
};

const temporaryActivity: ProcessActivityItem[] = [
  {
    id: 'activity-001',
    label: 'Step activated',
    actor: 'System',
    occurredAt: '2026-05-15 10:05',
    description: 'Activated after GRN QA/QC completion.',
  },
  {
    id: 'activity-002',
    label: 'Progress saved',
    actor: 'Production Operator',
    occurredAt: '2026-05-15 14:20',
    description: 'Heating stage values updated.',
  },
];

export function useProcessExecution(stepId?: string) {
  return useMemo(() => {
    const execution: ProcessExecution = {
      executionId: `execution-${stepId ?? temporaryWorkspaceStep.stepId}`,
      stepId: stepId ?? temporaryWorkspaceStep.stepId,
      processCode: temporaryWorkspaceStep.processCode,
      status: temporaryWorkspaceStep.status,
      currentStage: temporaryWorkspaceStep.currentStage,
      startedAt: '2026-05-15 10:05',
      values: temporaryInitialValues,
    };

    return {
      processStep: { ...temporaryWorkspaceStep, stepId: stepId ?? temporaryWorkspaceStep.stepId },
      execution,
      schema: temporarySchema,
      initialValues: temporaryInitialValues,
      activity: temporaryActivity,
      isUsingMockSchema: true,
    };
  }, [stepId]);
}
