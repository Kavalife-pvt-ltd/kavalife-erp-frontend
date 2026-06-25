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
  changedBy?: number | null;
};

export type SalesPOTicketViewerRole = 'admin' | 'sales' | 'purchase' | 'production';

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
  viewerRole?: SalesPOTicketViewerRole;

  // optional action section
  action?: SalesPOTicketActionConfig;
};

type DetailItemProps = {
  label: string;
  value?: React.ReactNode;
  className?: string;
};

const EMPTY_VALUE = '—';

const isEmptyValue = (value: React.ReactNode) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
    <div className="mt-1 text-sm text-foreground">{isEmptyValue(value) ? EMPTY_VALUE : value}</div>
  </div>
);

const TicketSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => (
  <section className={`space-y-3 rounded-md border bg-background p-4 ${className}`}>
    <h3 className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
      {title}
    </h3>
    {children}
  </section>
);

const getPrimaryNumberLabel = (po: SalesPO) => {
  if (po.poNumber) return `PO #${po.poNumber}`;
  if (po.inquiryNumber) return `Inquiry #${po.inquiryNumber}`;
  return `#${po.id}`;
};

const getViewerRole = (
  viewerRole: SalesPOTicketViewerRole | undefined,
  maskCompany: boolean
): SalesPOTicketViewerRole => {
  if (viewerRole) return viewerRole;
  return maskCompany ? 'purchase' : 'sales';
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : EMPTY_VALUE;

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : EMPTY_VALUE;

const formatMoney = (value?: number | null) =>
  value == null
    ? null
    : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatRequestType = (value: SalesPO['requestType']) =>
  value === 'sample' ? 'Sample' : 'Purchase';

const formatQueue = (value?: string | null) => {
  if (!value) return EMPTY_VALUE;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getSalesRepDisplay = (po: SalesPO) => {
  // TODO: Prefer a backend-provided display name when Sales PO responses join user records.
  if (po.salesRepId === null || po.salesRepId === undefined) return null;
  return `Sales Rep ID: ${po.salesRepId}`;
};

const SalesPOTicketModal: React.FC<Props> = ({
  po,
  onClose,
  maskCompany = false,
  viewerRole,
  action,
}) => {
  const role = getViewerRole(viewerRole, maskCompany);
  const isCustomerMasked = maskCompany || role === 'purchase' || role === 'production';
  const canSeeCustomer = !isCustomerMasked && (role === 'admin' || role === 'sales');
  const canSeeSalesRep = role === 'admin';
  const canSeeSendTo = role === 'admin';
  const canSeeRequestType = role !== 'production';
  const canSeeStatusHistory = role === 'admin' || role === 'sales';
  const canSeeAskingPrice = role !== 'production' && po.askingPrice != null;
  const canSeePurchasePrice =
    po.purchasePrice != null && (role === 'admin' || role === 'sales' || role === 'purchase');

  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(canSeeStatusHistory);
  const [logError, setLogError] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (key: string, value: unknown) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!canSeeStatusHistory) {
      setLogs([]);
      setLoadingLogs(false);
      setLogError(null);
      return;
    }

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
  }, [canSeeStatusHistory, po.id]);

  const createdDate = formatDateTime(po.requestDate);
  const expectedDate = formatDate(po.expectedDeliveryDate);
  const primaryNumberLabel = getPrimaryNumberLabel(po);
  const productName = po.productName?.trim() || EMPTY_VALUE;
  const quantityLabel = `${po.quantity} ${po.quantityUnit ?? ''}`.trim();
  const salesRepDisplay = getSalesRepDisplay(po);
  const askingPrice = formatMoney(po.askingPrice);
  const purchasePrice = formatMoney(po.purchasePrice);

  const timeline: TimelineEntry[] = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        label: prettyTransition(log.fromStatus, log.toStatus),
        at: new Date(log.changedAt).toLocaleString(),
        note: log.note ?? undefined,
        changedBy: log.changedBy ?? undefined,
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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <div>
            <div className="mb-2 flex items-start justify-between gap-3 pr-6">
              <DialogTitle>Ticket Details - {primaryNumberLabel}</DialogTitle>
              <SalesStatusBadge status={po.status} />
            </div>
            <DialogDescription>
              {productName} • {quantityLabel || EMPTY_VALUE}
              {po.purity ? ` • ${po.purity}` : ''}
              {canSeeCustomer ? ` • ${po.companyName}` : ''}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          <TicketSection title="Header Summary">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Inquiry Number" value={po.inquiryNumber ?? `#${po.id}`} />
              {(role === 'admin' || role === 'sales') && po.poNumber ? (
                <DetailItem label="PO Number" value={po.poNumber} />
              ) : null}
              <DetailItem label="Current Status" value={prettyStatus(po.status)} />
              {canSeeSendTo ? <DetailItem label="Send To" value={formatQueue(po.sendTo)} /> : null}
              <DetailItem label="Created Date" value={createdDate} />
              <DetailItem label="Expected Delivery Date" value={expectedDate} />
              {canSeeSalesRep && salesRepDisplay ? (
                <DetailItem label="Created By / Sales Rep" value={salesRepDisplay} />
              ) : null}
            </div>
          </TicketSection>

          {canSeeCustomer ? (
            <TicketSection title="Customer / Company Context">
              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem label="Company Name" value={po.companyName} />
                <DetailItem
                  label="Company Address"
                  value={<p className="whitespace-pre-line">{po.companyAddress}</p>}
                />
                <DetailItem label="Contact Name" value={po.companyContactName} />
                <DetailItem label="Contact Number" value={po.companyContactNumber} />
                <DetailItem label="Contact Email" value={po.companyContactEmail} />
              </div>
            </TicketSection>
          ) : null}

          <TicketSection title="Ingredient / Requirement Details">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Ingredient / Product Name" value={productName} />
              <DetailItem label="Quantity" value={quantityLabel} />
              {canSeeRequestType ? (
                <DetailItem label="Request Type" value={formatRequestType(po.requestType)} />
              ) : null}
              <DetailItem label="Purity" value={po.purity} />
              <DetailItem label="Grade" value={po.grade} />
              {canSeeAskingPrice && askingPrice ? (
                <DetailItem label="Asking Price" value={askingPrice} />
              ) : null}
              {canSeePurchasePrice && purchasePrice ? (
                <DetailItem label="Purchase Price" value={purchasePrice} />
              ) : null}
            </div>

            <DetailItem
              label="Customer Comments / Requirements"
              value={<p className="whitespace-pre-line">{po.comments || EMPTY_VALUE}</p>}
            />

            {po.rejectionReason ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-destructive">
                  Rejection Reason
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-destructive">
                  {po.rejectionReason}
                </p>
              </div>
            ) : null}
          </TicketSection>

          <TicketSection title="Documents">
            <DocumentList module="sales_po" entityId={po.id} />
          </TicketSection>

          {canSeeStatusHistory ? (
            <TicketSection title="Status History">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader />
                </div>
              ) : logError ? (
                <p className="text-xs text-destructive">{logError}</p>
              ) : (
                <ol className="max-h-72 space-y-2 overflow-y-auto text-sm">
                  <li className="rounded-md bg-card p-2">
                    <div className="text-xs font-semibold">Created</div>
                    <div className="text-xs text-muted-foreground">{createdDate}</div>
                  </li>

                  {timeline.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No status changes logged yet.</li>
                  ) : (
                    timeline.map((item) => (
                      <li key={item.id} className="rounded-md bg-card p-2">
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{item.at}</span>
                        </div>
                        {role === 'admin' && item.changedBy ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Changed by user ID: {item.changedBy}
                          </p>
                        ) : null}
                        {item.note ? (
                          <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
                            {item.note}
                          </p>
                        ) : null}
                      </li>
                    ))
                  )}
                </ol>
              )}
            </TicketSection>
          ) : null}

          {action ? (
            <TicketSection title="Action Section">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-sm font-semibold text-foreground">{action.title}</div>

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

                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={onClose} variant="outline" disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (action.submittingLabel ?? 'Submitting…') : action.primaryLabel}
                  </Button>
                </div>
              </form>
            </TicketSection>
          ) : null}
        </div>

        {!action ? (
          <DialogFooter>
            <Button type="button" onClick={onClose} variant="outline">
              Close
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SalesPOTicketModal;
