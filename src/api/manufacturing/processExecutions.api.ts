import { api } from '@/api/client';
import { unwrapApiData, type ApiResponse } from '@/api/manufacturing/apiResponse';

export type ProcessExecutionDto = {
  id: number;
  lotProcessStepId: number;
  quantityIn?: number | null;
  quantityOut?: number | null;
  quantityLoss: number;
  lossReason?: string | null;
  yieldPercent?: number | null;
  formData?: unknown;
  formDataVersion: number;
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
};

export type CreateProcessExecutionPayload = {
  lotProcessStepId: number;
  quantityIn?: number;
  formData?: unknown;
  equipmentUsed?: unknown;
  operatorNotes?: string;
};

export type CompleteProcessExecutionPayload = {
  quantityOut?: number;
  quantityLoss: number;
  lossReason?: string;
  formData?: unknown;
  equipmentUsed?: unknown;
  operatorNotes?: string;
  supervisorNotes?: string;
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
