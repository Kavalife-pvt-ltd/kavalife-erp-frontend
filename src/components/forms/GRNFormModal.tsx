import { useEffect, useRef, useState } from 'react';
import { getVIRDetailsById, getCompletedVIRs } from '@/api/vir';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import type { GRN } from '@/types/grn';
import type { VIR, VIRDetails } from '@/types/vir';
import { useAuthContext } from '@/hooks/useAuthContext';
import { createGRN, updateGRN } from '@/api/grn';

const virToDetails = (vir: VIR): VIRDetails => ({
  id: vir.id,
  virNumber: vir.vir_number,
  vendorName: vir.vendor_name ?? String(vir.vendor_id),
  productName: vir.product_name ?? String(vir.product_id),
  productImage: '',
  date: vir.created_at,
  remarks: vir.remarks,
});

interface GRNFormModalProps {
  onClose: () => void;
  grnData?: GRN;
}

export const GRNFormModal = ({ onClose, grnData }: GRNFormModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { authUser } = useAuthContext();

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
    invoiceDate: grnData?.invoice_date ?? '',
    invoiceImg: grnData?.invoice_img ?? '',
    packagingStatus: grnData?.packaging_status ?? '',
  });

  console.log(grnData);
  console.log(formData);

  useEffect(() => {
    if (grnData) {
      setVirDetails({
        id: grnData.vir_id ?? 0,
        virNumber: grnData.vir_number,
        productName: grnData.product_name,
        vendorName: grnData.vendor_name,
        date: grnData.invoice_date,
        remarks: grnData.remarks ?? '',
        productImage: grnData.productImage ?? '',
      });
      return;
    }

    if (formData.virNumber) {
      getVIRDetailsById(formData.virNumber)
        .then((vir) => setVirDetails(virToDetails(vir)))
        .catch(() => {
          setVirDetails(null);
          toast.error('Failed to fetch VIR details');
        });
    } else {
      setVirDetails(null);
    }
  }, [formData.virNumber, grnData]);

  // Completed VIRs for selection (create mode)
  useEffect(() => {
    if (grnData) return;
    getCompletedVIRs()
      .then((list) => setCompletedVIRs(list.map(virToDetails)))
      .catch(() => toast.error('Failed to fetch completed VIRs'));
  }, [grnData]);

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
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
      containerQuantity: parseInt(formData.containerQty, 10),
      quantity: parseFloat(formData.quantity),
      invoice: formData.invoiceNo,
      invoiceDate: formData.invoiceDate,
      invoiceImg: formData.invoiceImg,
      packagingStatus: formData.packagingStatus,
      createdBy: authUser?.id,
    };

    console.log('GRN payload', payload);

    try {
      if (grnData?.grn_number) {
        await updateGRN(grnData.id, payload);
      }
      await createGRN(payload);
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
                  key={vir.virNumber}
                  onClick={() => updateForm('virNumber', vir.virNumber)}
                  className={`flex-shrink-0 w-48 p-3 border rounded cursor-pointer transition ${
                    formData.virNumber === vir.virNumber
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-current'
                  }`}
                >
                  <div className="text-sm font-semibold">{vir.virNumber}</div>
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

            {grnData?.checked_by && (
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Done By:</span>
                  {grnData?.checked_by ? (
                    <span className="text-green-600">{grnData.checked_by}</span>
                  ) : grnData?.created_by !== undefined ? (
                    <span>{String(grnData.created_by)}</span>
                  ) : (
                    <span className="italic text-yellow-600">Pending</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Checked By:</span>
                  {grnData && grnData.checked_by ? (
                    <span className="text-green-600">{grnData.checked_by}</span>
                  ) : grnData?.checked_by !== undefined ? (
                    <span>{String(grnData.checked_by)}</span>
                  ) : (
                    <span className="italic text-yellow-600">Pending</span>
                  )}
                </div>
              </div>
            )}
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
