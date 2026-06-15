import { api } from '@/api/client';
import { unwrapApiData, type ApiResponse } from '@/api/manufacturing/apiResponse';

export type BatchHistoryStepDto = {
  id: number;
  process_name: string;
  step_order: number;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
};

export type BatchHistoryLotDto = {
  id: number;
  lot_number: string;
  quantity: number;
  status: string;
  steps: BatchHistoryStepDto[];
};

export type BatchHistoryDto = {
  id: number;
  batch_number: string;
  product_name: string;
  status: string;
  lots: BatchHistoryLotDto[];
};

export async function fetchBatchHistory(batchId: string): Promise<BatchHistoryDto> {
  const response = await api.get<ApiResponse<BatchHistoryDto>>(`/v2/batches/${batchId}/history`);
  return unwrapApiData(response.data);
}
