// src/data/vir.ts
export interface VIRDetails {
  id: string;
  vendorName: string;
  productName: string;
  productImage: string;
  date: string;
  remarks: string;
}

// Mock data — swap out for your real API later
export const mockVirData: Record<string, VIRDetails> = {
  VIR67890: {
    id: 'VIR67890',
    vendorName: 'XYZ Enterprises',
    productName: 'Chilli Powder',
    productImage: 'https://kavalife.in/wp-content/uploads/2024/07/Capsicum-Oleoresin-1.png.png',
    date: '2025-06-16',
    remarks: 'Urgent shipment',
  },
  VIR12345: {
    id: 'VIR12345',
    vendorName: 'ABC Ltd.',
    productName: 'Wheat Flour',
    productImage: 'https://kavalife.in/wp-content/uploads/2024/07/Capsicum-Oleoresin-1.png.png',
    date: '2025-06-14',
    remarks: 'Double check packaging',
  },
  '103': {
    id: '103',
    vendorName: 'MNO Traders',
    productName: 'Turmeric',
    productImage: 'https://kavalife.in/wp-content/uploads/2024/07/Capsicum-Oleoresin-1.png.png',
    date: '2025-06-15',
    remarks: 'Store in cool place',
  },
};
