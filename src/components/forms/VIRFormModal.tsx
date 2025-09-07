// src/components/forms/VIRFormModal.tsx
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '@/hooks/useAuthContext';
import type { VIR } from '@/types/vir';
import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL;

interface VIRFormModalProps {
  onClose: () => void;
  virData?: VIR; // undefined/null => create; VIR => verify/view
}

const checklistQuestions = [
  'Delivery Challan and Bill Received?',
  'Material is received as per Purchase Order?',
  'Material received from Approved Vendors?',
  'COA received?',
  'Vehicle is not carrying any pesticides or oily materials or Non-Halal Material',
  'Proper Label pasted on each container',
  'The vehicle shall be free from abnormal odor',
  'Halal Pass',
  'Physical verification for quantity is ok',
  'Received Food grade certificate',
  'Material received in Damage / Breakage / Leakage condition',
];

export const VIRFormModal = ({ onClose, virData }: VIRFormModalProps) => {
  const { authUser } = useAuthContext();
  const modalRef = useRef<HTMLDivElement | null>(null);

  const mode: 'create' | 'verify' | 'view' = !virData
    ? 'create'
    : virData.status === 'completed'
      ? 'view'
      : 'verify';

  // state

  console.log(virData);

  const [vendor, setVendor] = useState<string>(virData ? String(virData.vendor_id) : '');
  const [product, setProduct] = useState<string>(virData ? String(virData.product_id) : '');
  const [remarks, setRemarks] = useState<string>(virData?.remarks || '');
  const [checklist, setChecklist] = useState<Record<string, 'yes' | 'no' | 'na'>>(
    (virData?.checklist as Record<string, 'yes' | 'no' | 'na'>) || {}
  );

  const readOnly = mode !== 'create';

  const handleSubmit = async () => {
    try {
      if (mode === 'verify') {
        await axios.patch(
          `${baseURL}/vir/verify/${virData?.vir_number}`,
          {
            checkedBy: { data: authUser },
            checkedAt: new Date().toISOString(),
          },
          { withCredentials: true }
        );
        toast.success('VIR successfully verified');
      } else if (mode === 'create') {
        await axios.post(
          `${baseURL}/vir/create`,
          {
            vendor,
            product,
            remarks,
            checklist,
            createdBy: { data: authUser },
            createdAt: new Date().toISOString(),
          },
          { withCredentials: true }
        );
        toast.success('VIR successfully created');
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg = (err as unknown) || 'An unexpected error occurred';
      toast.error(`Failed to ${mode === 'verify' ? 'verify' : 'create'} VIR: ${errorMsg}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        <h2 className="text-xl font-bold mb-1">
          {mode === 'create' ? 'Create VIR' : mode === 'verify' ? 'Verify VIR' : 'View VIR'}
        </h2>
        {virData?.vir_number && (
          <p className="text-sm text-gray-500 mb-3">VIR No: {virData.vir_number}</p>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Vendor & Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
          <div>
            <label className="block text-sm font-medium">Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={readOnly}
            >
              <option value="">Select Vendor</option>
              <option value="ABC Ltd.">ABC Ltd.</option>
              <option value="XYZ Enterprises">XYZ Enterprises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Product</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={readOnly}
            >
              <option value="">Select Product</option>
              <option value="chilli powder">Chilli Powder</option>
              <option value="Wheat Flour">Wheat Flour</option>
            </select>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-semibold">Checklist</h3>
          {checklistQuestions.map((q) => (
            <div key={q} className="space-y-2">
              <label className="block text-sm font-medium">{q}</label>
              <div className="flex gap-8 flex-wrap" role="radiogroup" aria-label={q}>
                {(['yes', 'no', 'na'] as const).map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border cursor-pointer ${checklist[q] === opt ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <input
                      type="radio"
                      name={q}
                      className="hidden"
                      checked={checklist[q] === opt}
                      disabled={readOnly}
                      onChange={() => setChecklist((prev) => ({ ...prev, [q]: opt }))}
                    />
                    {opt.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Remarks */}
          <div className="mt-4">
            <label className="block text-sm font-medium">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={readOnly}
              className="w-full border rounded px-3 py-2 text-gray-600"
              placeholder="Add remarks if any"
            />
          </div>
        </div>

        {/* Meta info */}
        {(virData?.created_at || virData?.checked_at) && (
          <div className="mt-4 space-y-1 text-sm text-gray-500">
            {virData?.created_at && (
              <div>
                <span className="font-medium">Created At: </span>
                {new Date(virData.created_at).toLocaleString()}
              </div>
            )}
            {virData?.checked_at && (
              <div>
                <span className="font-medium">Verified At: </span>
                {new Date(virData.checked_at).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {mode !== 'view' && (
          <div className="mt-6 text-right">
            <Button onClick={handleSubmit}>
              {mode === 'verify' ? 'Verify VIR' : 'Create VIR'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
