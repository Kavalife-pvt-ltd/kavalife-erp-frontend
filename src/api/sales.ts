import type { SalesPO, SalesPOStatus, SalesPOStatusLog, CreateSalesPORequest } from '@/types/sales';
import { api } from '@/api/client';

export type SalesQueue = 'sales' | 'admin' | 'purchase' | 'production';

export interface ListSalesPOParams {
  status?: SalesPOStatus;
  salesRepId?: number;
  sendTo?: SalesQueue;
}

export async function createSalesPO(payload: CreateSalesPORequest): Promise<SalesPO> {
  const resp = await api.post('/sales-po/create', payload);
  return (resp.data?.data ?? resp.data) as SalesPO;
}

export async function listSalesPO(params: ListSalesPOParams = {}): Promise<SalesPO[]> {
  const resp = await api.get('/sales-po/view', {
    params: {
      ...(params.status ? { status: params.status } : {}),
      ...(typeof params.salesRepId === 'number' ? { salesRepId: params.salesRepId } : {}),
      ...(params.sendTo ? { sendTo: params.sendTo } : {}),
    },
  });

  const payload = resp.data?.data ?? resp.data;
  return Array.isArray(payload) ? (payload as SalesPO[]) : [];
}

export async function getSalesPOById(id: number): Promise<SalesPO> {
  const resp = await api.get(`/sales-po/${id}`);
  return (resp.data?.data ?? resp.data) as SalesPO;
}

export type UpdateSalesPOStatusRequest = {
  toStatus: SalesPOStatus;
  newQuantity?: number;
  newAskingPrice?: number;
  purchasePrice?: number;
  newComments?: string;
  rejectionReason?: string;
  fulfillmentType?: 'purchase' | 'production';
  deliveryCode?: string;
  sendTo?: SalesQueue;
};

export async function updateSalesPOStatus(
  id: number,
  payload: UpdateSalesPOStatusRequest
): Promise<SalesPO> {
  const resp = await api.patch(`/sales-po/${id}/status`, payload);
  return (resp.data?.data ?? resp.data) as SalesPO;
}

export async function getSalesPOStatusLog(id: number): Promise<SalesPOStatusLog[]> {
  const resp = await api.get(`/sales-po/${id}/status-log`);

  const payload = resp.data?.data ?? resp.data;
  return Array.isArray(payload) ? (payload as SalesPOStatusLog[]) : [];
}
