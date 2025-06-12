// components/VehicleInspectionForm.tsx
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '@/contexts/useAuthContext';

interface VIRFormModalProps {
  onClose: () => void;
  virData?: {
    vendorId: string;
    productId: string;
    remarks: string;
    checklist: Record<string, 'yes' | 'no' | 'na'>;
    createdBy: { id: string; name: string };
    createdAt?: string;
    verifiedBy?: { id: string; name: string };
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

  const [vendorId, setVendorId] = useState(virData?.vendorId || '');
  const [productId, setProductId] = useState(virData?.productId || '');
  const [remarks, setRemarks] = useState(virData?.remarks || '');
  const [checklist, setChecklist] = useState<Record<string, 'yes' | 'no' | 'na'>>(
    virData?.checklist || {}
  );

  const isVerification = Boolean(virData?.createdBy);

  const handleSubmit = async () => {
    try {
      if (isVerification) {
        // Call API to verify VIR
        await fetch('/api/verify-vir', {
          method: 'POST',
          body: JSON.stringify({
            ...virData,
            verifiedBy: authUser,
            verifiedAt: new Date().toISOString(),
          }),
        });
        toast.success('VIR successfully verified');
      } else {
        // Call API to create VIR
        await fetch('/api/create-vir', {
          method: 'POST',
          body: JSON.stringify({
            vendorId,
            productId,
            remarks,
            checklist,
            createdBy: authUser,
          }),
        });
        toast.success('VIR successfully created');
      }

      onClose();
    } catch (err) {
      const errorMessage = (err as { msg?: string })?.msg || 'Unknown error';
      toast.error(`Failed to ${isVerification ? 'verify' : 'create'} VIR: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Vendor</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-600"
              disabled={isVerification}
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
              className="w-full border rounded px-3 py-2 text-gray-600"
              disabled={isVerification}
            >
              <option value="">Select Product</option>
              <option value="1">Chilli Powder</option>
              <option value="2">Wheat Flour</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-md font-semibold">Checklist</h3>
          {checklistQuestions.map((question) => (
            <div key={question} className="space-y-2">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                {question}
              </label>
              <div className="flex gap-8 flex-wrap">
                {['yes', 'no', 'na'].map((option) => (
                  <label
                    key={option}
                    className={`
                      flex items-center justify-center gap-2 px-6 py-3 rounded-lg border cursor-pointer
                      text-sm font-medium min-w-[80px]
                      ${
                        checklist[question] === option
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={question}
                      value={option}
                      className="hidden"
                      disabled={isVerification}
                      checked={checklist[question] === option}
                      onChange={() =>
                        setChecklist((prev) => ({
                          ...prev,
                          [question]: option as 'yes' | 'no' | 'na',
                        }))
                      }
                    />
                    {option.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <label className="block text-sm font-medium">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              disabled={isVerification}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-700"
              placeholder="Add remarks if any"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 my-4">
          <label className="block text-sm font-medium ">Created By:</label>
          {virData?.createdBy ? (
            <>
              <span className="text-sm text-green-600">{virData?.createdBy.name}</span>
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
              <span className="text-sm text-green-600">{virData?.verifiedBy.name}</span>
              <span className="text-xs text-gray-500">
                ({new Date(virData.verifiedAt!).toLocaleString()})
              </span>
            </>
          ) : (
            <span className="text-sm font-bold italic text-yellow-400">Pending</span>
          )}
        </div>

        <div className="mt-6 text-right">
          <Button onClick={handleSubmit}>
            {virData?.createdBy?.name ? 'Verify VIR' : 'Create VIR'}
          </Button>
        </div>
      </div>
    </div>
  );
};
