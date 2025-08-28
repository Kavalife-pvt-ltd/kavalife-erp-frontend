import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '@/hooks/useAuthContext';

const baseURL = import.meta.env.VITE_BACKEND_URL;

interface VIRFormModalProps {
  onClose: () => void;
  virData?: {
    id: number;
    vendorId: string;
    productId: string;
    status: 'pending verification' | 'verified';
    remarks: string;
    doneBy?: string;
    imageUrl?: string;
    checklist?: Record<string, 'yes' | 'no' | 'na'>;
    createdBy?: string;
    createdAt?: string;
    verifiedBy?: string;
    verifiedAt?: string;
  };
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

  // Form state
  const [vendor, setVendor] = useState(virData?.vendorId || '');
  const [product, setProduct] = useState(virData?.productId || '');
  const [remarks, setRemarks] = useState(virData?.remarks || '');
  const [checklist, setChecklist] = useState<Record<string, 'yes' | 'no' | 'na'>>(
    virData?.checklist || {}
  );

  const isVerification = virData?.id !== undefined;

  const handleSubmit = async () => {
    try {
      if (isVerification) {
        await fetch('/api/verify-vir', {
          method: 'POST',
          body: JSON.stringify({
            remarks,
            checklist,
            verifiedBy: authUser,
            verifiedAt: new Date().toISOString(),
          }),
        });
        toast.success('VIR successfully verified');
      } else {
        await fetch(`${baseURL}/vir/create`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            vendor,
            product,
            remarks,
            checklist,
            createdBy: authUser,
            createdAt: new Date().toISOString(),
          }),
        });
        toast.success('VIR successfully created');
      }
      console.log(
        'virData',
        JSON.stringify({
          vendor,
          product,
          remarks,
          checklist,
          createdBy: authUser,
          createdAt: new Date().toISOString(),
        })
      );
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(`Failed to ${isVerification ? 'verify' : 'create'} VIR: ${errorMsg}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
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
        <h2 className="text-xl font-bold mb-4">{isVerification ? 'Verify VIR' : 'Create VIR'}</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
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
              disabled={isVerification}
            >
              <option value="">Select Vendor</option>
              <option>ABC Ltd.</option>
              <option>XYZ Enterprises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Product</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={isVerification}
            >
              <option value="">Select Product</option>
              <option>Chilli Powder</option>
              <option>Wheat Flour</option>
            </select>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-semibold">Checklist</h3>
          {checklistQuestions.map((q) => (
            <div key={q} className="space-y-2">
              <label className="block text-sm font-medium">{q}</label>
              <div className="flex gap-8 flex-wrap">
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
                      disabled={isVerification}
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
              disabled={isVerification}
              className="w-full border rounded px-3 py-2 text-gray-600"
              placeholder="Add remarks if any"
            />
          </div>
        </div>

        {/* Verification Info */}
        {isVerification && (
          <>
            <div className="flex items-center gap-2 my-4">
              <label className="block text-sm font-medium ">Created By:</label>
              {virData?.createdBy ? (
                <>
                  <span className="text-sm text-green-600">{virData?.createdBy}</span>
                  <span className="text-xs text-gray-500">
                    ({new Date(virData.createdAt!).toLocaleString()})
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold italic text-yellow-400">Pending</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium ">Verified By:</label>
              {virData?.verifiedBy ? (
                <>
                  <span className="text-sm text-green-600">{virData?.verifiedBy}</span>
                  <span className="text-xs text-gray-500">
                    ({new Date(virData.verifiedAt!).toLocaleString()})
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold italic text-yellow-400">Pending</span>
              )}
            </div>
          </>
        )}

        <div className="mt-6 text-right">
          <Button onClick={handleSubmit}>{isVerification ? 'Verify VIR' : 'Create VIR'}</Button>
        </div>
      </div>
    </div>
  );
};
