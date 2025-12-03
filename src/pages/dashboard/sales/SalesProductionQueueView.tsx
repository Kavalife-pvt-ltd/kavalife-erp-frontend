import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import type { SalesPO } from '@/types/sales';
import { listSalesPO, updateSalesPOStatus } from '@/api/sales';
import toast from 'react-hot-toast';

type CompleteModalProps = {
  po: SalesPO;
  onClose: () => void;
  onUpdated: (updated: SalesPO) => void;
};

const ProductionCompleteModal: React.FC<CompleteModalProps> = ({ po, onClose, onUpdated }) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await updateSalesPOStatus(po.id, {
        toStatus: 'production_completed',
        newComments: notes || undefined,
        sendTo: 'admin',
      });

      toast.success('Marked as completed and sent to Admin');
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to update PO status';

      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">
              Production Completion – {po.poNumber ?? 'PO'}
            </h2>
            <p className="text-xs text-primaryText/70">
              {po.companyName} • {po.quantity} {po.quantityUnit ?? ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-primaryText/60 hover:text-primaryText"
          >
            ✕
          </button>
        </header>

        <section className="mb-3 space-y-2 text-xs text-primaryText/80">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
              Created On
            </span>
            <p>{createdDate || '—'}</p>
          </div>
          {po.comments && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                Sales / Admin Comments
              </span>
              <p className="whitespace-pre-line">{po.comments}</p>
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
              Notes for Admin / QA
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-stroke bg-background p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
              placeholder="Optional: Add batch details, yield, etc."
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stroke bg-background px-3 py-1 text-xs text-primaryText hover:bg-stroke/40"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Mark Complete & Send to Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SalesProductionQueueView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  const role = (authUser?.role as string | undefined) ?? 'sales';
  const department = authUser?.department ?? '';

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      setError('authUser not found. Please log in again.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // POs currently sitting with Production
        const res = await listSalesPO({ sendTo: 'production' });

        if (!cancelled) {
          setData(res);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load Production queue';

        if (axios.isAxiosError(err)) {
          const d = err.response?.data as
            | { error?: string; message?: string; details?: string }
            | undefined;
          message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
        } else if (err instanceof Error) {
          message = err.message || message;
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  if (!authUser) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        Please log in to view this queue.
      </div>
    );
  }

  const canSee =
    role === 'admin' || department === 'production' || authUser.department === 'production';
  if (!canSee) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-6 text-sm text-primaryText">
        You do not have permission to access the Production Queue.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primaryText">Production Queue</h2>
          <span className="text-xs text-primaryText/70">{data.length} pending</span>
        </div>
        {data.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            No POs currently assigned to Production.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((po) => (
              <SalesPOCard key={po.id} po={po} onClick={() => setSelectedPO(po)} />
            ))}
          </div>
        )}
      </div>

      {selectedPO && (
        <ProductionCompleteModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          onUpdated={(updated) => {
            setData((prev) => prev.filter((p) => p.id !== updated.id));
          }}
        />
      )}
    </>
  );
};

export default SalesProductionQueueView;
