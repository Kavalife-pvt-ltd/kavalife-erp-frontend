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
  createdAt: string;
  vendor: string;
  product: string;
  status: 'pending' | 'in-progress' | 'completed';
  quantity: number;
  containerQuantity: number;
  batchNo: number;
  invoice: number;
  invoiceDate: string;
  invoiceImg: string;
  doneBy?: string;
  checkedBy?: string;
  qaqc?: QAQCData;
  packagingStatus?: string;
}
