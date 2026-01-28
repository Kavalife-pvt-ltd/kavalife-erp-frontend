// src/pages/dashboard/sales/SalesMyInquiriesView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import { listSalesPO, getSalesPOStatusLog } from '@/api/sales';
import type { SalesPO, SalesPOStatusLog } from '@/types/sales';

type TimelineEntry = {
  id: number;
  label: string;
  at: string;
  note?: string | null;
};

type DetailsModalProps = {
  po: SalesPO;
  onClose: () => void;
};

const DetailsModal: React.FC<DetailsModalProps> = ({ po, onClose }) => {
  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadingLogs(true);
        setError(null);
        const data = await getSalesPOStatusLog(po.id);
        if (!cancelled) setLogs(Array.isArray(data) ? data : []);
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
        setError(message);
      } finally {
        if (!cancelled) setLoadingLogs(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [po.id]);

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleString() : '';
  const expectedDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '';

  const finalPrice = po.askingPrice ?? null;

  const timeline: TimelineEntry[] = useMemo(() => {
    if (!Array.isArray(logs)) return [];

    return logs.map((log) => ({
      id: log.id,
      label: `${log.fromStatus ? `${log.fromStatus} → ` : ''}${log.toStatus}`,
      at: new Date(log.changedAt).toLocaleString(),
      note: log.note ?? undefined,
    }));
  }, [logs]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">
              Inquiry Details – {po.poNumber ?? 'No PO number yet'}
            </h2>
            <p className="text-xs text-primaryText/70">
              {po.companyName} • {po.quantity} {po.quantityUnit ?? ''}{' '}
              {po.purity ? `• ${po.purity}` : ''}
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

        <section className="grid gap-3 text-xs text-primaryText md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
              Company
            </p>
            <p className="font-medium text-primaryText">{po.companyName}</p>
            <p className="whitespace-pre-line text-primaryText/70">{po.companyAddress}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
              Request Info
            </p>
            <p>
              Type:{' '}
              <span className="font-medium">
                {po.requestType === 'sample' ? 'Sample' : 'Purchase'}
              </span>
            </p>
            <p>
              Quantity:{' '}
              <span className="font-medium">
                {po.quantity} {po.quantityUnit ?? ''}
              </span>
            </p>
            {po.grade && (
              <p>
                Grade: <span className="font-medium">{po.grade}</span>
              </p>
            )}
            {po.purity && (
              <p>
                Purity: <span className="font-medium">{po.purity}</span>
              </p>
            )}
            {expectedDate && (
              <p>
                Expected Delivery: <span className="font-medium">{expectedDate}</span>
              </p>
            )}
            {finalPrice !== null && (
              <p>
                Price:{' '}
                <span className="font-medium">
                  ₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </p>
            )}
          </div>

          {po.comments && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                Comments
              </p>
              <p className="whitespace-pre-line text-primaryText/80">{po.comments}</p>
            </div>
          )}
        </section>

        <section className="mt-4 border-t border-stroke pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primaryText/60">
            Status History
          </h3>

          {loadingLogs ? (
            <div className="flex items-center gap-2 text-xs text-primaryText/70">
              <Loader /> <span>Loading history…</span>
            </div>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : timeline.length === 0 ? (
            <p className="text-xs text-primaryText/60">No status changes logged yet.</p>
          ) : (
            <ol className="space-y-1 text-xs text-primaryText/80">
              <li className="flex justify-between gap-2 rounded-lg bg-background px-2 py-1">
                <span>Created ({po.status})</span>
                <span className="text-[11px] text-primaryText/60">{createdDate || '—'}</span>
              </li>
              {timeline.map((item) => (
                <li key={item.id} className="rounded-lg bg-background px-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.label}</span>
                    <span className="text-[11px] text-primaryText/60">{item.at}</span>
                  </div>
                  {item.note && (
                    <p className="mt-0.5 whitespace-pre-line text-[11px] text-primaryText/70">
                      {item.note}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

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

type FilterId = 'all' | 'active' | 'rejected' | 'done';

const SalesMyInquiriesView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string };
  };

  const [items, setItems] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);
  const [filter, setFilter] = useState<FilterId>('all');

  const userId = authUser?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No logged-in user found. Please log in again.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ My Inquiries = everything created by me (regardless of send_to)
        const data = await listSalesPO({ salesRepId: userId });

        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load inquiries';
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
  }, [userId]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;

    if (filter === 'rejected') {
      return items.filter(
        (po) => po.status === 'admin_rejected' || po.status === 'client_rejected'
      );
    }

    if (filter === 'done') {
      return items.filter((po) => po.status === 'final_admin_approved' || po.status === 'closed');
    }

    // active = everything else (still moving through the pipeline)
    return items.filter(
      (po) =>
        !['final_admin_approved', 'closed', 'admin_rejected', 'client_rejected'].includes(
          po.status as string
        )
    );
  }, [items, filter]);

  if (!authUser) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        Please log in to view your inquiries.
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">My Inquiries</h2>
            <p className="text-xs text-primaryText/70">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'done', label: 'Done' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={[
                  'rounded-full border px-3 py-1 text-xs',
                  filter === t.id
                    ? 'border-accent bg-accent text-background'
                    : 'border-stroke bg-background text-primaryText hover:bg-stroke/40',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            Nothing here yet. Create an inquiry and it’ll show up immediately (even while it’s with
            admin/purchase/production).
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((po) => (
              <button
                key={po.id}
                type="button"
                onClick={() => setSelectedPO(po)}
                className="text-left"
              >
                <SalesPOCard po={po} />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPO && <DetailsModal po={selectedPO} onClose={() => setSelectedPO(null)} />}
    </>
  );
};

export default SalesMyInquiriesView;
