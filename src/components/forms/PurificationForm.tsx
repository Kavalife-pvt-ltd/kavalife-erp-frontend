// components/forms/PurificationForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PurificationTask } from '@/pages/dashboard/Purification';

interface PurificationFormProps {
  existingTask: PurificationTask | null;
}

// Types
interface MaterialDetails {
  batchNo: string;
  chargingBatchNo: string;
  variety: string;
  date: string;
  weight: string;
  solvent: string;
  equipmentCleaningDate: string;
  equipmentCleaningTime: string;
}

interface OperationRow {
  date: string;
  washNo: string;
  equipmentCode: string;
  startTime: string;
  endTime: string;
  collectionTime: string;
  operator: string;
  remarks: string;
}

interface Verification {
  checkedBy: string;
  verifiedBy: string;
}

const Section: React.FC<{
  title: string;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}> = ({ title, open, toggle, children }) => (
  <div className="mb-6">
    <div
      onClick={toggle}
      className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded cursor-pointer"
    >
      <span className="font-semibold">{title}</span>
      <span className={`transform transition ${open ? 'rotate-90' : ''}`}>▶</span>
    </div>
    {open && <div className="mt-3">{children}</div>}
  </div>
);

export const PurificationForm: React.FC<PurificationFormProps> = ({ existingTask }) => {
  const navigate = useNavigate();

  const [openMat, setOpenMat] = useState(true);
  const [openOps, setOpenOps] = useState(true);
  const [openVer, setOpenVer] = useState(true);

  const [material, setMaterial] = useState<MaterialDetails>({
    batchNo: '',
    chargingBatchNo: '',
    variety: '',
    date: '',
    weight: '',
    solvent: '',
    equipmentCleaningDate: '',
    equipmentCleaningTime: '',
  });

  const [operations, setOperations] = useState<OperationRow[]>([]);
  const [newOp, setNewOp] = useState<OperationRow>({
    date: '',
    washNo: '',
    equipmentCode: '',
    startTime: '',
    endTime: '',
    collectionTime: '',
    operator: '',
    remarks: '',
  });
  const [showOpModal, setShowOpModal] = useState(false);

  const [verification, setVerification] = useState<Verification>({
    checkedBy: '',
    verifiedBy: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...(existingTask ? { id: existingTask.id } : {}),
      material,
      operations,
      verification,
    };

    if (existingTask) {
      console.log('Update Purification Log', payload);
    } else {
      console.log('Create new Purification Log', payload);
    }

    navigate('/purification');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← Back to Purification Logs
      </button>

      <h2 className="text-2xl font-bold mb-6">
        {existingTask ? `Edit Purification #${existingTask.id}` : 'New Purification Log'}
      </h2>

      {/* Material Section */}
      <Section title="1. Material Details" open={openMat} toggle={() => setOpenMat((o) => !o)}>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(material).map(([key, val]) => (
            <label key={key} className="flex flex-col text-sm">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              <input
                type="text"
                value={val}
                onChange={(e) => setMaterial((m) => ({ ...m, [key]: e.target.value }))}
                className="mt-1 border rounded px-2 py-1"
              />
            </label>
          ))}
        </div>
      </Section>

      {/* Operation Table */}
      <Section
        title="2. Purification Operations"
        open={openOps}
        toggle={() => setOpenOps((o) => !o)}
      >
        {operations.length > 0 ? (
          <div className="overflow-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(newOp).map((key) => (
                    <th key={key} className="border px-2 py-1">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operations.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="border px-2 py-1">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No operations added yet.</p>
        )}
        <button
          type="button"
          onClick={() => setShowOpModal(true)}
          className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Operation
        </button>

        {/* Modal */}
        {showOpModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
              <h3 className="text-lg font-semibold mb-4">Add Operation Entry</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(newOp).map(([key, val]) => (
                  <label key={key} className="flex flex-col text-sm">
                    {key.replace(/([A-Z])/g, ' $1')}
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setNewOp((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="mt-1 border rounded px-2 py-1"
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOpModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOperations((prev) => [...prev, { ...newOp }]);
                    setNewOp({
                      date: '',
                      washNo: '',
                      equipmentCode: '',
                      startTime: '',
                      endTime: '',
                      collectionTime: '',
                      operator: '',
                      remarks: '',
                    });
                    setShowOpModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Verification Section */}
      <Section title="3. Final Verification" open={openVer} toggle={() => setOpenVer((o) => !o)}>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col text-sm">
            Checked By
            <input
              type="text"
              value={verification.checkedBy}
              onChange={(e) => setVerification((v) => ({ ...v, checkedBy: e.target.value }))}
              className="mt-1 border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Verified By
            <input
              type="text"
              value={verification.verifiedBy}
              onChange={(e) => setVerification((v) => ({ ...v, verifiedBy: e.target.value }))}
              className="mt-1 border rounded px-2 py-1"
            />
          </label>
        </div>
      </Section>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {existingTask ? 'Save Changes' : 'Create Log'}
        </button>
      </div>
    </form>
  );
};
