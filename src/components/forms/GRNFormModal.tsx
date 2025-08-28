import { useEffect, useRef, useState } from 'react';
import { getVIRDetailsById, getCompletedVIRs } from '@/api/vir';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import type { GRN } from '@/types/grn';
import type { VIRDetails } from '@/types/vir';
// import { createGRN } from '@/api/grn'; // <--- make sure this exists

interface GRNFormModalProps {
  onClose: () => void;
  grnData?: GRN;
}

export const GRNFormModal = ({ onClose, grnData }: GRNFormModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [virDetails, setVirDetails] = useState<VIRDetails | null>(null);
  const [completedVIRs, setCompletedVIRs] = useState<VIRDetails[]>([]);
  const [formData, setFormData] = useState({
    grnNo: grnData?.grn_number?.toString() ?? '',
    vendorName: grnData?.vendor_name ?? '',
    productName: grnData?.product_name ?? '',
    virNumber: grnData?.vir_number ?? '',
    containerQty: grnData?.container_qty?.toString() ?? '',
    quantity: grnData?.quantity?.toString() ?? '',
    invoiceNo: grnData?.invoice?.toString() ?? '',
    invoiceDate: grnData?.invoice_date ?? new Date().toISOString().substr(0, 10),
    invoiceImg: grnData?.invoice_img ?? '',
    packagingStatus: grnData?.packaging_status ?? '',
    doneBy: grnData?.doneBy ?? '',
    checkedBy: grnData?.created_by ?? '',
  });

  // If editing, skip fetch and rely on existing GRN data
  useEffect(() => {
    if (!grnData && formData.virNumber) {
      getVIRDetailsById()
        .then((details) => setVirDetails(details))
        .catch(() => {
          setVirDetails(null);
          toast.error('Failed to fetch VIR details');
        });
    } else if (grnData) {
      // You could hydrate virDetails directly from grnData if needed
      setVirDetails({
        id: grnData.vir_number,
        productName: grnData.product_name,
        vendorName: grnData.vendor_name,
        date: grnData.invoice_date,
        remarks: grnData.remarks ?? '',
        productImage: grnData.productImage ?? '',
      });
    }
  }, [formData.virNumber, grnData]);

  useEffect(() => {
    if (!grnData) {
      getCompletedVIRs()
        .then(setCompletedVIRs)
        .catch(() => {
          toast.error('Failed to fetch completed VIRs');
        });
    }
  }, [grnData]);

  console.log('grn to edit', grnData);

  console.log('formData', formData);

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleSubmit = async () => {
    if (
      !formData.virNumber ||
      !formData.containerQty ||
      !formData.quantity ||
      !formData.invoiceNo ||
      !formData.invoiceDate ||
      !formData.packagingStatus
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      virNumber: formData.virNumber,
      containerQuantity: parseInt(formData.containerQty),
      quantity: parseFloat(formData.quantity),
      invoice: formData.invoiceNo,
      invoiceDate: formData.invoiceDate,
      invoiceImg: formData.invoiceImg,
      packagingStatus: formData.packagingStatus,
      createdBy: formData.checkedBy,
    };

    console.log(payload);

    try {
      // await createGRN(payload);
      toast.success('GRN created successfully');
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
          {grnData ? `✏️ Edit ${grnData.grn_number}` : '🧾 Create New GRN'}
        </h2>

        {!grnData && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select VIR</label>
            <div className="flex flex-nowrap space-x-4 overflow-x-auto pb-2">
              {completedVIRs.map((vir) => (
                <div
                  key={vir.id}
                  onClick={() => updateForm('virNumber', vir.id)}
                  className={`flex-shrink-0 w-48 p-3 border rounded cursor-pointer transition ${
                    formData.virNumber === vir.id
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

        {virDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="No. of Containers"
              value={formData.containerQty}
              onChange={(v) => updateForm('containerQty', v)}
            />
            <Input
              label="Quantity"
              value={formData.quantity}
              onChange={(v) => updateForm('quantity', v)}
            />
            <Input
              label="Invoice Number"
              value={formData.invoiceNo}
              onChange={(v) => updateForm('invoiceNo', v)}
            />
            <DateInput
              label="Invoice Date"
              value={formData.invoiceDate}
              onChange={(v) => updateForm('invoiceDate', v)}
            />
            <Input
              label="Invoice Image URL"
              value={formData.invoiceImg}
              onChange={(v) => updateForm('invoiceImg', v)}
            />
            <SelectInput
              label="Packaging Status"
              value={formData.packagingStatus}
              onChange={(v) => updateForm('packagingStatus', v)}
              options={['packed', 'loose', 'damaged']}
            />
            <Input
              label="Done By"
              value={formData.doneBy}
              onChange={(v) => updateForm('doneBy', v)}
            />
            <Input
              label="Checked By"
              value={formData.checkedBy}
              onChange={(v) => updateForm('checkedBy', v)}
            />
          </div>
        )}

        {virDetails && (
          <div className="mt-6 text-right">
            <Button onClick={handleSubmit}>{grnData ? '💾 Save Changes' : '✅ Create GRN'}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper inputs (you can define these in separate components if needed)
const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2 text-gray-700"
    />
  </div>
);

const DateInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2 text-gray-700"
    />
  </div>
);

const SelectInput = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2 text-gray-700"
    >
      <option value="">Select Status</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt[0].toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);
