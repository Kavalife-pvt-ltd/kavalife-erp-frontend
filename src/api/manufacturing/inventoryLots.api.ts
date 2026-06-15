import { api } from '@/api/client';
import { unwrapApiData, type ApiResponse } from '@/api/manufacturing/apiResponse';

export type InventoryLotDto = {
  id: number;
  lotNumber: string;
  productId: number;
  productName?: string;
  batchId?: number | null;
  batchNumber?: string | null;
  status: string;
  inventoryType: string;
  sourceType?: string | null;
  sourceGrnId?: number | null;
  sourceProcessExecutionId?: number | null;
  grnNumber?: string | null;
  processCode?: string | null;
  processName?: string | null;
  currentLocation?: string | null;
  originalQuantity: number;
  availableQuantity: number;
  unitOfMeasure: string;
  notes?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
};

type RawInventoryLotDto = {
  id?: number;
  lot_number?: string;
  lotNumber?: string;
  product_id?: number;
  productId?: number;
  product_name?: string;
  productName?: string;
  batch_id?: number | null;
  batchId?: number | null;
  batch_number?: string | null;
  batchNumber?: string | null;
  status?: string;
  inventory_type?: string;
  inventoryType?: string;
  source_type?: string | null;
  sourceType?: string | null;
  source_grn_id?: number | null;
  sourceGrnId?: number | null;
  source_process_execution_id?: number | null;
  sourceProcessExecutionId?: number | null;
  grn_number?: string | null;
  grnNumber?: string | null;
  process_code?: string | null;
  processCode?: string | null;
  process_name?: string | null;
  processName?: string | null;
  current_location?: string | null;
  currentLocation?: string | null;
  original_quantity?: number;
  originalQuantity?: number;
  quantity?: number;
  available_quantity?: number;
  availableQuantity?: number;
  unit_of_measure?: string;
  unitOfMeasure?: string;
  notes?: string | null;
  created_by_name?: string | null;
  createdByName?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export async function fetchInventoryLots(
  params?: Record<string, string | number | boolean>
): Promise<InventoryLotDto[]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {})
  ).toString();
  const endpoint = query ? `/v2/inventory-lots?${query}` : '/v2/inventory-lots';
  const response = await api.get<ApiResponse<RawInventoryLotDto[]>>(endpoint);
  return unwrapApiData(response.data).map(mapInventoryLot);
}

function mapInventoryLot(raw: RawInventoryLotDto): InventoryLotDto {
  return {
    id: raw.id ?? 0,
    lotNumber: raw.lotNumber ?? raw.lot_number ?? '',
    productId: raw.productId ?? raw.product_id ?? 0,
    productName: raw.productName ?? raw.product_name,
    batchId: raw.batchId ?? raw.batch_id ?? null,
    batchNumber: raw.batchNumber ?? raw.batch_number ?? null,
    status: raw.status ?? '',
    inventoryType: raw.inventoryType ?? raw.inventory_type ?? '',
    sourceType: raw.sourceType ?? raw.source_type ?? null,
    sourceGrnId: raw.sourceGrnId ?? raw.source_grn_id ?? null,
    sourceProcessExecutionId:
      raw.sourceProcessExecutionId ?? raw.source_process_execution_id ?? null,
    grnNumber: raw.grnNumber ?? raw.grn_number ?? null,
    processCode: raw.processCode ?? raw.process_code ?? null,
    processName: raw.processName ?? raw.process_name ?? null,
    currentLocation: raw.currentLocation ?? raw.current_location ?? null,
    originalQuantity: raw.originalQuantity ?? raw.original_quantity ?? raw.quantity ?? 0,
    availableQuantity: raw.availableQuantity ?? raw.available_quantity ?? 0,
    unitOfMeasure: raw.unitOfMeasure ?? raw.unit_of_measure ?? '',
    notes: raw.notes ?? null,
    createdByName: raw.createdByName ?? raw.created_by_name ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
  };
}
