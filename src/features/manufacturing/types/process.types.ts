export type ProcessStatus =
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'blocked'
  | 'qa_pending'
  | 'completed';

export type ProcessDefinition = {
  id: string;
  processCode: string;
  processName: string;
  sequence: number;
  description?: string;
  isActive: boolean;
};

export type LotProcessStepCard = {
  stepId: string;
  processDefinitionId: string;
  processName: string;
  processCode: string;
  batchId?: string;
  batchNumber: string;
  lotId?: string;
  lotNumber: string;
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  executionQuantityIn?: number;
  executionQuantityOut?: number;
  status: ProcessStatus;
  currentStage: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  startedAt?: string;
  completedAt?: string;
  qaqcRequired?: boolean;
};

export type ProcessExecution = {
  executionId: string;
  stepId: string;
  processCode: string;
  status: ProcessStatus;
  currentStage: string;
  startedAt?: string;
  completedAt?: string;
  values: Record<string, unknown>;
};

export type ProcessActivityItem = {
  id: string;
  label: string;
  actor: string;
  occurredAt: string;
  description?: string;
};
