import { api } from '@/api/client';
import { unwrapApiData, type ApiResponse } from '@/api/manufacturing/apiResponse';

export type ProcessExecutionInputDto = {
  id: number;
  inventoryLotId: number;
  lotNumber: string;
  productId: number;
  productName?: string;
  batchId?: number | null;
  quantityConsumed: number;
  balanceAfter?: number;
  unitOfMeasure: string;
  inventoryTransactionId: number;
};

export type ProcessExecutionOutputDto = {
  id: number;
  inventoryLotId: number;
  lotNumber: string;
  productId: number;
  productName?: string;
  quantityProduced: number;
  unitOfMeasure: string;
  inventoryType: string;
  status: string;
  inventoryTransactionId: number;
};

export type ProcessExecutionDto = {
  id: number;
  lotProcessStepId?: number | null;
  quantityIn?: number | null;
  quantityOut?: number | null;
  quantityLoss?: number | null;
  lossReason?: string | null;
  yieldPercent?: number | null;
  formData?: unknown;
  formDataVersion?: number;
  equipmentUsed?: unknown;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMinutes?: number | null;
  completedBy?: number | null;
  verifiedBy?: number | null;
  verifiedAt?: string | null;
  operatorNotes?: string | null;
  supervisorNotes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  inputs?: ProcessExecutionInputDto[];
  outputs?: ProcessExecutionOutputDto[];
  lineageCount?: number;
};

export type CreateProcessExecutionInputPayload = {
  inventoryLotId: number;
  quantity: number;
};

export type CreateProcessExecutionPayload = {
  batchId?: number;
  processCode?: string;
  processDefinitionId?: number;
  lotProcessStepId?: number; // legacy support
  quantityIn?: number; // legacy support
  inputs?: CreateProcessExecutionInputPayload[];
  formData?: unknown;
  equipmentUsed?: unknown;
  operatorNotes?: string;
};

export type CompleteProcessExecutionOutputPayload = {
  productId: number;
  quantity: number;
  unitOfMeasure: string;
  inventoryType: string;
  currentLocation?: string;
  notes?: string;
};

export type CompleteProcessExecutionPayload = {
  quantityOut?: number;
  quantityLoss?: number;
  lossReason?: string;
  formData?: unknown;
  equipmentUsed?: unknown;
  operatorNotes?: string;
  supervisorNotes?: string;
  outputs?: CompleteProcessExecutionOutputPayload[];
};

export type UpdateProcessExecutionProgressPayload = {
  quantityIn?: number;
  formData?: unknown;
  equipmentUsed?: unknown;
  operatorNotes?: string;
};

export async function createProcessExecution(
  payload: CreateProcessExecutionPayload
): Promise<ProcessExecutionDto> {
  const response = await api.post<ApiResponse<ProcessExecutionDto>>(
    '/v2/process-executions',
    payload
  );
  return unwrapApiData(response.data);
}

export async function fetchProcessExecutionById(id: string): Promise<ProcessExecutionDto> {
  const response = await api.get<ApiResponse<ProcessExecutionDto>>(`/v2/process-executions/${id}`);
  return unwrapApiData(response.data);
}

export async function fetchProcessExecutionsByStepId(
  stepId: string
): Promise<ProcessExecutionDto[]> {
  const response = await api.get<ApiResponse<ProcessExecutionDto[]>>(
    `/v2/process-executions/step/${stepId}`
  );
  return unwrapApiData(response.data);
}

export async function updateProcessExecutionProgress(
  id: string,
  payload: UpdateProcessExecutionProgressPayload
): Promise<ProcessExecutionDto> {
  const response = await api.patch<ApiResponse<ProcessExecutionDto>>(
    `/v2/process-executions/${id}/progress`,
    payload
  );
  return unwrapApiData(response.data);
}

export async function completeProcessExecution(
  id: string,
  payload: CompleteProcessExecutionPayload
): Promise<ProcessExecutionDto> {
  const response = await api.patch<ApiResponse<ProcessExecutionDto>>(
    `/v2/process-executions/${id}/complete`,
    payload
  );
  return unwrapApiData(response.data);
}

export async function fetchProcessExecutionInputs(
  id: string
): Promise<ProcessExecutionInputDto[]> {
  const response = await api.get<ApiResponse<ProcessExecutionInputDto[]>>(
    `/v2/process-executions/${id}/inputs`
  );
  return unwrapApiData(response.data);
}

export async function fetchProcessExecutionOutputs(
  id: string
): Promise<ProcessExecutionOutputDto[]> {
  const response = await api.get<ApiResponse<ProcessExecutionOutputDto[]>>(
    `/v2/process-executions/${id}/outputs`
  );
  return unwrapApiData(response.data);
}
