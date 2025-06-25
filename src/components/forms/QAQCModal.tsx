import { useState } from 'react';
import type { QAQCData } from '@/types/grn';
import { X } from 'lucide-react';

interface QAQCModalProps {
  grnId: number;
  existingData?: QAQCData;
  onClose: () => void;
}

export const QAQCModal = ({ grnId, existingData, onClose }: QAQCModalProps) => {
  /** Section toggles **/
  const [openSampler, setOpenSampler] = useState(true);
  const [openQC, setOpenQC] = useState(true);
  const [openAssurance, setOpenAssurance] = useState(true);

  /** Sampler’s Comment **/
  const [containersSampled, setContainersSampled] = useState<number>(
    existingData?.containersSampled ?? 0
  );
  const [sampledQuantity, setSampledQuantity] = useState<number>(
    existingData?.sampledQuantity ?? 0
  );
  const [sampledBy, setSampledBy] = useState<string>(existingData?.sampledBy ?? '');
  const [sampledOn, setSampledOn] = useState<string>(
    existingData?.sampledOn ?? new Date().toISOString().substr(0, 10)
  );

  /** QC Comment **/
  const [arNumber, setArNumber] = useState<string>(existingData?.arNumber ?? '');
  const [releaseDate, setReleaseDate] = useState<string>(
    existingData?.releaseDate ?? new Date().toISOString().substr(0, 10)
  );
  const [potency, setPotency] = useState<string>(existingData?.potency ?? '');
  const [moistureContent, setMoistureContent] = useState<string>(
    existingData?.moistureContent ?? ''
  );
  const [yieldPercent, setYieldPercent] = useState<string>(existingData?.yieldPercent ?? '');
  // derive status type
  type Status = QAQCData['status'];
  const [status, setStatus] = useState<Status>(existingData?.status ?? 'approved');
  const [analystRemark, setAnalystRemark] = useState<string>(existingData?.analystRemark ?? '');

  /** Assurance By **/
  const [analysedBy, setAnalysedBy] = useState<string>(existingData?.analysedBy ?? '');
  const [approvedBy, setApprovedBy] = useState<string>(existingData?.approvedBy ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: QAQCData = {
      containersSampled,
      sampledQuantity,
      sampledBy,
      sampledOn,
      arNumber,
      releaseDate,
      potency,
      moistureContent,
      yieldPercent,
      status,
      analystRemark,
      analysedBy,
      approvedBy,
    };
    // TODO: call QA/QC API with payload
    console.log('Submitting QAQC for', grnId, payload);
    onClose();
  };

  /** Collapsible Section Header **/
  const SectionHeader = ({
    label,
    open,
    onToggle,
  }: {
    label: string;
    open: boolean;
    onToggle: () => void;
  }) => (
    <div
      onClick={onToggle}
      className="flex justify-between items-center cursor-pointer bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded"
    >
      <span className="font-semibold">{label}</span>
      <span className={`${open ? 'transform rotate-90' : ''}`}>▶</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-[80vw] max-w-[80vw] max-h-[90vh] overflow-auto "
      >
        <h2 className="text-2xl font-bold mb-4">QA/QC for GRN #{grnId}</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        {/* Sampler’s Comment */}
        <section className="mb-4">
          <SectionHeader
            label="Sampler's Comment"
            open={openSampler}
            onToggle={() => setOpenSampler((o) => !o)}
          />
          {openSampler && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <label className="block">
                No. of containers sampled
                <input
                  type="number"
                  value={containersSampled}
                  onChange={(e) => setContainersSampled(+e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  min={0}
                />
              </label>
              <label className="block">
                Sampled quantity
                <input
                  type="number"
                  value={sampledQuantity}
                  onChange={(e) => setSampledQuantity(+e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  min={0}
                />
              </label>
              <label className="block col-span-2">
                Sampled by
                <input
                  value={sampledBy}
                  onChange={(e) => setSampledBy(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block col-span-2">
                Sampled on
                <input
                  type="date"
                  value={sampledOn}
                  onChange={(e) => setSampledOn(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
            </div>
          )}
        </section>

        {/* QC Comment */}
        <section className="mb-4">
          <SectionHeader label="QC Comment" open={openQC} onToggle={() => setOpenQC((o) => !o)} />
          {openQC && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <label className="block">
                AR Number
                <input
                  value={arNumber}
                  onChange={(e) => setArNumber(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block">
                Release date
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block">
                Potency / Assays
                <input
                  value={potency}
                  onChange={(e) => setPotency(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block">
                LOD / Moisture content
                <input
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block">
                Yield (%)
                <input
                  value={yieldPercent}
                  onChange={(e) => setYieldPercent(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                >
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="block col-span-2">
                Analyst remark
                <textarea
                  value={analystRemark}
                  onChange={(e) => setAnalystRemark(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
            </div>
          )}
        </section>

        {/* Assurance By */}
        <section className="mb-4">
          <SectionHeader
            label="Assurance By"
            open={openAssurance}
            onToggle={() => setOpenAssurance((o) => !o)}
          />
          {openAssurance && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <label className="block">
                Analysed by
                <input
                  value={analysedBy}
                  onChange={(e) => setAnalysedBy(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
              <label className="block">
                Approved by
                <input
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                />
              </label>
            </div>
          )}
        </section>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {existingData ? 'Update QA/QC' : 'Submit QA/QC'}
          </button>
        </div>
      </form>
    </div>
  );
};
