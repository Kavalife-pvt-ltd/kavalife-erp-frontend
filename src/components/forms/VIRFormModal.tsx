// components/VehicleInspectionForm.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface VIRFormModalProps {
  onClose: () => void;
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

export const VIRFormModal = ({ onClose }: VIRFormModalProps) => {
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [checkedBy, setCheckedBy] = useState('');
  const [doneBy, setDoneBy] = useState('');
  const [checklist, setChecklist] = useState<Record<string, 'yes' | 'no' | 'na'>>({});

  const handleSubmit = async () => {
    try {
      // Call your API here to save the VIR
      // await api.saveVIR({ vendorId, productId, remarks, checklist, checkedBy, doneBy })
      toast.success('VIR successfully created');
      onClose();
    } catch (err) {
      const errorMessage = (err as { msg?: string })?.msg || 'Unknown error';
      toast.error(`Failed to create VIR: ${errorMessage}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Generate New VIR</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full border rounded px-3 py-2 text-gray-600"
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
            <div key={question} className="space-y-1">
              <label className="block text-sm font-medium">{question}</label>
              <div className="flex gap-4 justify-start">
                {['yes', 'no', 'na'].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={question}
                      value={option}
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
            <label className="block text-sm text-gray-600 font-medium">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded text-stroke px-3 py-2"
              placeholder="Add remarks if any"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Done By</label>
            <input
              type="text"
              value={doneBy}
              onChange={(e) => setDoneBy(e.target.value)}
              className="w-full border text-gray-600 rounded px-3 py-2"
              placeholder="Enter user ID"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 font-medium">Checked By</label>
            <input
              type="text"
              value={checkedBy}
              onChange={(e) => setCheckedBy(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter user ID"
            />
          </div>
        </div>

        <div className="mt-6 text-right">
          <Button onClick={handleSubmit}>Create VIR</Button>
        </div>
      </div>
    </div>
  );
};
