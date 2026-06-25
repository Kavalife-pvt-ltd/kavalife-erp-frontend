import React, { useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight } from 'lucide-react';

import DocumentList from '@/components/documents/DocumentList';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SalesStatusBadge } from '@/components/sales/SalesDesign';
import type { SalesInquiryGroup, SalesPO } from '@/types/sales';
import {
  formatGroupDateTime,
  formatMoney,
  formatQueue,
  formatRequestType,
  getExpectedDeliverySummary,
  getGroupProgressSummary,
  getGroupTitle,
  getQuantityLabel,
} from '@/utils/salesInquiryGroups';
import { prettyStatus } from '@/utils/salesStatus';

type Mode = 'admin' | 'sales';

type ItemActionPayload =
  | { toStatus: 'routed_to_purchase' | 'routed_to_production'; newComments?: string }
  | { toStatus: 'admin_rejected'; rejectionReason: string }
  | { toStatus: 'purchase_approved' | 'final_admin_approved'; newComments?: string };

type Props = {
  inquiry: SalesInquiryGroup;
  mode: Mode;
  onClose: () => void;
  onItemAction?: (item: SalesPO, payload: ItemActionPayload) => Promise<void>;
};

type DetailItemProps = {
  label: string;
  value?: React.ReactNode;
};

const EMPTY_VALUE = '—';

const isEmptyValue = (value: React.ReactNode) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
    <div className="mt-1 text-sm text-foreground">{isEmptyValue(value) ? EMPTY_VALUE : value}</div>
  </div>
);

const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-3 rounded-md border bg-background p-4">
    <h3 className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
      {title}
    </h3>
    {children}
  </section>
);

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as
      | { error?: string; message?: string; details?: string }
      | undefined;
    return d?.details ?? d?.error ?? d?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
};

const getSalesRepDisplay = (inquiry: SalesInquiryGroup) => {
  if (inquiry.salesRepId === null || inquiry.salesRepId === undefined) return null;
  return `Sales Rep ID: ${inquiry.salesRepId}`;
};

const AdminItemActions: React.FC<{
  item: SalesPO;
  onItemAction: (item: SalesPO, payload: ItemActionPayload) => Promise<void>;
}> = ({ item, onItemAction }) => {
  const [note, setNote] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (action: string) => {
    try {
      setSubmittingAction(action);
      setError(null);

      if (action === 'return') {
        const reason = returnReason.trim();
        if (!reason) {
          setError('Please add a return reason.');
          return;
        }
        await onItemAction(item, { toStatus: 'admin_rejected', rejectionReason: reason });
        setReturnReason('');
        setNote('');
        return;
      }

      if (action === 'route_purchase') {
        await onItemAction(item, {
          toStatus: 'routed_to_purchase',
          newComments: note.trim() || undefined,
        });
        setNote('');
        return;
      }

      if (action === 'route_production') {
        await onItemAction(item, {
          toStatus: 'routed_to_production',
          newComments: note.trim() || undefined,
        });
        setNote('');
        return;
      }

      if (action === 'approve_price') {
        await onItemAction(item, {
          toStatus: 'purchase_approved',
          newComments: note.trim() || undefined,
        });
        setNote('');
        return;
      }

      if (action === 'final_approve') {
        await onItemAction(item, {
          toStatus: 'final_admin_approved',
          newComments: note.trim() || undefined,
        });
        setNote('');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update item'));
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="space-y-3 rounded-md border bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Admin Actions
      </p>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Optional admin notes"
      />

      {item.status === 'quote_requested' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => void submit('route_purchase')}
            disabled={submittingAction !== null}
          >
            {submittingAction === 'route_purchase' ? 'Routing...' : 'Route to Purchase'}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void submit('route_production')}
            disabled={submittingAction !== null}
          >
            {submittingAction === 'route_production' ? 'Routing...' : 'Route to Production'}
          </Button>
        </div>
      ) : null}

      {item.status === 'purchase_priced' ? (
        <Button
          type="button"
          size="sm"
          onClick={() => void submit('approve_price')}
          disabled={submittingAction !== null}
        >
          {submittingAction === 'approve_price' ? 'Approving...' : 'Approve Price'}
        </Button>
      ) : null}

      {['purchase_completed', 'production_completed'].includes(item.status) ? (
        <Button
          type="button"
          size="sm"
          onClick={() => void submit('final_approve')}
          disabled={submittingAction !== null}
        >
          {submittingAction === 'final_approve' ? 'Approving...' : 'Final Approve'}
        </Button>
      ) : null}

      <div className="space-y-2">
        <Textarea
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          rows={2}
          placeholder="Return reason"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void submit('return')}
          disabled={submittingAction !== null}
        >
          {submittingAction === 'return' ? 'Returning...' : 'Return to Sales'}
        </Button>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
};

