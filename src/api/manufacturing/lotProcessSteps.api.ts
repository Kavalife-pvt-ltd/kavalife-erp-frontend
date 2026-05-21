import { api } from '@/api/client';
import { unwrapApiData, type ApiResponse } from '@/api/manufacturing/apiResponse';

export type ActiveLotProcessStepDto = {
  id: number;
  lot_id: number;
  lot_number: string;
  batch_id: number;
  batch_number: string;
  product_id: number;
  product_name: string;
  process_definition_id: number;
  process_code: string;
  process_name: string;
  step_order: number;
  status: string;
  started_at?: string | null;
  created_at: string;
};

export type LotProcessStepDetailDto = {
  id: number;
  lot_id: number;
  lot_number: string;
  batch_id: number;
  batch_number: string;
  workflow_step_id?: number | null;
  process_definition_id: number;
  process_code: string;
  process_name: string;
  step_order: number;
  status: string;
  retry_count: number;
  is_skipped: boolean;
  skip_reason?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProcessStepBoardCardDto = {
  stepId: number;
  processDefinitionId: number;
  processCode: string;
  processName: string;
  batchId: number;
  batchNumber: string;
  lotId: number;
  lotNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  status: string;
  currentStage: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  qaqcRequired: boolean;
};

export type ProcessStepBoardFilters = {
  processCode?: string;
  status?: string;
  batchNumber?: string;
  lotNumber?: string;
  productId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function fetchActiveLotProcessSteps(): Promise<ActiveLotProcessStepDto[]> {
  const response = await api.get<ApiResponse<ActiveLotProcessStepDto[]>>(
    '/v2/process-steps/active'
  );
  return unwrapApiData(response.data);
}

export async function fetchProcessStepBoard(
  filters: ProcessStepBoardFilters = {}
): Promise<ProcessStepBoardCardDto[]> {
  const response = await api.get<ApiResponse<ProcessStepBoardCardDto[]>>(
    '/v2/process-steps/board',
    {
      params: filters,
    }
  );
  return unwrapApiData(response.data);
}

export async function fetchLotProcessStepById(id: string): Promise<LotProcessStepDetailDto> {
  const response = await api.get<ApiResponse<LotProcessStepDetailDto>>(`/v2/process-steps/${id}`);
  return unwrapApiData(response.data);
}

export async function startLotProcessStep(
  id: string
): Promise<LotProcessStepDetailDto | undefined> {
  const response = await api.patch<
    ApiResponse<{ message: string; step?: LotProcessStepDetailDto }>
  >(`/v2/process-steps/${id}/start`);
  return unwrapApiData(response.data).step;
}
