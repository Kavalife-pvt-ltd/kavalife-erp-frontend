// components/forms/GRNFormModal.tsx
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

// --- Types ---
interface VIRDetails {
  id: string;
  vendorName: string;
  productName: string;
  productImage: string;
  date: string;
  remarks: string;
}

interface GRNFormModalProps {
  onClose: () => void;
}

// --- Mock VIR Data (replace with real API) ---
const mockVirData: Record<string, VIRDetails> = {
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

export const GRNFormModal = ({ onClose }: GRNFormModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // --- State ---
  const [selectedVirId, setSelectedVirId] = useState<string>('');
  const [virDetails, setVirDetails] = useState<VIRDetails | null>(null);

  const [containerQty, setContainerQty] = useState('');
  const [quantity, setQuantity] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceImg, setInvoiceImg] = useState('');
  const [packagingStatus, setPackagingStatus] = useState('');
  const [doneBy, setDoneBy] = useState('');
  const [checkedBy, setCheckedBy] = useState('');

  // --- Close handlers ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // --- Load VIR details on selection ---
  useEffect(() => {
    if (selectedVirId) {
      setVirDetails(mockVirData[selectedVirId] || null);
    } else {
      setVirDetails(null);
    }
  }, [selectedVirId]);

  // --- Submit handler with basic validation ---
  const handleSubmit = () => {
    if (
      !selectedVirId ||
      !containerQty ||
      !quantity ||
      !invoiceNo ||
      !invoiceDate ||
      !packagingStatus
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // TODO: replace with actual API call
      toast.success('GRN created successfully');
      setTimeout(onClose, 1000);
    } catch {
      toast.error('Failed to create GRN');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-3xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">🧾 Create New GRN</h2>

        {/* === VIR Selector Cards === */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select VIR</label>
          <div className="flex flex-nowrap space-x-4 overflow-x-auto pb-2">
            {Object.values(mockVirData).map((vir) => (
              <div
                key={vir.id}
                onClick={() => setSelectedVirId(vir.id)}
                className={`flex-shrink-0 w-48 p-3 border rounded cursor-pointer transition ${
                  selectedVirId === vir.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-sm font-semibold">VIR {vir.id}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{vir.productName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{vir.vendorName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{vir.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* === VIR Details Card === */}
        {virDetails && (
          <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 flex mb-6">
            <img
              src={virDetails.productImage}
              alt={virDetails.productName}
              className="w-24 h-24 object-cover rounded mr-4"
            />
            <div>
              <div className="font-semibold text-lg">{virDetails.productName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Vendor: {virDetails.vendorName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Date: {virDetails.date}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Remarks: {virDetails.remarks}
              </div>
            </div>
          </div>
        )}

        {/* === GRN Entry Form === */}
        {virDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">No. of Containers</label>
              <input
                value={containerQty}
                onChange={(e) => setContainerQty(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity</label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
                placeholder="e.g. 1000 kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Invoice Number</label>
              <input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
                placeholder="Enter Invoice No"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Invoice Image URL</label>
              <input
                value={invoiceImg}
                onChange={(e) => setInvoiceImg(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
                placeholder="Paste image link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Packaging Status</label>
              <select
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
              >
                <option value="">Select Status</option>
                <option value="packed">Packed</option>
                <option value="loose">Loose</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Done By</label>
              <input
                value={doneBy}
                onChange={(e) => setDoneBy(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
                placeholder="User ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Checked By</label>
              <input
                value={checkedBy}
                onChange={(e) => setCheckedBy(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700"
                placeholder="User ID"
              />
            </div>
          </div>
        )}

        {/* === Submit Button === */}
        {virDetails && (
          <div className="mt-6 text-right">
            <Button onClick={handleSubmit}>✅ Create GRN</Button>
          </div>
        )}
      </div>
    </div>
  );
};
