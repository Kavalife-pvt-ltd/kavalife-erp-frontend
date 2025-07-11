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
  '101': {
    id: '101',
    vendorName: 'XYZ Enterprises',
    productName: 'Chilli Powder',
    productImage: 'https://kavalife.in/wp-content/uploads/2024/07/Capsicum-Oleoresin-1.png.png',
    date: '2025-06-16',
    remarks: 'Urgent shipment',
  },
  '102': {
    id: '102',
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
