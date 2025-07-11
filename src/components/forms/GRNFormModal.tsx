// src/components/forms/GRNFormModal.tsx
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

import type { GRN } from '@/types/grn';
import type { VIRDetails } from '@/types/vir';
import { mockVirData } from '@/types/vir';

interface GRNFormModalProps {
  onClose: () => void;
  grnToEdit?: GRN;
}

export const GRNFormModal = ({ onClose, grnToEdit }: GRNFormModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // --- Form state, seeded from edit or blank ---
  const [selectedVirId, setSelectedVirId] = useState(grnToEdit?.id.toString() ?? '');
  const [virDetails, setVirDetails] = useState<VIRDetails | null>(
    grnToEdit ? mockVirData[grnToEdit.id.toString()] : null
  );

  const [containerQty, setContainerQty] = useState(grnToEdit?.containerQuantity.toString() ?? '');
  const [quantity, setQuantity] = useState(grnToEdit?.quantity.toString() ?? '');
  const [invoiceNo, setInvoiceNo] = useState(grnToEdit?.invoice.toString() ?? '');
  const [invoiceDate, setInvoiceDate] = useState(
    grnToEdit?.invoiceDate ?? new Date().toISOString().substr(0, 10)
  );
  const [invoiceImg, setInvoiceImg] = useState(grnToEdit?.invoiceImg ?? '');
  const [packagingStatus, setPackagingStatus] = useState(grnToEdit?.packagingStatus ?? '');
  const [doneBy, setDoneBy] = useState(grnToEdit?.doneBy ?? '');
  const [checkedBy, setCheckedBy] = useState(grnToEdit?.checkedBy ?? '');

  // --- Close on outside click / escape ---
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

  // --- Load VIR details whenever selection changes ---
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
      // TODO: wire up create vs update API
      toast.success(grnToEdit ? 'GRN updated successfully' : 'GRN created successfully');
      setTimeout(onClose, 500);
    } catch {
      toast.error('Failed to save GRN');
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

        <h2 className="text-2xl font-bold mb-6">
          {grnToEdit ? `✏️ Edit GRN #${grnToEdit.id}` : '🧾 Create New GRN'}
        </h2>

        {/* VIR Selector */}
        {!grnToEdit && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select VIR</label>
            <div className="flex flex-nowrap space-x-4 overflow-x-auto pb-2">
              {Object.values(mockVirData).map((vir) => (
                <div
                  key={vir.id}
                  onClick={() => setSelectedVirId(vir.id)}
                  className={`flex-shrink-0 w-48 p-3 border rounded cursor-pointer transition ${
                    selectedVirId === vir.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-current'
                  }`}
                >
                  <div className="text-sm font-semibold">VIR {vir.id}</div>
                  <div className="text-xs">{vir.productName}</div>
                  <div className="text-xs">{vir.vendorName}</div>
                  <div className="text-xs">{vir.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIR Details */}
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

        {/* Entry Form */}
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

        {virDetails && (
          <div className="mt-6 text-right">
            <Button onClick={handleSubmit}>
              {grnToEdit ? '💾 Save Changes' : '✅ Create GRN'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
