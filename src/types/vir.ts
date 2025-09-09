// src/types/vir.ts

// Shared
export type VIRStatus = 'in-progress' | 'completed' | 'checked';
export type ChecklistValue = 'yes' | 'no' | 'na';
export type Checklist = Record<string, ChecklistValue>;

// Backend models
export interface VIR {
  id: number;
  vir_number: string;
  created_at: string;
  vendor_id: number;
  product_id: number;
  vendor_name?: string;
  product_name?: string;
  checklist: Checklist;
  remarks: string;
  created_by: number;
  checked_by?: number;
  checked_at?: string;
  status: VIRStatus;
}

// API wrappers (optional; your axios often unwraps already)
export interface VIRListResponse {
  data: VIR[];
}
export interface VIRSingleResponse {
  data: VIR;
}

// Requests/Responses
export interface CreateVIRRequest {
  vendor: string; // name
  product: string; // name
  remarks: string;
  checklist: Checklist;
  createdBy: {
    data: {
      id: number;
      username: string;
      created_at: string;
      role: string;
      phone_num?: number | string;
    };
  };
  createdAt: string; // ISO
}
export interface CreateVIRResponse {
  vir_number: string;
  createdBy: string;
  createdAt: string;
  status: VIRStatus | string;
}

export interface VerifyVIRRequest {
  checkedBy: {
    data: {
      id: number;
      username: string;
      created_at: string;
      role: string;
      phone_num?: number | string;
    };
  };
  checkedAt: string; // ISO
}
export interface VerifyVIRResponse {
  vir_number: string;
  checkedBy: string;
  checkedAt: string;
  status: VIRStatus | string;
}

// UI view models
export interface VIRDetails {
  id: number;
  virNumber: string;
  vendorName: string;
  productName: string;
  productImage: string;
  date: string;
  remarks: string;
}

export type VIRCardStatus = 'pending verification' | 'verified';
export interface VIRCardProps {
  id: number;
  vir_number?: string;
  vendorId: string | number;
  productId: string | number;
  status: VIRCardStatus;
  remarks: string;
  imageUrl?: string;
  checklist?: Checklist;
  createdAt?: string;
  className?: string;
  verifiedBy?: string;
}
