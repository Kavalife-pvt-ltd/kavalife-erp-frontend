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
  | 'purchase_priced'
  | 'routed_to_production'
  | 'admin_rejected'
  | 'purchase_completed'
  | 'production_completed'
  | 'production_approved'
  | 'closed'
  | 'purchase_approved'
  | 'cancelled';

export type SalesPORequestType = 'sample' | 'purchase';

export type SalesPOFulfillmentType = 'purchase' | 'production';

export interface SalesPO {
  sendTo: string;
  id: number;
  inquiryNumber?: string | null;
  poNumber?: string | null;

  productName?: string | null;

  companyName: string;
  companyAddress: string;
  coaUrl?: string;

  companyContactName?: string | null;
  companyContactNumber?: string | null;
  companyContactEmail?: string | null;

  purity?: string | null;
  grade?: string | null;

  requestType: SalesPORequestType;

  quantity: number;
  quantityUnit?: string | null;
  askingPrice?: number | null;
  purchasePrice?: number | null;

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
  productName: string;
  companyName: string;
  companyAddress?: string;
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

export interface SalesInquiryGroup {
  id: number;
  inquiryNumber?: string | null;
  companyName: string;
  companyAddress: string;
  companyContactName?: string | null;
  companyContactNumber?: string | null;
  companyContactEmail?: string | null;
  salesRepId?: number | null;
  requestDate: string;
  comments?: string | null;
  items: SalesPO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesInquiryRequest {
  companyName: string;
  companyAddress?: string;
  companyContactName?: string;
  companyContactNumber?: string;
  companyContactEmail?: string;
  comments?: string;
  requestDate?: string;
  items: CreateSalesInquiryItemRequest[];
  salesRepId?: number;
}

export interface CreateSalesInquiryItemRequest {
  productName: string;
  requestType: SalesPORequestType;
  quantity: number;
  quantityUnit?: string;
  purity?: string;
  grade?: string;
  askingPrice?: number;
  comments?: string;
  expectedDeliveryDate?: string;
}

export type SalesInquiryDraftItem = {
  clientId: string;
  productName: string;
  requestType: SalesPORequestType;
  quantity: string;
  quantityUnit: string;
  purity: string;
  grade: string;
  askingPrice: string;
  comments: string;
};

export type CreateSalesInquiryItemPayload = CreateSalesInquiryItemRequest;
