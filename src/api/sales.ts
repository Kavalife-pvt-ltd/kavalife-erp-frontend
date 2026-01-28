import axios from 'axios';
import type { SalesPO, SalesPOStatus, SalesPOStatusLog, CreateSalesPORequest } from '@/types/sales';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export type SalesQueue = 'sales' | 'admin' | 'purchase' | 'production';

export interface ListSalesPOParams {
  status?: SalesPOStatus;
  salesRepId?: number;
  productName?: string;
  sendTo?: SalesQueue;
}

export async function createSalesPO(payload: CreateSalesPORequest): Promise<SalesPO> {
  const url = `${baseURL}/sales-po/create`;

  const resp = await axios.post(url, payload, {
    withCredentials: true,
  });

  return (resp.data?.data ?? resp.data) as SalesPO;
}

export async function listSalesPO(params: ListSalesPOParams = {}): Promise<SalesPO[]> {
  const url = `${baseURL}/sales-po/view`;

  const resp = await axios.get(url, {
    withCredentials: true,
    params: {
      ...(params.status ? { status: params.status } : {}),
      ...(typeof params.salesRepId === 'number' ? { salesRepId: params.salesRepId } : {}),
      ...(params.productName?.trim() ? { productName: params.productName.trim() } : {}),
      ...(params.sendTo ? { sendTo: params.sendTo } : {}),
    },
  });

  const payload = resp.data?.data ?? resp.data;
  return Array.isArray(payload) ? (payload as SalesPO[]) : [];
}

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
  sendTo?: SalesQueue;
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

  const resp = await axios.get(url, { withCredentials: true });
  const payload = resp.data?.data ?? resp.data;

  return Array.isArray(payload) ? (payload as SalesPOStatusLog[]) : [];
}
