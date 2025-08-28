// src/types/grn.ts
// src/types/grn.ts
export interface QAQCData {
  containersSampled: number;
  sampledQuantity: number;
  sampledBy: string;
  sampledOn: string; // YYYY-MM-DD
  arNumber: string;
  releaseDate: string; // YYYY-MM-DD
  potency: string;
  moistureContent: string;
  yieldPercent: string;
  status: 'approved' | 'rejected';
  analystRemark: string;
  analysedBy: string;
  approvedBy: string;
}

export interface GRN {
  id: number;
  grn_number: string;
  vir_number: string;
  status: string;
  created_at: string;
  container_qty: number;
  quantity: number;
  invoice: string;
  invoice_date: string;
  invoice_img: string;
  packaging_status: string;
  createdBy: string;
  product_name: string;
  vendor_name: string;
  remarks?: string;
  doneBy?: string;
  created_by?: string;
  productImage?: string;
  qaqcStatus: 'not_created' | 'created' | 'approved' | 'rejected' | 'under_review';
}
