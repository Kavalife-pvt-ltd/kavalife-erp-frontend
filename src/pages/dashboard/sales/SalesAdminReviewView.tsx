import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import type { SalesPO } from '@/types/sales';
import { listSalesPO, updateSalesPOStatus } from '@/api/sales';

type AdminReviewModalProps = {
  po: SalesPO;
  onClose: () => void;
  onUpdated: (updated: SalesPO) => void;
};

const AdminReviewModal: React.FC<AdminReviewModalProps> = ({ po, onClose, onUpdated }) => {
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [route, setRoute] = useState<'purchase' | 'production'>('production');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload =
        decision === 'approve'
          ? {
              toStatus: 'quote_admin_approved' as const,
              newComments: notes || undefined,
              fulfillmentType: route,
            }
          : {
              toStatus: 'admin_rejected' as const,
              rejectionReason: notes || undefined,
            };

      const updated = await updateSalesPOStatus(po.id, payload);
      toast.success(
        decision === 'approve' ? 'PO approved successfully' : 'PO rejected successfully'
      );
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
              Admin Review – {po.poNumber ?? 'PO'}
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
                Sales Comments
              </span>
              <p className="whitespace-pre-line">{po.comments}</p>
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-4 text-xs text-primaryText">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="decision"
                value="approve"
                checked={decision === 'approve'}
                onChange={() => setDecision('approve')}
                className="h-3 w-3"
              />
              <span>Approve</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="decision"
                value="reject"
                checked={decision === 'reject'}
                onChange={() => setDecision('reject')}
                className="h-3 w-3"
              />
              <span>Reject</span>
            </label>
          </div>

          {decision === 'approve' && (
            <div className="flex flex-wrap gap-4 text-xs text-primaryText">
              <span className="text-[11px] uppercase tracking-wide text-primaryText/60">
                Route to
              </span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="route"
                  value="production"
                  checked={route === 'production'}
                  onChange={() => setRoute('production')}
                  className="h-3 w-3"
                />
                <span>Production</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="route"
                  value="purchase"
                  checked={route === 'purchase'}
                  onChange={() => setRoute('purchase')}
                  className="h-3 w-3"
                />
                <span>Purchase</span>
              </label>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
              Comments / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-stroke bg-background p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
              placeholder={
                decision === 'approve'
                  ? 'Optional: add any remarks for sales / audit.'
                  : 'Reason for rejection (recommended).'
              }
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
              {submitting
                ? decision === 'approve'
                  ? 'Approving...'
                  : 'Rejecting...'
                : decision === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SalesAdminReviewView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  const role = (authUser?.role as string | undefined) ?? 'sales';

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

        // Only show POs waiting for first admin decision
        const res = await listSalesPO({ status: 'quote_requested' });

        if (!cancelled) {
          setData(res);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load POs for review';

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
        Please log in to view POs.
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-6 text-sm text-primaryText">
        You do not have permission to access Admin Review. Please contact an admin if you need
        broader access.
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
          <h2 className="text-sm font-semibold text-primaryText">Admin Review</h2>
          <span className="text-xs text-primaryText/70">{data.length} pending</span>
        </div>
        {data.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            No POs awaiting admin review right now.
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
        <AdminReviewModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          onUpdated={(updated) => {
            // remove from list after decision
            setData((prev) => prev.filter((p) => p.id !== updated.id));
          }}
        />
      )}
    </>
  );
};

export default SalesAdminReviewView;
