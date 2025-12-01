// src/types/sales.ts

export type SalesPOStatus =
  | 'quote_requested'
  | 'quote_admin_approved'
  | 'quote_sent_to_client'
  | 'client_negotiation'
  | 'client_approved'
  | 'client_rejected'
  | 'final_admin_approved'
  | 'routed_to_purchase'
  | 'routed_to_production'
  | 'admin_rejected'
  | 'cancelled';

export type SalesPORequestType = 'sample' | 'purchase';

export type SalesPOFulfillmentType = 'purchase' | 'production';

export interface SalesPO {
  id: number;
  poNumber?: string | null;

  productId: number;
  productName?: string | null;

  companyName: string;
  companyAddress: string;

  companyContactName?: string | null;
  companyContactNumber?: string | null;
  companyContactEmail?: string | null;

  purity?: string | null;
  grade?: string | null;

  requestType: SalesPORequestType;

  quantity: number;
  quantityUnit?: string | null;
  askingPrice?: number | null;

  comments?: string | null;

  expectedDeliveryDate?: string | null;
  requestDate: string;

  status: SalesPOStatus;

  salesRepId?: number | null;

  approvedById?: number | null;
  approvedAt?: string | null;

  rejectedById?: number | null;
  rejectionReason?: string | null;

  fulfillmentType?: SalesPOFulfillmentType | null;
  purchaseOrderId?: number | null;
  productionBatchId?: number | null;

  packedById?: number | null;
  packedAt?: string | null;

  deliveryCode?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface SalesPOStatusLog {
  id: number;
  poId: number;
  fromStatus?: SalesPOStatus | null;
  toStatus: SalesPOStatus;
  changedBy?: number | null;
  note?: string | null;
  changedAt: string;
}

export interface CreateSalesPORequest {
  productId: number;
  companyName: string;
  companyAddress: string;
  coaUrl?: string;
  companyContactName?: string;
  companyContactNumber?: string;
  companyContactEmail?: string;
  purity?: string;
  grade?: string;
  requestType: SalesPORequestType;
  quantity: number;
  quantityUnit?: string;
  askingPrice?: number;
  comments?: string;
  expectedDeliveryDate?: string; // ISO string e.g. "2025-12-15T00:00:00Z"
}
