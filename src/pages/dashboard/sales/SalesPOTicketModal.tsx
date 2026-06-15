import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import DocumentList from '@/components/documents/DocumentList';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader } from '@/components/ui/Loader';
import { Textarea } from '@/components/ui/textarea';
import { SalesStatusBadge } from '@/components/sales/SalesDesign';
import type { SalesPO, SalesPOStatusLog } from '@/types/sales';
import { getSalesPOStatusLog } from '@/api/sales';
import { prettyStatus, prettyTransition } from '@/utils/salesStatus';

type TimelineEntry = {
  id: number;
  label: string;
  at: string;
  note?: string | null;
};

export type SalesPOTicketActionConfig = {
  title: string;
  primaryLabel: string;
  submittingLabel?: string;

  // optional note box
  noteLabel?: string;
  notePlaceholder?: string;

  // render extra fields like pricing, delivery code, etc.
  renderExtraFields?: (args: {
    setField: (key: string, value: unknown) => void;
    fields: Record<string, unknown>;
  }) => React.ReactNode;

  // called on submit; return updated PO (or just void and parent refetches)
  onSubmit: (args: { note?: string; fields: Record<string, unknown> }) => Promise<void>;
};

type Props = {
  po: SalesPO;
  onClose: () => void;

  // masking support
  maskCompany?: boolean;

  // optional action section
  action?: SalesPOTicketActionConfig;
};

const getPrimaryNumberLabel = (po: SalesPO) => {
  if (po.poNumber) return `PO #${po.poNumber}`;
  if (po.inquiryNumber) return `Inquiry #${po.inquiryNumber}`;
  return `#${po.id}`;
};

const SalesPOTicketModal: React.FC<Props> = ({ po, onClose, maskCompany = false, action }) => {
  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (key: string, value: unknown) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadingLogs(true);
        setLogError(null);
        const data = await getSalesPOStatusLog(po.id);
        if (!cancelled) setLogs(data);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load status history';
        if (axios.isAxiosError(err)) {
          const d = err.response?.data as
            | { error?: string; message?: string; details?: string }
            | undefined;
          message = d?.details ?? d?.error ?? d?.message ?? err.message ?? message;
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

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleString() : '—';
  const expectedDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '—';
  const primaryNumberLabel = getPrimaryNumberLabel(po);

  const timeline: TimelineEntry[] = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        label: prettyTransition(log.fromStatus, log.toStatus),
        at: new Date(log.changedAt).toLocaleString(),
        note: log.note ?? undefined,
      })),
    [logs]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await action.onSubmit({ note: note || undefined, fields });
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to update ticket';
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.details ?? d?.error ?? d?.message ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <div>
            <div className="mb-2 flex items-start justify-between gap-3">
              <DialogTitle>Ticket Details - {primaryNumberLabel}</DialogTitle>
              <SalesStatusBadge status={po.status} />
            </div>
            <DialogDescription>
              {maskCompany ? 'Customer hidden' : po.companyName} • {po.quantity}{' '}
              {po.quantityUnit ?? ''} {po.purity ? `• ${po.purity}` : ''}
              {po.poNumber && po.inquiryNumber ? ` • Inquiry #${po.inquiryNumber}` : ''}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto py-4">
          <div className="grid gap-4 md:grid-cols-2">
          {/* left details */}
          <section className="space-y-3 text-sm text-foreground">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Company
              </p>
              {maskCompany ? (
                <p className="text-muted-foreground">Customer details hidden for this view</p>
              ) : (
                <>
                  <p className="font-medium">{po.companyName}</p>
                  <p className="whitespace-pre-line text-muted-foreground">{po.companyAddress}</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Created</p>
                <p>{createdDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  Expected Delivery
                </p>
                <p>{expectedDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Status</p>
                <p>{prettyStatus(po.status)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Send To</p>
                <p>{po.sendTo ?? '—'}</p>
              </div>
            </div>

            {po.askingPrice !== undefined && po.askingPrice !== null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  Asking Price
                </p>
                <p>₹{Number(po.askingPrice).toLocaleString('en-IN')}</p>
              </div>
            )}

            {po.purchasePrice !== undefined && po.purchasePrice !== null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  Purchase Price
                </p>
                <p>₹{Number(po.purchasePrice).toLocaleString('en-IN')}</p>
              </div>
            )}

            {po.comments && (
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Comments</p>
                <p className="whitespace-pre-line text-foreground">{po.comments}</p>
              </div>
            )}

            {po.rejectionReason && (
              <div>
                <p className="text-xs uppercase tracking-normal text-destructive">Rejection</p>
                <p className="whitespace-pre-line text-destructive">{po.rejectionReason}</p>
              </div>
            )}
          </section>

          {/* right history */}
          <section className="text-sm text-foreground">
            <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Status History
            </p>

            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader />
                </div>
              ) : logError ? (
                <p className="text-xs text-destructive">{logError}</p>
              ) : timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground">No status changes logged yet.</p>
              ) : (
                <>
                  <div className="rounded-md bg-card p-2">
                    <div className="text-xs font-semibold">Created</div>
                    <div className="text-xs text-muted-foreground">{createdDate}</div>
                  </div>

                  {timeline.map((item) => (
                    <div key={item.id} className="rounded-md bg-card p-2">
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{item.at}</span>
                      </div>
                      {item.note ? (
                        <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>

        <div className="mt-4">
          <DocumentList module="sales_po" entityId={po.id} />
        </div>

        {/* action section */}
        {action ? (
          <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
            <div className="mb-2 text-sm font-semibold text-foreground">{action.title}</div>

            <div className="space-y-2">
              {action.renderExtraFields?.({ setField, fields })}

              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  {action.noteLabel ?? 'Notes'}
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder={action.notePlaceholder ?? 'Optional note…'}
                />
              </div>

              {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}

              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" onClick={onClose} variant="outline" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (action.submittingLabel ?? 'Submitting…') : action.primaryLabel}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <DialogFooter>
            <Button type="button" onClick={onClose} variant="outline">
              Close
            </Button>
          </DialogFooter>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesPOTicketModal;
