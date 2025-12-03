// src/api/sales.ts
import axios from 'axios';
import type { SalesPO, SalesPOStatus, SalesPOStatusLog, CreateSalesPORequest } from '@/types/sales';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export interface ListSalesPOParams {
  status?: SalesPOStatus;
  salesRepId?: number;
  productId?: number;
  sendTo?: 'sales' | 'admin' | 'purchase' | 'production';
}

export async function createSalesPO(payload: CreateSalesPORequest): Promise<SalesPO> {
  const url = `${baseURL}/sales-po/create`;

  const resp = await axios.post(url, payload, {
    withCredentials: true, // send usrCookie for AuthMiddleware
  });

  // Backend pattern: sometimes wraps as { success, data }, sometimes raw
  return (resp.data?.data ?? resp.data) as SalesPO;
}

// List POs (all or filtered)
export async function listSalesPO(params: ListSalesPOParams = {}): Promise<SalesPO[]> {
  const url = `${baseURL}/sales-po/view`;

  const resp = await axios.get(url, {
    withCredentials: true,
    params: {
      ...(params.status ? { status: params.status } : {}),
      ...(typeof params.salesRepId === 'number' ? { salesRepId: params.salesRepId } : {}),
      ...(typeof params.productId === 'number' ? { productId: params.productId } : {}),
      ...(params.sendTo ? { sendTo: params.sendTo } : {}),
    },
  });

  const payload = resp.data?.data ?? resp.data;

  if (Array.isArray(payload)) {
    return payload as SalesPO[];
  }

  return [];
}

// Get a single PO by ID
export async function getSalesPOById(id: number): Promise<SalesPO> {
  const url = `${baseURL}/sales-po/${id}`;
  const resp = await axios.get(url, {
    withCredentials: true,
  });

  return (resp.data?.data ?? resp.data) as SalesPO;
}

export type UpdateSalesPOStatusRequest = {
  toStatus: SalesPOStatus;
  newQuantity?: number;
  newAskingPrice?: number;
  newComments?: string;
  rejectionReason?: string;
  fulfillmentType?: 'purchase' | 'production';
  deliveryCode?: string;
  sendTo?: 'sales' | 'admin' | 'purchase' | 'production';
};

export async function updateSalesPOStatus(
  id: number,
  payload: UpdateSalesPOStatusRequest
): Promise<SalesPO> {
  const url = `${baseURL}/sales-po/${id}/status`;

  const resp = await axios.patch(url, payload, {
    withCredentials: true,
  });

  return (resp.data?.data ?? resp.data) as SalesPO;
}

// Status timeline for a given PO
export async function getSalesPOStatusLog(id: number): Promise<SalesPOStatusLog[]> {
  const url = `${baseURL}/sales-po/${id}/status-log`;
  const { data } = await axios.get(url, { withCredentials: true });
  return (data?.data ?? data) as SalesPOStatusLog[];
}

// Purchase queue (masked client data)
export async function listPurchaseQueue(): Promise<SalesPO[]> {
  const url = `${baseURL}/sales-po/purchase-queue`;
  const { data } = await axios.get(url, { withCredentials: true });
  return (data?.data ?? data) as SalesPO[];
}

// Production queue (masked client data)
export async function listProductionQueue(): Promise<SalesPO[]> {
  const url = `${baseURL}/sales-po/production-queue`;
  const { data } = await axios.get(url, { withCredentials: true });
  return (data?.data ?? data) as SalesPO[];
}

export interface SalesPOFilters {
  status?: string;
  sendTo?: string;
  salesRepId?: number;
  productId?: number;
}

export async function getSalesPOs(filters: SalesPOFilters = {}): Promise<SalesPO[]> {
  const params: Record<string, string | number> = {};

  if (filters.status) params.status = filters.status;
  if (filters.sendTo) params.sendTo = filters.sendTo;
  if (filters.salesRepId) params.salesRepId = filters.salesRepId;
  if (filters.productId) params.productId = filters.productId;

  const url = `${baseURL}/sales-po/view`;

  const resp = await axios.get(url, {
    params,
    withCredentials: true,
  });

  // backend returns { success, data }
  return (resp.data?.data ?? resp.data) as SalesPO[];
}
