// src/pages/dashboard/sales/SalesMyPOsView.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import type { SalesPO, SalesPOStatusLog, SalesPOStatus } from '@/types/sales';
import {
  getSalesPOs,
  getSalesPOStatusLog,
  updateSalesPOStatus,
  type UpdateSalesPOStatusRequest,
} from '@/api/sales';

type DetailModalProps = {
  po: SalesPO;
  onClose: () => void;
  onUpdated: (updated: SalesPO) => void;
};

const SalesMyPODetailModal: React.FC<DetailModalProps> = ({ po, onClose, onUpdated }) => {
  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  // renegotiation / re-submit fields
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newComments, setNewComments] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';
  const expectedDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '';

  const canResubmit =
    po.status === 'admin_rejected' ||
    po.status === 'client_rejected' ||
    po.status === 'client_negotiation';

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

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canResubmit || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      let toStatus: SalesPOStatus;

      if (po.status === 'client_negotiation') {
        // Sales updated terms during negotiation and wants admin to approve again
        toStatus = 'quote_admin_approved';
      } else {
        // admin_rejected / client_rejected → go back to fresh quote request
        toStatus = 'quote_requested';
      }

      const payload: UpdateSalesPOStatusRequest = {
        toStatus,
        sendTo: 'admin',
      };

      if (newQuantity.trim()) {
        const q = Number(newQuantity);
        if (!Number.isNaN(q)) payload.newQuantity = q;
      }
      if (newPrice.trim()) {
        const p = Number(newPrice);
        if (!Number.isNaN(p)) payload.newAskingPrice = p;
      }
      if (newComments.trim()) {
        payload.newComments = newComments.trim();
      }

      const updated = await updateSalesPOStatus(po.id, payload);
      toast.success('PO sent to admin for review');
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to resubmit PO';

      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
        {/* Header */}
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">
              {po.poNumber ?? 'Sales PO'} – {po.requestType === 'sample' ? 'Sample' : 'Purchase'}
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

        {/* Main layout: details + history */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: PO details */}
          <section className="space-y-2 text-xs text-primaryText">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                Company
              </p>
              <p className="font-medium">{po.companyName}</p>
              <p className="text-primaryText/70 whitespace-pre-line">{po.companyAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Quantity</p>
                <p>
                  {po.quantity} {po.quantityUnit ?? ''}
                </p>
              </div>
              {po.askingPrice !== undefined && po.askingPrice !== null && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                    Asking Price
                  </p>
                  <p>{po.askingPrice}</p>
                </div>
              )}
              {po.purity && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Purity</p>
                  <p>{po.purity}</p>
                </div>
              )}
              {po.grade && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Grade</p>
                  <p>{po.grade}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Created On
                </p>
                <p>{createdDate || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Expected Delivery
                </p>
                <p>{expectedDate || '—'}</p>
              </div>
            </div>

            {po.comments && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Sales Comments
                </p>
                <p className="whitespace-pre-line text-primaryText/80">{po.comments}</p>
              </div>
            )}

            {po.rejectionReason && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-red-500">Rejection Reason</p>
                <p className="whitespace-pre-line text-red-500/90">{po.rejectionReason}</p>
              </div>
            )}
          </section>

          {/* Right: status history + resubmit */}
          <section className="flex flex-col gap-3 text-xs text-primaryText">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
                Status History
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-stroke bg-background p-2">
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader />
                  </div>
                ) : logError ? (
                  <p className="text-xs text-red-500">{logError}</p>
                ) : logs.length === 0 ? (
                  <p className="text-[11px] text-primaryText/60">No status changes recorded yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-[11px] text-primaryText/80">
                      <div>
                        <span className="font-semibold">
                          {log.fromStatus ?? '—'} → {log.toStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primaryText/60">
                          {new Date(log.changedAt).toLocaleString()}
                        </span>
                        {log.note && (
                          <span className="ml-2 line-clamp-1 text-primaryText/70">{log.note}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {canResubmit && (
              <form onSubmit={handleResubmit} className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
                  Resubmit to Admin
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-[11px] text-primaryText/70">
                      New Quantity (optional)
                    </label>
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-full rounded-md border border-stroke bg-background p-1.5 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[11px] text-primaryText/70">
                      New Asking Price (optional)
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full rounded-md border border-stroke bg-background p-1.5 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-[11px] text-primaryText/70">
                    Comments to Admin (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newComments}
                    onChange={(e) => setNewComments(e.target.value)}
                    className="w-full rounded-md border border-stroke bg-background p-1.5 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Explain negotiation context / changes you made..."
                  />
                </div>

                {submitError && <p className="text-xs text-red-500">{submitError}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-stroke bg-background px-3 py-1 text-xs text-primaryText hover:bg-stroke/40"
                    disabled={submitting}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending…' : 'Send to Admin'}
                  </button>
                </div>
              </form>
            )}

            {!canResubmit && (
              <p className="text-[11px] text-primaryText/60">
                This PO is currently in <span className="font-semibold">{po.status}</span>. No
                renegotiation actions are available from sales for this status.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const SalesMyPOsView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string; department?: string };
  };

  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      setError('Logged-in user not found. Please log in again.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getSalesPOs({ salesRepId: authUser.id });

        if (!cancelled) setData(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load your POs';

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
        Please log in to view your POs.
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
          <h2 className="text-sm font-semibold text-primaryText">My POs</h2>
          <span className="text-xs text-primaryText/70">{data.length} total</span>
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            You haven&apos;t created any POs yet.
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
        <SalesMyPODetailModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          onUpdated={(updated) => {
            setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          }}
        />
      )}
    </>
  );
};

export default SalesMyPOsView;
