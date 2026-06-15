// src/pages/dashboard/sales/SalesAllPOsView.tsx
import React, { useEffect, useState } from 'react';
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
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
  SalesStatusBadge,
} from '@/components/sales/SalesDesign';
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div>
              <DialogTitle>
                {getPrimaryNumberLabel(po)} - {po.requestType === 'sample' ? 'Sample' : 'Purchase'}
              </DialogTitle>
              <DialogDescription>
                {po.companyName} • {po.quantity} {po.quantityUnit ?? ''}
              </DialogDescription>
            </div>
            <SalesStatusBadge status={po.status} />
          </div>
          {po.poNumber && po.inquiryNumber ? (
            <p className="text-xs text-muted-foreground">Inquiry #{po.inquiryNumber}</p>
          ) : null}
        </DialogHeader>

        <div className="grid flex-1 gap-4 overflow-y-auto py-4 md:grid-cols-2">
          {/* LEFT: Core PO details */}
          <section className="space-y-2 text-sm text-foreground">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Company
              </p>
              <p className="font-medium">{po.companyName}</p>
              <p className="whitespace-pre-line text-muted-foreground">{po.companyAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">Quantity</p>
                <p>
                  {po.quantity} {po.quantityUnit ?? ''}
                </p>
              </div>
              {po.askingPrice !== undefined && po.askingPrice !== null && (
                <div>
                  <p className="text-xs uppercase tracking-normal text-muted-foreground">
                    Asking Price
                  </p>
                  <p>{po.askingPrice}</p>
                </div>
              )}
              {po.purchasePrice !== undefined && po.purchasePrice !== null && (
                <div>
                  <p className="text-xs uppercase tracking-normal text-muted-foreground">
                    Purchase Price
                  </p>
                  <p>{po.purchasePrice}</p>
                </div>
              )}
              {po.purity && (
                <div>
                  <p className="text-xs uppercase tracking-normal text-muted-foreground">Purity</p>
                  <p>{po.purity}</p>
                </div>
              )}
              {po.grade && (
                <div>
                  <p className="text-xs uppercase tracking-normal text-muted-foreground">Grade</p>
                  <p>{po.grade}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Created On
                </p>
                <p>{createdDate || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Expected Delivery
                </p>
                <p>{expectedDate || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">Status</p>
                <p>{prettyStatus(po.status)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Current Queue
                </p>
                <p>{po.sendTo ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Fulfillment Type
                </p>
                <p>{po.fulfillmentType ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Delivery Code
                </p>
                <p>{po.deliveryCode ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Approved By (ID)
                </p>
                <p>{po.approvedById ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{approvedAt || ''}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Packed By (ID)
                </p>
                <p>{po.packedById ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{packedAt || ''}</p>
              </div>
            </div>

            {po.rejectionReason && (
              <div>
                <p className="text-xs uppercase tracking-normal text-destructive">
                  Rejection Reason
                </p>
                <p className="whitespace-pre-line text-destructive">{po.rejectionReason}</p>
              </div>
            )}

            {po.comments && (
              <div>
                <p className="text-xs uppercase tracking-normal text-muted-foreground">
                  Sales Comments
                </p>
                <p className="whitespace-pre-line text-foreground">{po.comments}</p>
              </div>
            )}
          </section>

          {/* RIGHT: Status history */}
          <section className="flex flex-col gap-3 text-sm text-foreground">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Status History
              </p>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader />
                  </div>
                ) : logError ? (
                  <p className="text-xs text-destructive">{logError}</p>
                ) : logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No status changes recorded yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="rounded-md bg-card p-1.5">
                      <div className="text-xs font-semibold">
                        {prettyTransition(log.fromStatus, log.toStatus)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.changedAt).toLocaleString()}
                        </span>
                        {log.note && (
                          <span className="ml-2 line-clamp-1 text-xs text-muted-foreground">
                            {log.note}
                          </span>
                        )}
                      </div>
                      {log.changedBy && (
                        <div className="text-xs text-muted-foreground">
                          Changed by user ID: {log.changedBy}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              This is a read-only view. Approvals, routing, and completion actions happen from their
              respective queues (Admin Review / Purchase / Production).
            </p>
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
    return <SalesMessageCard>Please log in to view POs.</SalesMessageCard>;
  }

  if (role !== 'admin') {
    return (
      <SalesMessageCard>
        You do not have permission to access All POs. This view is only available to admins.
      </SalesMessageCard>
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
    return <SalesMessageCard>{error}</SalesMessageCard>;
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <SalesPageHeader
          title="All Inquiries"
          description="Read-only admin view of every sales inquiry and purchase order."
          meta={<span className="text-sm text-muted-foreground">{data.length} total</span>}
        />

        <SalesSectionHeader title="All records" count={data.length} />

        {data.length === 0 ? (
          <SalesEmptyState description="No POs found." />
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
