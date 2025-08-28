// src/data/vir.ts
export interface VIRDetails {
  id: string;
  vendorName: string;
  productName: string;
  productImage: string;
  date: string;
  remarks: string;
}

export interface VIR {
  id: number;
  vir_number: string;
  vendor_id: number;
  product_id: number;
  checklist: Record<string, string>;
  remarks: string;
  created_by: number;
  checked_by?: number;
  checked_at?: string;
  created_at: string;
  status: 'in-progress' | 'completed';
}
