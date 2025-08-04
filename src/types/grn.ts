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
  grnNumber: string;
  virNumber: string;
  status: string;
  createdAt: string;
  containerQuantity: number;
  quantity: number;
  invoice: string;
  invoiceDate: string;
  invoiceImg: string;
  packagingStatus: string;
  createdBy: string;
  productName: string;
  vendorName: string;
  doneBy?: string;
  checkedBy?: string;
  qaqc?: QAQCData;
}
