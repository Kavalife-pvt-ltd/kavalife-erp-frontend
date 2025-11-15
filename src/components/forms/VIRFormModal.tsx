// src/components/forms/VIRFormModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '@/hooks/useAuthContext';
import type { VIR } from '@/types/vir';
import axios from 'axios';
import { useBootstrapStore } from '@/store/bootstrap';

const baseURL = import.meta.env.VITE_BACKEND_URL;

interface VIRFormModalProps {
  onClose: () => void;
  virData?: VIR;
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
] as const;

export const VIRFormModal = ({ onClose, virData }: VIRFormModalProps) => {
  const { authUser } = useAuthContext();
  const modalRef = useRef<HTMLDivElement | null>(null);

  // global maps (id -> full entity)
  const usersById = useBootstrapStore((s) => s.userById);
  const vendorsById = useBootstrapStore((s) => s.vendorById);
  const productsById = useBootstrapStore((s) => s.productById);

  // mode + readOnly
  const mode = useMemo<'create' | 'verify' | 'view'>(() => {
    if (!virData) return 'create';
    return virData.status === 'completed' ? 'view' : 'verify';
  }, [virData]);
  const readOnly = mode !== 'create';

  // Local state: ALWAYS store IDs in state
  const [vendorId, setVendorId] = useState<string>(
    virData?.vendor_id != null ? String(virData.vendor_id) : ''
  );
  const [productId, setProductId] = useState<string>(
    virData?.product_id != null ? String(virData.product_id) : ''
  );
  const [remarks, setRemarks] = useState<string>(virData?.remarks ?? '');
  const [checklist, setChecklist] = useState<Record<string, 'yes' | 'no' | 'na'>>(
    (virData?.checklist as Record<string, 'yes' | 'no' | 'na'>) ?? {}
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (mode === 'verify' && virData?.vir_number) {
        await axios.patch(
          `${baseURL}/vir/verify/${virData.vir_number}`,
          {
            checkedBy: { data: authUser }, // backend expects { data: User }
            checkedAt: new Date().toISOString(),
          },
          { withCredentials: true }
        );
        toast.success('VIR successfully verified');
      } else if (mode === 'create') {
        // Backend currently expects NAMES, not IDs. Translate here:
        const vendorName = vendorsById[Number(vendorId)]?.name ?? vendorId;
        const productName = productsById[Number(productId)]?.name ?? productId;

        if (!vendorName || !productName) {
          toast.error('Please select both vendor and product');
          setSubmitting(false);
          return;
        }

        await axios.post(
          `${baseURL}/vir/create`,
          {
            vendor: vendorName,
            product: productName,
            remarks,
            checklist,
            createdBy: authUser, // backend expects { data: User }
            createdAt: new Date().toISOString(),
          },
          { withCredentials: true }
        );
        toast.success('VIR successfully created');
      }

      onClose();
    } catch (err) {
      console.log(err);
      toast.error(`Failed to ${mode === 'verify' ? 'verify' : 'create'} VIR`);
    } finally {
      setSubmitting(false);
    }
  };

  // close on outside click / Esc
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

  // Helpers to render label strings from IDs
  const createdByLabel =
    virData?.created_by && usersById[virData.created_by]
      ? usersById[virData.created_by].username
      : virData?.created_by
        ? String(virData.created_by)
        : 'N/A';

  const checkedByLabel =
    virData?.checked_by && usersById[virData.checked_by]
      ? usersById[virData.checked_by].username
      : virData?.checked_by
        ? String(virData.checked_by)
        : 'N/A';

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
            <label htmlFor="vendor" className="block text-sm font-medium">
              Vendor
            </label>
            <select
              id="vendor"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={readOnly}
            >
              <option value="">Select Vendor</option>
              {Object.values(vendorsById).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product" className="block text-sm font-medium">
              Product
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={readOnly}
            >
              <option value="">Select Product</option>
              {Object.values(productsById).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-semibold">Checklist</h3>

          {checklistQuestions.map((q) => {
            const value = checklist[q] ?? 'na';
            return (
              <div key={q} className="space-y-2">
                <label className="block text-sm font-medium">{q}</label>
                <div className="flex gap-8 flex-wrap" role="radiogroup" aria-label={q}>
                  {(['yes', 'no', 'na'] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border cursor-pointer ${
                        value === opt ? 'bg-blue-600 text-white' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={q}
                        className="hidden"
                        checked={value === opt}
                        disabled={readOnly}
                        onChange={() =>
                          setChecklist((prev) => ({
                            ...prev,
                            [q]: opt,
                          }))
                        }
                      />
                      {opt.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Remarks */}
          <div className="mt-4">
            <label htmlFor="remarks" className="block text-sm font-medium">
              Remarks
            </label>
            <textarea
              id="remarks"
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
                <div>
                  <span className="font-medium">Created By: </span>
                  {createdByLabel}
                </div>
                <div>
                  <span className="font-medium">Created At: </span>
                  {new Date(virData.created_at).toLocaleString()}
                </div>
              </div>
            )}
            {virData?.checked_at && (
              <div>
                <div>
                  <span className="font-medium">Checked By: </span>
                  {checkedByLabel}
                </div>
                <div>
                  <span className="font-medium">Verified At: </span>
                  {new Date(virData.checked_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {mode !== 'view' && (
          <div className="mt-6 text-right">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'verify' ? 'Verify VIR' : 'Create VIR'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
