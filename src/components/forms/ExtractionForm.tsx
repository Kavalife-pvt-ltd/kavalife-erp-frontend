import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ExtractionTask = {
  id: number;
  grnNo: string;
  date: string;
  solvent: string;
  operator: string;
  status: 'in-progress' | 'completed';
};

type MaterialRow = {
  date: string;
  product: string;
  variety: string;
  batchNo: string;
  grn: string;
  solvent: string;
  equipmentCode: string;
  quantity: string;
  filterCloth: string;
  cleaningDate: string;
};

type TimingRow = {
  washNo: string;
  solventQty: string;
  sprayingFrom: string;
  sprayingTo: string;
  miscellaQty: string;
  collectedTo: string;
  operator: string;
  remarks: string;
};

type RecoveryEntry = {
  timestamp: string;
  operator: string;
  remarks: string;
};

interface ExtractionFormProps {
  existingTask: ExtractionTask | null;
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

export const ExtractionForm: React.FC<ExtractionFormProps> = ({ existingTask }) => {
  const navigate = useNavigate();

  const [openMat, setOpenMat] = useState(true);
  const [openLog, setOpenLog] = useState(true);
  const [openRec, setOpenRec] = useState(true);

  const emptyMat: MaterialRow = {
    date: '',
    product: '',
    variety: '',
    batchNo: '',
    grn: '',
    solvent: '',
    equipmentCode: '',
    quantity: '',
    filterCloth: '',
    cleaningDate: '',
  };

  const emptyTiming: TimingRow = {
    washNo: '',
    solventQty: '',
    sprayingFrom: '',
    sprayingTo: '',
    miscellaQty: '',
    collectedTo: '',
    operator: '',
    remarks: '',
  };

  const recoveryLabels = [
    'Top stream started at',
    'Bottom stream started at',
    'Closing time',
    'Time taken',
    'Checked by',
  ] as const;

  const timing_labels: Record<keyof TimingRow, string> = {
    washNo: 'Wash No.',
    solventQty: 'Solvent Qty',
    sprayingFrom: 'Spraying From',
    sprayingTo: 'Spraying To',
    miscellaQty: 'Miscella Qty',
    collectedTo: 'Collected To',
    operator: 'Operator',
    remarks: 'Remarks',
  };

  const material_labels: Record<keyof MaterialRow, string> = {
    date: 'Date',
    product: 'Product',
    variety: 'Variety',
    batchNo: 'Batch No.',
    grn: 'GRN No.',
    solvent: 'Solvent',
    equipmentCode: 'Equipment Code',
    quantity: 'Quantity',
    filterCloth: 'Filter Cloth',
    cleaningDate: 'Cleaning Date',
  };

  const [materials, setMaterials] = useState<MaterialRow[]>([{ ...emptyMat }]);
  const [timings, setTimings] = useState<TimingRow[]>([{ ...emptyTiming }]);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [newTiming, setNewTiming] = useState<TimingRow>({ ...emptyTiming });
  const [recovery, setRecovery] = useState<Record<string, RecoveryEntry>>(() =>
    Object.fromEntries(
      recoveryLabels.map((lbl) => [lbl, { timestamp: '', operator: '', remarks: '' }])
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...(existingTask ? { id: existingTask.id } : {}),
      materials,
      timings,
      recovery,
    };

    if (existingTask) {
      console.log('Updating extraction log', existingTask.id, payload);
      // TODO: PUT /api/extraction/${existingTask.id}
    } else {
      console.log('Creating new extraction log', payload);
      // TODO: POST /api/extraction
    }

    navigate('/extraction');
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
          ← Back to Extraction Logs
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">
        {existingTask ? `Edit Extraction #${existingTask.id}` : 'New Extraction Log'}
      </h2>

      {/* 1. Materials */}
      <Section title="1. Materials Details" open={openMat} toggle={() => setOpenMat((o) => !o)}>
        <div className="space-y-4">
          {materials.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              {(Object.entries(row) as [keyof MaterialRow, string][]).map(([field, val]) => (
                <label
                  key={field}
                  className="flex flex-col text-sm font-medium text-black dark:text-white"
                >
                  {material_labels[field]}
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMaterials((ms) => {
                        const c = [...ms];
                        c[i] = { ...c[i], [field]: v };
                        return c;
                      });
                    }}
                    className="mt-1 border rounded px-2 py-1 text-gray-600 "
                  />
                </label>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Log Timings */}
      <Section title="2. Log Timings" open={openLog} toggle={() => setOpenLog((o) => !o)}>
        <div className="space-y-4">
          {timings.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {Object.keys(timings[0]).map((key) => (
                      <th key={key}>{timing_labels[key as keyof TimingRow] ?? key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timings.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {Object.values(row).map((cell, i) => (
                        <td key={i} className="border px-2 py-1 text-gray-800 dark:text-gray-100">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No log timings added yet.</p>
          )}
          <button
            type="button"
            onClick={() => setShowTimingModal(true)}
            className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Log
          </button>
          {showTimingModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Add Log Timing</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(Object.entries(newTiming) as [keyof TimingRow, string][]).map(([key, val]) => (
                    <label key={key} className="flex flex-col text-sm text-black dark:text-white">
                      <label>{timing_labels[key]}</label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setNewTiming((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="mt-1 border rounded px-2 py-1 text-gray-900"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTimingModal(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimings((prev) => [...prev, { ...newTiming }]);
                      setNewTiming({ ...emptyTiming });
                      setShowTimingModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 3. Solvent Recovery */}
      <Section title="3. Solvent Recovery" open={openRec} toggle={() => setOpenRec((o) => !o)}>
        <div className="space-y-4">
          {recoveryLabels.map((lbl) => (
            <div key={lbl} className="flex items-center space-x-4">
              <span className="w-48">{lbl}:</span>
              <input
                type="datetime-local"
                value={recovery[lbl].timestamp}
                onChange={(e) =>
                  setRecovery((r) => ({
                    ...r,
                    [lbl]: { ...r[lbl], timestamp: e.target.value },
                  }))
                }
                className="flex-1 border rounded px-2 py-1 text-gray-600 "
              />
              <input
                type="text"
                placeholder="Operator"
                value={recovery[lbl].operator}
                onChange={(e) =>
                  setRecovery((r) => ({
                    ...r,
                    [lbl]: { ...r[lbl], operator: e.target.value },
                  }))
                }
                className="flex-1 border rounded px-2 py-1 text-gray-600 "
              />
              <input
                type="text"
                placeholder="Remarks"
                value={recovery[lbl].remarks}
                onChange={(e) =>
                  setRecovery((r) => ({
                    ...r,
                    [lbl]: { ...r[lbl], remarks: e.target.value },
                  }))
                }
                className="flex-1 border rounded px-2 py-1 text-gray-600 "
              />
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2  bg-red-600 text-white rounded hover:bg-red-700 dark:hover:bg-red-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {existingTask ? 'Save Changes' : 'Create Log'}
        </button>
      </div>
    </form>
  );
};