const SalesInquiryGroupModal: React.FC<Props> = ({ inquiry, mode, onClose, onItemAction }) => {
  const [expandedItemId, setExpandedItemId] = useState<number | null>(inquiry.items[0]?.id ?? null);

  const salesRepDisplay = getSalesRepDisplay(inquiry);
  const canAct = mode === 'admin' && Boolean(onItemAction);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-5xl">
        <DialogHeader>
          <div className="pr-6">
            <DialogTitle>{getGroupTitle(inquiry)}</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {getGroupProgressSummary(inquiry.items)}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          <ModalSection title="Header">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Inquiry Number" value={inquiry.inquiryNumber ?? `#${inquiry.id}`} />
              <DetailItem label="Group Summary" value={getGroupProgressSummary(inquiry.items)} />
              <DetailItem label="Created Date" value={formatGroupDateTime(inquiry.requestDate)} />
              <DetailItem
                label="Expected Delivery"
                value={getExpectedDeliverySummary(inquiry.items)}
              />
              {mode === 'admin' && salesRepDisplay ? (
                <DetailItem label="Sales Rep / Created By" value={salesRepDisplay} />
              ) : null}
            </div>
          </ModalSection>

          <ModalSection title="Customer Information">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailItem label="Company Name" value={inquiry.companyName} />
              <DetailItem
                label="Company Address"
                value={<p className="whitespace-pre-line">{inquiry.companyAddress}</p>}
              />
              <DetailItem label="Contact Name" value={inquiry.companyContactName} />
              <DetailItem label="Contact Number" value={inquiry.companyContactNumber} />
              <DetailItem label="Contact Email" value={inquiry.companyContactEmail} />
            </div>
          </ModalSection>

          {inquiry.comments ? (
            <ModalSection title="Customer Notes">
              <p className="whitespace-pre-line text-sm text-foreground">{inquiry.comments}</p>
            </ModalSection>
          ) : null}

          <ModalSection title="Documents">
            <DocumentList module="sales_inquiry_group" entityId={inquiry.id} />
          </ModalSection>

          <ModalSection title="Ingredients / Items">
            <div className="space-y-3">
              {inquiry.items.map((item) => {
                const expanded = expandedItemId === item.id;
                const productName = item.productName?.trim() || EMPTY_VALUE;
                const quantityLabel = getQuantityLabel(item);

                return (
                  <div key={item.id} className="rounded-md border bg-card">
                    <button
                      type="button"
                      onClick={() => setExpandedItemId(expanded ? null : item.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      {expanded ? (
                        <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {productName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {quantityLabel || EMPTY_VALUE} • {formatRequestType(item.requestType)}
                        </p>
                      </div>
                      <SalesStatusBadge status={item.status} />
                    </button>

                    {expanded ? (
                      <div className="space-y-4 border-t px-4 py-4">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          <DetailItem label="Product Name" value={productName} />
                          <DetailItem label="Quantity" value={item.quantity} />
                          <DetailItem label="Unit" value={item.quantityUnit} />
                          <DetailItem label="Request Type" value={formatRequestType(item.requestType)} />
                          <DetailItem label="Purity" value={item.purity} />
                          <DetailItem label="Grade" value={item.grade} />
                          <DetailItem label="Asking Price" value={formatMoney(item.askingPrice)} />
                          <DetailItem label="Purchase Price" value={formatMoney(item.purchasePrice)} />
                          <DetailItem label="PO Number" value={item.poNumber} />
                          <DetailItem label="Current Status" value={prettyStatus(item.status)} />
                          <DetailItem label="Send To" value={formatQueue(item.sendTo)} />
                        </div>

                        {item.comments ? (
                          <DetailItem
                            label="Item Comments"
                            value={<p className="whitespace-pre-line">{item.comments}</p>}
                          />
                        ) : null}

                        {item.rejectionReason ? (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-normal text-destructive">
                              Rejection Reason
                            </p>
                            <p className="mt-1 whitespace-pre-line text-sm text-destructive">
                              {item.rejectionReason}
                            </p>
                          </div>
                        ) : null}

                        {canAct && item.sendTo === 'admin' && onItemAction ? (
                          <AdminItemActions item={item} onItemAction={onItemAction} />
                        ) : mode === 'admin' ? (
                          <p className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
                            This item is currently with {formatQueue(item.sendTo)} and is read-only
                            here.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </ModalSection>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesInquiryGroupModal;
