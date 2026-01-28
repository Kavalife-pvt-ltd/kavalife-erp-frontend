import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import { listSalesPO, getSalesPOStatusLog, updateSalesPOStatus } from '@/api/sales';
import type { SalesPO, SalesPOStatusLog } from '@/types/sales';

type AdminActionMode = 'route' | 'final';
type RouteTarget = 'purchase' | 'production';

type AdminModalProps = {
  po: SalesPO;
  mode: AdminActionMode;
  onClose: () => void;
  onUpdated: (updated: SalesPO) => void;
};

const AdminReviewModal: React.FC<AdminModalProps> = ({ po, mode, onClose, onUpdated }) => {
  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [routeTarget, setRouteTarget] = useState<RouteTarget>('purchase');

  const [submitting, setSubmitting] = useState(false);

  // timeline
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadingLogs(true);
        setLogError(null);
        const res = await getSalesPOStatusLog(po.id);
        if (!cancelled) setLogs(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load status history';
        if (axios.isAxiosError(err)) {
          const d = err.response?.data as
            | { error?: string; message?: string; details?: string }
            | undefined;
          message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
        } else if (err instanceof Error) {
          message = err.message || message;
        }
        setLogError(message);
      } finally {
        if (!cancelled) setLoadingLogs(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [po.id]);

  const createdAt = po.requestDate ? new Date(po.requestDate).toLocaleString() : '—';

  const timeline = useMemo(() => {
    return logs.map((l) => ({
      id: l.id,
      label: `${l.fromStatus ? `${l.fromStatus} → ` : ''}${l.toStatus}`,
      at: new Date(l.changedAt).toLocaleString(),
      note: l.note ?? '',
    }));
  }, [logs]);

  const handleRoute = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const toStatus = routeTarget === 'purchase' ? 'routed_to_purchase' : 'routed_to_production';

      const updated = await updateSalesPOStatus(po.id, {
        toStatus: toStatus,
        newComments: notes || undefined,
        sendTo: routeTarget === 'purchase' ? 'purchase' : 'production',
      });

      toast.success(`Routed to ${routeTarget}`);
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to route PO';
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalApprove = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const updated = await updateSalesPOStatus(po.id, {
        toStatus: 'final_admin_approved' as const,
        newComments: notes || undefined,
        sendTo: 'sales',
      });

      toast.success('Final approved ✅ (sent to Sales)');
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to final approve PO';
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (submitting) return;

    if (!rejectionReason.trim()) {
      toast.error('Please add a rejection reason.');
      return;
    }

    setSubmitting(true);

    try {
      const updated = await updateSalesPOStatus(po.id, {
        toStatus: 'admin_rejected',
        rejectionReason: rejectionReason.trim(),
        sendTo: 'sales',
      });

      toast.success('Rejected → sent back to Sales');
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to reject PO';
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">
              Admin {mode === 'route' ? 'Inquiry Review' : 'Final Review'} – {po.poNumber ?? 'PO'}
            </h2>
            <p className="text-xs text-primaryText/70">
              {po.companyName} • {po.quantity} {po.quantityUnit ?? ''} •{' '}
              <span className="font-medium">{po.status}</span>
            </p>
            <p className="text-[11px] text-primaryText/60">Created: {createdAt}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-primaryText/60 hover:text-primaryText"
          >
            ✕
          </button>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: Actions */}
          <section className="space-y-3 text-xs text-primaryText">
            {mode === 'route' && (
              <div className="rounded-lg border border-stroke bg-background p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
                  Route to
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="route"
                      value="purchase"
                      checked={routeTarget === 'purchase'}
                      onChange={() => setRouteTarget('purchase')}
                      className="h-3 w-3"
                    />
                    <span>Purchase</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="route"
                      value="production"
                      checked={routeTarget === 'production'}
                      onChange={() => setRouteTarget('production')}
                      className="h-3 w-3"
                    />
                    <span>Production</span>
                  </label>
                </div>

                <div className="mt-3 space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                    Admin Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-stroke bg-foreground p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Optional notes for purchase/production/sales…"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleRoute}
                    disabled={submitting}
                    className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? 'Routing…' : `Route to ${routeTarget}`}
                  </button>
                </div>
              </div>
            )}

            {mode === 'final' && (
              <div className="rounded-lg border border-stroke bg-background p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
                  Final Approval
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                    Admin Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-stroke bg-foreground p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Optional notes for sales / audit…"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleFinalApprove}
                    disabled={submitting}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? 'Approving…' : 'Final Approve (create PO)'}
                  </button>
                </div>
              </div>
            )}

            {/* Reject */}
            <div className="rounded-lg border border-stroke bg-background p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-red-500">
                Reject to Sales
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-stroke bg-foreground p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-red-400"
                placeholder="Required: reason for rejection / what sales should fix…"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </div>
          </section>

          {/* Right: Timeline */}
          <section className="text-xs text-primaryText">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
              Status History
            </p>

            <div className="max-h-[360px] space-y-1 overflow-y-auto rounded-lg border border-stroke bg-background p-2">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-6">
                  <Loader />
                </div>
              ) : logError ? (
                <p className="text-xs text-red-500">{logError}</p>
              ) : timeline.length === 0 ? (
                <p className="text-[11px] text-primaryText/60">No status changes logged yet.</p>
              ) : (
                timeline.map((t) => (
                  <div key={t.id} className="rounded-md bg-foreground/40 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold">{t.label}</span>
                      <span className="text-[11px] text-primaryText/60">{t.at}</span>
                    </div>
                    {!!t.note && (
                      <p className="mt-1 whitespace-pre-line text-[11px] text-primaryText/70">
                        {t.note}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <p className="mt-2 text-[11px] text-primaryText/60">
              Tip: status tells “what happened”, sendTo tells “who acts next”.
            </p>
          </section>
        </div>

        <footer className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stroke bg-background px-3 py-1 text-xs text-primaryText hover:bg-stroke/40"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

const SalesAdminFinalReviewView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string; department?: string };
  };

  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);
  const [selectedMode, setSelectedMode] = useState<AdminActionMode>('route');

  const role = authUser?.role ?? 'sales';

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // Admin queue = sendTo=admin
        const res = await listSalesPO({ sendTo: 'admin' });

        if (cancelled) return;
        setData(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load admin queue';
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
  }, []);

  // Filter within admin queue by status
  const inquiryReview = useMemo(() => data.filter((po) => po.status === 'quote_requested'), [data]);

  const finalReview = useMemo(
    () =>
      data.filter(
        (po) => po.status === 'purchase_completed' || po.status === 'production_completed'
      ),
    [data]
  );

  const openModal = (po: SalesPO) => {
    const mode: AdminActionMode = po.status === 'quote_requested' ? 'route' : 'final';

    setSelectedMode(mode);
    setSelectedPO(po);
  };

  const removeFromList = (updated: SalesPO) => {
    // after action, it usually leaves admin queue (sendTo changes), so remove it
    setData((prev) => prev.filter((p) => p.id !== updated.id));
  };

  if (!authUser) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        Please log in to access admin review.
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-6 text-sm text-primaryText">
        You do not have permission to access Sales Admin.
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
      <div className="flex h-full flex-col gap-5">
        {/* Inquiry Review */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primaryText">Inquiry Review</h2>
            <span className="text-xs text-primaryText/70">{inquiryReview.length} pending</span>
          </div>

          {inquiryReview.length === 0 ? (
            <div className="rounded-xl border border-stroke bg-foreground p-5 text-sm text-primaryText/70">
              No inquiries waiting for initial admin routing.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {inquiryReview.map((po) => (
                <SalesPOCard key={po.id} po={po} onClick={() => openModal(po)} />
              ))}
            </div>
          )}
        </section>

        {/* Final Review */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primaryText">Final Review</h2>
            <span className="text-xs text-primaryText/70">{finalReview.length} pending</span>
          </div>

          {finalReview.length === 0 ? (
            <div className="rounded-xl border border-stroke bg-foreground p-5 text-sm text-primaryText/70">
              No items waiting for final admin approval.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {finalReview.map((po) => (
                <SalesPOCard key={po.id} po={po} onClick={() => openModal(po)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedPO && (
        <AdminReviewModal
          po={selectedPO}
          mode={selectedMode}
          onClose={() => setSelectedPO(null)}
          onUpdated={(updated) => removeFromList(updated)}
        />
      )}
    </>
  );
};

export default SalesAdminFinalReviewView;
