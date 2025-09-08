import { useState, useEffect } from 'react';
import type { QAQCData } from '@/types/grn';
import { X } from 'lucide-react';
import { createQAQCEntry, fetchQAQCEntry } from '@/api/qaqc';

interface QAQCModalProps {
  grnId: number;
  mode: 'create' | 'view';
  grnNumber: string;
  existingData?: QAQCData;
  onClose: () => void;
}

export const QAQCModal = ({ mode, onClose, grnNumber }: QAQCModalProps) => {
  /** Section toggles **/
  const [openSampler, setOpenSampler] = useState(true);
  const [openQC, setOpenQC] = useState(true);
  const [openAssurance, setOpenAssurance] = useState(true);

  /** Sampler’s Comment **/
  const [containersSampled, setContainersSampled] = useState<number>(0);
  const [sampledQuantity, setSampledQuantity] = useState<number>(0);
  const [sampledBy, setSampledBy] = useState<string>('');
  const [sampledOn, setSampledOn] = useState<string>(new Date().toISOString().substr(0, 10));

  /** QC Comment **/
  const [arNumber, setArNumber] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState<string>(new Date().toISOString().substr(0, 10));
  const [potency, setPotency] = useState<string>('');
  const [moistureContent, setMoistureContent] = useState<string>('');
  const [yieldPercent, setYieldPercent] = useState<string>('');
  type Status = QAQCData['status'];
  const [status, setStatus] = useState<Status>('approved');
  const [analystRemark, setAnalystRemark] = useState<string>('');

  /** Assurance By **/
  const [analysedBy, setAnalysedBy] = useState<string>('');
  const [approvedBy, setApprovedBy] = useState<string>('');

  useEffect(() => {
    if (mode === 'view') {
      fetchQAQCEntry(grnNumber)
        .then((data) => {
          if (data) {
            setContainersSampled(data.containersSampled ?? 0);
            setSampledQuantity(data.sampledQuantity ?? 0);
            setSampledBy(data.sampledBy ?? '');
            setSampledOn(data.sampledOn ?? new Date().toISOString().substr(0, 10));
            setArNumber(data.arNumber ?? '');
            setReleaseDate(data.releaseDate ?? new Date().toISOString().substr(0, 10));
            setPotency(data.potency ?? '');
            setMoistureContent(data.moistureContent ?? '');
            setYieldPercent(data.yieldPercent ?? '');
            setStatus(data.status ?? 'approved');
            setAnalystRemark(data.analystRemark ?? '');
            setAnalysedBy(data.analysedBy ?? '');
            setApprovedBy(data.approvedBy ?? '');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch QAQC data', err);
          alert('Failed to load QAQC data. Please try again.');
        });
    }
  }, [mode, grnNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      const payload = {
        processType: 'grn',
        processRef: grnNumber,
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
      try {
        await createQAQCEntry(payload);
        onClose();
      } catch (err) {
        console.error('Failed to submit QAQC', err);
        alert('Failed to submit QAQC. Please try again.');
      }
    }
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
        <h2 className="text-2xl font-bold mb-4">QA/QC for {grnNumber}</h2>
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
                  value={containersSampled}
                  onChange={(e) => setContainersSampled(+e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                Sampled quantity
                <input
                  value={sampledQuantity}
                  onChange={(e) => setSampledQuantity(+e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block col-span-2">
                Sampled by
                <input
                  value={sampledBy}
                  onChange={(e) => setSampledBy(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block col-span-2">
                Sampled on
                <input
                  type="date"
                  value={sampledOn}
                  onChange={(e) => setSampledOn(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
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
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                Release date
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                Potency / Assays
                <input
                  value={potency}
                  onChange={(e) => setPotency(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                LOD / Moisture content
                <input
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                Yield (%)
                <input
                  value={yieldPercent}
                  onChange={(e) => setYieldPercent(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
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
                  disabled={mode === 'view'}
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
                  disabled={mode === 'view'}
                />
              </label>
              <label className="block">
                Approved by
                <input
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1 text-black"
                  disabled={mode === 'view'}
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
          {mode === 'create' && (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit QA/QC
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
