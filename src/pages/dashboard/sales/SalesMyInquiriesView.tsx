// src/pages/dashboard/sales/SalesMyInquiriesView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SalesEmptyState,
  SalesFilterButton,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
  SalesStatusBadge,
} from '@/components/sales/SalesDesign';
import { listSalesPO, getSalesPOStatusLog } from '@/api/sales';
import type { SalesPO, SalesPOStatusLog } from '@/types/sales';
import { prettyStatus, prettyTransition } from '@/utils/salesStatus';

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

const getPrimaryNumberLabel = (po: SalesPO) => {
  if (po.poNumber) return `PO #${po.poNumber}`;
  if (po.inquiryNumber) return `Inquiry #${po.inquiryNumber}`;
  return `#${po.id}`;
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
      label: prettyTransition(log.fromStatus, log.toStatus),
      at: new Date(log.changedAt).toLocaleString(),
      note: log.note ?? undefined,
    }));
  }, [logs]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div>
              <DialogTitle>Inquiry Details - {getPrimaryNumberLabel(po)}</DialogTitle>
              <DialogDescription>
                {po.companyName} • {po.quantity} {po.quantityUnit ?? ''}{' '}
                {po.purity ? `• ${po.purity}` : ''}
              </DialogDescription>
            </div>
            <SalesStatusBadge status={po.status} />
          </div>
          {po.poNumber && po.inquiryNumber ? (
            <p className="text-xs text-muted-foreground">Inquiry #{po.inquiryNumber}</p>
          ) : null}
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto py-4">
        <section className="grid gap-3 text-sm text-foreground md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Company
            </p>
            <p className="font-medium text-foreground">{po.companyName}</p>
            <p className="whitespace-pre-line text-muted-foreground">{po.companyAddress}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
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
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Comments
              </p>
              <p className="whitespace-pre-line text-foreground">{po.comments}</p>
            </div>
          )}
        </section>

        <section className="border-t pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Status History
          </h3>

          {loadingLogs ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader /> <span>Loading history…</span>
            </div>
          ) : error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : timeline.length === 0 ? (
            <p className="text-xs text-muted-foreground">No status changes logged yet.</p>
          ) : (
            <ol className="space-y-1 text-xs text-foreground">
              <li className="flex justify-between gap-2 rounded-lg bg-background px-2 py-1">
                <span>Created ({prettyStatus(po.status)})</span>
                <span className="text-xs text-muted-foreground">{createdDate || '—'}</span>
              </li>
              {timeline.map((item) => (
                <li key={item.id} className="rounded-lg bg-background px-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.at}</span>
                  </div>
                  {item.note && (
                    <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
                      {item.note}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      <SalesMessageCard>Please log in to view your inquiries.</SalesMessageCard>
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
      <SalesMessageCard>{error}</SalesMessageCard>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <SalesPageHeader
          title="My Inquiries"
          description="Track your sales inquiries as they move through admin, purchase, and production."
          meta={
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          }
          action={
            <div className="flex items-center gap-2">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'rejected', label: 'Returned' },
                { id: 'done', label: 'Done' },
              ] as const
            ).map((t) => (
              <SalesFilterButton key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
                {t.label}
              </SalesFilterButton>
            ))}
            </div>
          }
        />

        <SalesSectionHeader title="Inquiry list" count={filtered.length} />

        {filtered.length === 0 ? (
          <SalesEmptyState description="Nothing here yet. Create an inquiry and it will show up immediately, even while it is with admin, purchase, or production." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((po) => (
              <SalesPOCard key={po.id} po={po} onClick={() => setSelectedPO(po)} />
            ))}
          </div>
        )}
      </div>

      {selectedPO && <DetailsModal po={selectedPO} onClose={() => setSelectedPO(null)} />}
    </>
  );
};

export default SalesMyInquiriesView;
