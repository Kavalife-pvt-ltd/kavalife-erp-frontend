// src/api/sales.ts
import { SalesPO, SalesPOStatusLog, SalesPOStatus } from '@/types/sales';
import axios from 'axios';

export interface ListSalesPOParams {
  status?: SalesPOStatus;
  salesRepId?: number;
  productId?: number;
}

export async function createSalesPO(payload: unknown) {
  // TODO: define proper request type once form is ready
  const res = await axios.post('/sales-po', payload);
  return res.data as { success: boolean; data: SalesPO };
}

export async function listSalesPO(params?: ListSalesPOParams) {
  const res = await axios.get('/sales-po', { params });
  return res.data as { success: boolean; data: SalesPO[] };
}

export async function getSalesPO(id: number) {
  const res = await axios.get(`/sales-po/${id}`);
  return res.data as { success: boolean; data: SalesPO };
}

export interface UpdateSalesPOStatusPayload {
  toStatus: SalesPOStatus;
  newQuantity?: number;
  newAskingPrice?: number;
  newComments?: string;
  rejectionReason?: string;
  fulfillmentType?: 'purchase' | 'production';
  deliveryCode?: string;
}

export async function updateSalesPOStatus(id: number, payload: UpdateSalesPOStatusPayload) {
  const res = await axios.patch(`/sales-po/${id}/status`, payload);
  return res.data as { success: boolean; data: SalesPO };
}

export async function getSalesPOStatusLog(id: number) {
  const res = await axios.get(`/sales-po/${id}/status-log`);
  return res.data as { success: boolean; data: SalesPOStatusLog[] };
}

// Purchase queue (masked results from backend)
export async function listPurchaseQueue() {
  const res = await axios.get('/sales-po/purchase-queue');
  return res.data as { success: boolean; data: SalesPO[] };
}

// Production queue (masked results from backend)
export async function listProductionQueue() {
  const res = await axios.get('/sales-po/production-queue');
  return res.data as { success: boolean; data: SalesPO[] };
}
