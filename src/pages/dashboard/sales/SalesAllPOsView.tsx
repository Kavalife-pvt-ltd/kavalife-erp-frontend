// src/pages/dashboard/sales/SalesAllPOsView.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import type { SalesPO, SalesPOStatusLog } from '@/types/sales';
import { listSalesPO, getSalesPOStatusLog } from '@/api/sales';
import { prettyStatus, prettyTransition } from '@/utils/salesStatus';

type DetailModalProps = {
  po: SalesPO;
  onClose: () => void;
};

const getPrimaryNumberLabel = (po: SalesPO) => {
  if (po.poNumber) return `PO #${po.poNumber}`;
  if (po.inquiryNumber) return `Inquiry #${po.inquiryNumber}`;
  return `#${po.id}`;
};

const SalesAllPODetailModal: React.FC<DetailModalProps> = ({ po, onClose }) => {
  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';
  const expectedDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '';
  const approvedAt = po.approvedAt ? new Date(po.approvedAt).toLocaleString() : '';
  const packedAt = po.packedAt ? new Date(po.packedAt).toLocaleString() : '';

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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
        {/* Header */}
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">
              {getPrimaryNumberLabel(po)} – {po.requestType === 'sample' ? 'Sample' : 'Purchase'}
            </h2>
            {po.poNumber && po.inquiryNumber ? (
              <p className="text-xs text-primaryText/70">Inquiry #{po.inquiryNumber}</p>
            ) : null}
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

        <div className="grid gap-4 md:grid-cols-2">
          {/* LEFT: Core PO details */}
          <section className="space-y-2 text-xs text-primaryText">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                Company
              </p>
              <p className="font-medium">{po.companyName}</p>
              <p className="whitespace-pre-line text-primaryText/70">{po.companyAddress}</p>
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
              {po.purchasePrice !== undefined && po.purchasePrice !== null && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                    Purchase Price
                  </p>
                  <p>{po.purchasePrice}</p>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Status</p>
                <p>{prettyStatus(po.status)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Current Queue
                </p>
                <p>{po.sendTo ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Fulfillment Type
                </p>
                <p>{po.fulfillmentType ?? '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Delivery Code
                </p>
                <p>{po.deliveryCode ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Approved By (ID)
                </p>
                <p>{po.approvedById ?? '—'}</p>
                <p className="text-[11px] text-primaryText/60">{approvedAt || ''}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Packed By (ID)
                </p>
                <p>{po.packedById ?? '—'}</p>
                <p className="text-[11px] text-primaryText/60">{packedAt || ''}</p>
              </div>
            </div>

            {po.rejectionReason && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-red-500">Rejection Reason</p>
                <p className="whitespace-pre-line text-red-500/90">{po.rejectionReason}</p>
              </div>
            )}

            {po.comments && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Sales Comments
                </p>
                <p className="whitespace-pre-line text-primaryText/80">{po.comments}</p>
              </div>
            )}
          </section>

          {/* RIGHT: Status history */}
          <section className="flex flex-col gap-3 text-xs text-primaryText">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
                Status History
              </p>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-stroke bg-background p-2">
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
                    <div key={log.id} className="rounded-md bg-foreground/40 p-1.5">
                      <div className="text-[11px] font-semibold">
                        {prettyTransition(log.fromStatus, log.toStatus)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-primaryText/60">
                          {new Date(log.changedAt).toLocaleString()}
                        </span>
                        {log.note && (
                          <span className="ml-2 line-clamp-1 text-[11px] text-primaryText/70">
                            {log.note}
                          </span>
                        )}
                      </div>
                      {log.changedBy && (
                        <div className="text-[11px] text-primaryText/60">
                          Changed by user ID: {log.changedBy}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-[11px] text-primaryText/60">
              This is a read-only view. Approvals, routing, and completion actions happen from their
              respective queues (Admin Review / Purchase / Production).
            </p>
          </section>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stroke bg-background px-3 py-1 text-xs text-primaryText hover:bg-stroke/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SalesAllPOsView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string; department?: string };
  };

  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  const role = authUser?.role ?? 'sales';

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      setError('Please log in to view POs.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await listSalesPO(); // no filters → all POs
        if (!cancelled) setData(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load all POs';

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
  }, [authUser]);

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
        You do not have permission to access All POs. This view is only available to admins.
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
          <h2 className="text-sm font-semibold text-primaryText">All POs</h2>
          <span className="text-xs text-primaryText/70">{data.length} total</span>
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            No POs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((po) => (
              <SalesPOCard key={po.id} po={po} onClick={() => setSelectedPO(po)} />
            ))}
          </div>
        )}
      </div>

      {selectedPO && <SalesAllPODetailModal po={selectedPO} onClose={() => setSelectedPO(null)} />}
    </>
  );
};

export default SalesAllPOsView;
