import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import type { SalesPO } from '@/types/sales';
import { listSalesPO, updateSalesPOStatus } from '@/api/sales';
import { getCOASignedUrl } from '@/api/files';

type AdminReviewModalProps = {
  po: SalesPO;
  onClose: () => void;
  onUpdated: (updated: SalesPO) => void;
  onOpenCOA?: (po: SalesPO) => void;
};

const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  po,
  onClose,
  onUpdated,
  onOpenCOA,
}) => {
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [route, setRoute] = useState<'purchase' | 'production'>('production');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = po.status;
  const isInitialReview = status === 'quote_requested';
  const isFinalReview = status === 'production_completed' || status === 'quote_admin_approved';
  const isPriceApproval = status === 'purchase_priced';
  const isPurchasePriceReview = status === 'purchase_priced';

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      let toStatus: SalesPO['status'];

      if (isInitialReview) {
        if (decision === 'approve') {
          toStatus = route === 'purchase' ? 'routed_to_purchase' : 'routed_to_production';
        } else {
          toStatus = 'admin_rejected';
        }
      } else if (isPriceApproval) {
        if (decision === 'approve') {
          toStatus = 'purchase_approved';
        } else {
          toStatus = 'admin_rejected';
        }
      } else if (isFinalReview) {
        if (decision === 'approve') {
          toStatus = 'final_admin_approved';
        } else {
          toStatus = 'admin_rejected';
        }
      } else {
        throw new Error(`Unsupported status for admin review: ${status}`);
      }

      const payload =
        toStatus === 'admin_rejected'
          ? {
              toStatus,
              rejectionReason: notes || undefined,
            }
          : {
              toStatus,
              newComments: notes || undefined,
            };

      const updated = await updateSalesPOStatus(po.id, payload);
      toast.success('PO updated successfully');
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

  const handleViewCOA = () => {
    if (!po.coaUrl) {
      toast.error('No COA uploaded');
      return;
    }
    onOpenCOA?.(po);
  };

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
            <p className="text-[11px] text-primaryText/60">Current status: {po.status}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-primaryText/60 hover:text-primaryText"
          >
            ✕
          </button>
        </header>

        {/* Meta */}
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
                Latest Comments
              </span>
              <p className="whitespace-pre-line">{po.comments}</p>
            </div>
          )}

          {isPurchasePriceReview && (
            <section className="mb-2 rounded-lg border border-stroke bg-background p-2 text-xs text-primaryText">
              <div className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                Purchase Team Price
              </div>
              <div className="mt-1">{po.purchasePrice != null ? `₹ ${po.purchasePrice}` : '—'}</div>
            </section>
          )}
        </section>

        {/* Documents */}
        <section className="mb-3 space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
            Documents
          </div>

          {po.coaUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-stroke bg-background p-2 text-xs">
              <span className="flex items-center gap-2">📄 COA</span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleViewCOA}
                  className="text-accent hover:underline"
                >
                  View
                </button>

                <a
                  href={po.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primaryText/70 hover:underline"
                >
                  Download
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-primaryText/60">No documents uploaded</p>
          )}
        </section>

        {/* Actions */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Decision */}
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
              <span>
                {isInitialReview
                  ? 'Approve & Route'
                  : isPriceApproval
                    ? 'Approve Purchase Price'
                    : 'Final Approve'}
              </span>
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
              <span>Reject to Sales</span>
            </label>
          </div>

          {/* Route */}
          {isInitialReview && decision === 'approve' && (
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
                  ? isInitialReview
                    ? 'Optional: remarks while routing to Purchase/Production.'
                    : isPriceApproval
                      ? 'Optional: remarks while approving purchase price.'
                      : 'Optional: remarks for Final Approval.'
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
                  ? 'Saving...'
                  : 'Rejecting...'
                : decision === 'approve'
                  ? isInitialReview
                    ? 'Approve & Route'
                    : isPriceApproval
                      ? 'Approve'
                      : 'Final Approve'
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

  const openCOA = async (po: SalesPO) => {
    const path = po.coaUrl?.trim();
    if (!path) {
      toast.error('COA not available');
      return;
    }

    try {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        window.open(path, '_blank', 'noopener,noreferrer');
        return;
      }

      const signed = await getCOASignedUrl(path);
      window.open(signed, '_blank', 'noopener,noreferrer');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to open COA';
      toast.error(msg);
    }
  };

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

        const res = await listSalesPO({ sendTo: 'admin' });

        if (!cancelled) setData(res);
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
        if (!cancelled) setLoading(false);
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
        You do not have permission to access Admin Review.
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
            No POs currently in Admin queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((po) => (
              <SalesPOCard
                key={po.id}
                po={po}
                onClick={() => setSelectedPO(po)}
                onOpenCOA={openCOA}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPO && (
        <AdminReviewModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          onUpdated={(updated) => {
            setData((prev) => prev.filter((p) => p.id !== updated.id));
          }}
          onOpenCOA={openCOA}
        />
      )}
    </>
  );
};

export default SalesAdminReviewView;
