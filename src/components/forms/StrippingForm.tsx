import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type StrippingLogProps = {
  existingLog: {
    id: number;
    productName: string;
    batchNo: string;
    date: string;
    operator: string;
    status: 'in-progress' | 'completed';
  } | null;
};

type MaterialDetails = {
  productName: string;
  batchNo: string;
  chargingProduct: string;
  solvent: string;
  inputQuantity: string;
  plant: string;
  variety: string;
  loadingNo: string;
  equipmentCode: string;
  cleaningDate: string;
};

type OperationLog = {
  date: string;
  startingAt: string;
  applyVacuum: string;
  directSteamStart: string;
  directSteamStop: string;
  bottomAirStart: string;
  bottomAirStop: string;
  remarks: string;
  operator: string;
};

type OPRP2 = {
  temperature: string;
  vacuum: string;
};

type FinalOutput = {
  productObtained: string;
  yield: string;
  assayOrColour: string;
  residualSolvent: string;
  remarks: string;
  checkedBy: string;
  verifiedBy: string;
};

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

export const StrippingForm: React.FC<StrippingLogProps> = ({ existingLog }) => {
  const navigate = useNavigate();

  const [openMat, setOpenMat] = useState(true);
  const [openOps, setOpenOps] = useState(true);
  const [openOprp2, setOpenOprp2] = useState(true);
  const [openFinal, setOpenFinal] = useState(true);

  const [material, setMaterial] = useState<MaterialDetails>({
    productName: '',
    batchNo: '',
    chargingProduct: '',
    solvent: '',
    inputQuantity: '',
    plant: '',
    variety: '',
    loadingNo: '',
    equipmentCode: '',
    cleaningDate: '',
  });

  const [operations, setOperations] = useState<OperationLog[]>([]);
  const [newOperation, setNewOperation] = useState<OperationLog>({
    date: '',
    startingAt: '',
    applyVacuum: '',
    directSteamStart: '',
    directSteamStop: '',
    bottomAirStart: '',
    bottomAirStop: '',
    remarks: '',
    operator: '',
  });

  const [showOpsModal, setShowOpsModal] = useState(false);

  const [oprp2, setOprp2] = useState<OPRP2>({
    temperature: '',
    vacuum: '',
  });

  const [finalOutput, setFinalOutput] = useState<FinalOutput>({
    productObtained: '',
    yield: '',
    assayOrColour: '',
    residualSolvent: '',
    remarks: '',
    checkedBy: '',
    verifiedBy: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...(existingLog ? { id: existingLog.id } : {}),
      material,
      operations,
      oprp2,
      finalOutput,
    };

    if (existingLog) {
      console.log('Updating stripping log', existingLog.id, payload);
    } else {
      console.log('Creating new stripping log', payload);
    }

    navigate('/stripping');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto px-4 py-6 text-black dark:text-white"
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Stripping Logs
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">
        {existingLog ? `Edit Stripping #${existingLog.id}` : 'New Stripping Log'}
      </h2>

      {/* 1. Material Details */}
      <Section title="1. Material Details" open={openMat} toggle={() => setOpenMat((o) => !o)}>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(material) as [keyof MaterialDetails, string][]).map(([key, val]) => (
            <label key={key} className="flex flex-col text-sm">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              <input
                type="text"
                value={val}
                onChange={(e) =>
                  setMaterial((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className="mt-1 border rounded px-2 py-1 text-gray-900"
              />
            </label>
          ))}
        </div>
      </Section>

      {/* 2. Stripping Operation Log */}
      <Section title="2. Stripping Operations" open={openOps} toggle={() => setOpenOps((o) => !o)}>
        {operations.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {Object.keys(operations[0]).map((key) => (
                  <th key={key}>{key.replace(/([A-Z])/g, ' $1')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operations.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((cell, j) => (
                    <td key={j} className="border px-2 py-1 text-gray-800 dark:text-white">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No operation logs yet.</p>
        )}
        <button
          type="button"
          onClick={() => setShowOpsModal(true)}
          className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Operation Log
        </button>

        {showOpsModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
              <h3 className="text-lg font-semibold mb-4">Add Operation</h3>
              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(newOperation) as [keyof OperationLog, string][]).map(
                  ([key, val]) => (
                    <label key={key} className="flex flex-col text-sm">
                      {key.replace(/([A-Z])/g, ' $1')}
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setNewOperation((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="mt-1 border rounded px-2 py-1 text-gray-900"
                      />
                    </label>
                  )
                )}
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOpsModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOperations((prev) => [...prev, { ...newOperation }]);
                    setNewOperation({
                      date: '',
                      startingAt: '',
                      applyVacuum: '',
                      directSteamStart: '',
                      directSteamStop: '',
                      bottomAirStart: '',
                      bottomAirStop: '',
                      remarks: '',
                      operator: '',
                    });
                    setShowOpsModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* 3. OPRP-2 */}
      <Section title="3. OPRP-2" open={openOprp2} toggle={() => setOpenOprp2((o) => !o)}>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(oprp2) as [keyof OPRP2, string][]).map(([key, val]) => (
            <label key={key} className="flex flex-col text-sm">
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <input
                type="text"
                value={val}
                onChange={(e) =>
                  setOprp2((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className="mt-1 border rounded px-2 py-1 text-gray-900"
              />
            </label>
          ))}
        </div>
      </Section>

      {/* 4. Final Output */}
      <Section title="4. Final Output" open={openFinal} toggle={() => setOpenFinal((o) => !o)}>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(finalOutput) as [keyof FinalOutput, string][]).map(([key, val]) => (
            <label key={key} className="flex flex-col text-sm">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              <input
                type="text"
                value={val}
                onChange={(e) =>
                  setFinalOutput((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className="mt-1 border rounded px-2 py-1 text-gray-900"
              />
            </label>
          ))}
        </div>
      </Section>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {existingLog ? 'Save Changes' : 'Create Log'}
        </button>
      </div>
    </form>
  );
};
