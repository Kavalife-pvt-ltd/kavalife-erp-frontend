// components/forms/GRNFormModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface GRNFormModalProps {
  onClose: () => void;
}

export const GRNFormModal = ({ onClose }: GRNFormModalProps) => {
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [virId, setVirId] = useState('');
  const [containerQty, setContainerQty] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceImg, setInvoiceImg] = useState('');
  const [doneBy, setDoneBy] = useState('');
  const [checkedBy, setCheckedBy] = useState('');

  const handleSubmit = async () => {
    try {
      // Replace with actual API call
      toast.success('GRN successfully created');
      onClose();
    } catch (err) {
      const errorMessage = (err as { msg?: string })?.msg || 'Unknown error';
      toast.error(`Failed to create VIR: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Generate New GRN</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">VIR</label>
            <input
              value={virId}
              onChange={(e) => setVirId(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
              placeholder="Enter VIR ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Vendor</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-600"
            >
              <option value="">Select Vendor</option>
              <option value="1">ABC Ltd.</option>
              <option value="2">XYZ Enterprises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border rounded px-3 text-gray-600 py-2"
            >
              <option value="">Select Product</option>
              <option value="1">Chilli Powder</option>
              <option value="2">Wheat Flour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Container Quantity</label>
            <input
              value={containerQty}
              onChange={(e) => setContainerQty(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-600 "
              placeholder="Enter Container Qty"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Batch No</label>
            <input
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
              placeholder="Enter Batch No"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Invoice No</label>
            <input
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
              placeholder="Enter Invoice No"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Invoice Image URL</label>
            <input
              value={invoiceImg}
              onChange={(e) => setInvoiceImg(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
              placeholder="Paste Image URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Done By</label>
            <input
              value={doneBy}
              onChange={(e) => setDoneBy(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
              placeholder="Enter User ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Checked By</label>
            <input
              value={checkedBy}
              onChange={(e) => setCheckedBy(e.target.value)}
              className="w-full border rounded text-gray-600 px-3 py-2"
              placeholder="Enter User ID"
            />
          </div>
        </div>
        <div className="mt-6 text-right">
          <Button onClick={handleSubmit}>Create GRN</Button>
        </div>
      </div>
    </div>
  );
};
