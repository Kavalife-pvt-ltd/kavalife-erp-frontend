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

// src/types/grn.ts
export interface GRN {
  id: number;
  grn_number: string;
  created_at: string;
  vendor_name: string;
  product_name: string;
  quantity: number;
  container_qty: number;
  invoice: string | number;
  invoice_date: string;
  invoice_img?: string;
  packaging_status: string;
  created_by: number;
  vir_number: string;
  // Optional fields sometimes present:
  vir_id?: number; // <-- add
  remarks?: string; // <-- add
  productImage?: string; // <-- add
  checked_by?: string; // <-- add
  qaqcStatus: 'not_created' | 'created' | 'approved';
  status: 'pending' | 'in-progress' | 'completed';
}
