// src/types/sales.ts

export type SalesPOStatus =
  | 'quote_requested'
  | 'quote_admin_approved'
  | 'quote_sent_to_client'
  | 'client_negotiation'
  | 'client_approved'
  | 'final_admin_approved'
  | 'routed_to_purchase'
  | 'routed_to_production'
  | 'admin_rejected'
  | 'client_rejected'
  | 'cancelled';

export type SalesPORequestType = 'sample' | 'purchase';

export type SalesPOFulfillmentType = 'purchase' | 'production';

export interface SalesPO {
  id: number;
  poNumber?: string | null;

  productId: number;
  productName?: string;

  companyName: string;
  companyAddress?: string | null;

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

  expectedDeliveryDate?: string | null; // ISO date
  requestDate: string; // ISO date

  status: SalesPOStatus;

  salesRepId?: number | null;
  salesRepName?: string | null;

  fulfillmentType?: SalesPOFulfillmentType | null;

  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface SalesPOStatusLog {
  id: number;
  poId: number;
  fromStatus?: SalesPOStatus | null;
  toStatus: SalesPOStatus;
  changedBy?: number | null;
  changedByName?: string | null;
  note?: string | null;
  changedAt: string; // ISO datetime
}
