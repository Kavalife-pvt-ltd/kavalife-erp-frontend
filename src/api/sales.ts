// src/api/sales.ts
import axios from 'axios';
import type { SalesPO, SalesPOStatus, SalesPOStatusLog, CreateSalesPORequest } from '@/types/sales';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export interface ListSalesPOParams {
  status?: SalesPOStatus;
  salesRepId?: number;
  productId?: number;
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
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set('status', params.status);
  if (typeof params.salesRepId === 'number')
    searchParams.set('salesRepId', String(params.salesRepId));
  if (typeof params.productId === 'number') searchParams.set('productId', String(params.productId));

  const qs = searchParams.toString();
  const url = `${baseURL}/sales-po/view${qs ? `?${qs}` : ''}`;

  const resp = await axios.get(url, { withCredentials: true });

  const payload = resp.data?.data;

  // 🔥 ALWAYS return an array
  if (Array.isArray(payload)) {
    return payload;
  }

  // Fallback: if backend ever returns wrong shape, return []
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

export interface UpdateSalesPOStatusRequest {
  toStatus: SalesPOStatus;
  newQuantity?: number;
  newAskingPrice?: number;
  newComments?: string;
  rejectionReason?: string;
  fulfillmentType?: 'purchase' | 'production';
  deliveryCode?: string;
}

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
