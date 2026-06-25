import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  SalesEmptyState,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
} from '@/components/sales/SalesDesign';
import type { SalesPO, SalesPOStatus } from '@/types/sales';
import { listSalesPO, updateSalesPOStatus } from '@/api/sales';
import SalesPOTicketModal, { type SalesPOTicketActionConfig } from './SalesPOTicketModal';
import { prettyStatus } from '@/utils/salesStatus';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as
      | { error?: string; message?: string; details?: string }
      | undefined;
    return d?.error ?? d?.message ?? d?.details ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
};

const requireText = (value: unknown, message: string) => {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(message);
  return text;
};

const sectionTitle = (status: SalesPOStatus) => {
  switch (status) {
    case 'quote_requested':
      return 'New Inquiries';
    case 'purchase_priced':
      return 'Purchase Price Approval';
    case 'purchase_completed':
    case 'production_completed':
      return 'Final Approval';
    default:
      return prettyStatus(status);
  }
};

type AdminSection = {
  title: string;
  statuses: SalesPOStatus[];
};

const ADMIN_SECTIONS: AdminSection[] = [
  { title: 'New Inquiries', statuses: ['quote_requested'] },
  { title: 'Purchase Price Approval', statuses: ['purchase_priced'] },
  { title: 'Final Approval', statuses: ['purchase_completed', 'production_completed'] },
];

const SalesAdminReviewView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  const role = (authUser?.role as string | undefined) ?? 'sales';

  const refresh = async () => {
    try {
      setError(null);
      const res = await listSalesPO({ sendTo: 'admin' });
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to refresh admin queue'));
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
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load admin queue'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const grouped = useMemo(
    () =>
      ADMIN_SECTIONS.map((section) => ({
        ...section,
        items: data.filter((po) => section.statuses.includes(po.status)),
      })),
    [data]
  );

  const actionFor = (po: SalesPO): SalesPOTicketActionConfig => {
    const returnToSales = async (reason: unknown) => {
      const rejectionReason = requireText(reason, 'Please add a return reason.');
      const updated = await updateSalesPOStatus(po.id, {
        toStatus: 'admin_rejected',
        rejectionReason,
      });
      setData((prev) => prev.filter((item) => item.id !== updated.id));
      toast.success('Returned to Sales');
    };

    if (po.status === 'quote_requested') {
      return {
        title: 'Admin Review',
        primaryLabel: 'Submit Decision',
        submittingLabel: 'Submitting...',
        noteLabel: 'Admin Notes',
        notePlaceholder: 'Optional notes for the next team...',
        renderExtraFields: ({ setField, fields }) => (
          <div className="space-y-3 rounded-lg border bg-background p-3 text-sm text-foreground">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Decision
              </p>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="adminDecision"
                  checked={(fields.decision ?? 'route_purchase') === 'route_purchase'}
                  onChange={() => setField('decision', 'route_purchase')}
                />
                <span>Route to Purchase</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="adminDecision"
                  checked={fields.decision === 'route_production'}
                  onChange={() => setField('decision', 'route_production')}
                />
                <span>Route to Production</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="adminDecision"
                  checked={fields.decision === 'return_sales'}
                  onChange={() => setField('decision', 'return_sales')}
                />
                <span>Return to Sales</span>
              </label>
            </div>
            {fields.decision === 'return_sales' && (
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-normal text-destructive">
                  Return Reason
                </label>
                <Textarea
                  rows={3}
                  onChange={(e) => setField('rejectionReason', e.target.value)}
                  placeholder="Required when returning to Sales"
                />
              </div>
            )}
          </div>
        ),
        onSubmit: async ({ note, fields }) => {
          const decision = String(fields.decision ?? 'route_purchase');
          if (decision === 'return_sales') {
            await returnToSales(fields.rejectionReason);
            return;
          }

          const updated = await updateSalesPOStatus(po.id, {
            toStatus:
              decision === 'route_production' ? 'routed_to_production' : 'routed_to_purchase',
            newComments: note,
          });
          setData((prev) => prev.filter((item) => item.id !== updated.id));
          toast.success(
            decision === 'route_production' ? 'Routed to Production' : 'Routed to Purchase'
          );
        },
      };
    }

    if (po.status === 'purchase_priced') {
      return {
        title: 'Purchase Price Approval',
        primaryLabel: 'Submit Decision',
        submittingLabel: 'Submitting...',
        noteLabel: 'Admin Notes',
        notePlaceholder: 'Optional notes for purchase or sales...',
        renderExtraFields: ({ setField, fields }) => (
          <div className="space-y-3 rounded-lg border bg-background p-3 text-sm text-foreground">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Purchase Price
              </p>
              <p className="mt-1 font-semibold">
                {po.purchasePrice != null
                  ? `₹${Number(po.purchasePrice).toLocaleString('en-IN')}`
                  : '—'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priceDecision"
                  checked={(fields.decision ?? 'approve') === 'approve'}
                  onChange={() => setField('decision', 'approve')}
                />
                <span>Approve Price</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priceDecision"
                  checked={fields.decision === 'return_sales'}
                  onChange={() => setField('decision', 'return_sales')}
                />
                <span>Return to Sales</span>
              </label>
            </div>
            {fields.decision === 'return_sales' && (
              <Textarea
                rows={3}
                onChange={(e) => setField('rejectionReason', e.target.value)}
                placeholder="Required return reason"
              />
            )}
          </div>
        ),
        onSubmit: async ({ note, fields }) => {
          if (fields.decision === 'return_sales') {
            await returnToSales(fields.rejectionReason);
            return;
          }

          const updated = await updateSalesPOStatus(po.id, {
            toStatus: 'purchase_approved',
            newComments: note,
          });
          setData((prev) => prev.filter((item) => item.id !== updated.id));
          toast.success('Purchase price approved');
        },
      };
    }

    return {
      title: sectionTitle(po.status),
      primaryLabel: 'Submit Decision',
      submittingLabel: 'Submitting...',
      noteLabel: 'Admin Notes',
      notePlaceholder: 'Optional final approval notes...',
      renderExtraFields: ({ setField, fields }) => (
        <div className="space-y-3 rounded-lg border bg-background p-3 text-sm text-foreground">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="finalDecision"
                checked={(fields.decision ?? 'approve') === 'approve'}
                onChange={() => setField('decision', 'approve')}
              />
              <span>Final Approve</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="finalDecision"
                checked={fields.decision === 'return_sales'}
                onChange={() => setField('decision', 'return_sales')}
              />
              <span>Return to Sales</span>
            </label>
          </div>
          {fields.decision === 'return_sales' && (
            <Textarea
              rows={3}
              onChange={(e) => setField('rejectionReason', e.target.value)}
              placeholder="Required return reason"
            />
          )}
        </div>
      ),
      onSubmit: async ({ note, fields }) => {
        if (fields.decision === 'return_sales') {
          await returnToSales(fields.rejectionReason);
          return;
        }

        const updated = await updateSalesPOStatus(po.id, {
          toStatus: 'final_admin_approved',
          newComments: note,
        });
        setData((prev) => prev.filter((item) => item.id !== updated.id));
        toast.success('PO approved');
      },
    };
  };

  if (!authUser) {
    return (
      <SalesMessageCard>Please log in to view POs.</SalesMessageCard>
    );
  }

  if (role !== 'admin') {
    return (
      <SalesMessageCard>You do not have permission to access Admin Review.</SalesMessageCard>
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
      <div className="flex h-full flex-col gap-5">
        <SalesPageHeader
          title="Admin Queue"
          description="Review sales tickets, route work, approve pricing, and perform final approvals."
          action={
            <Button type="button" onClick={() => void refresh()} variant="outline" size="sm">
              Refresh
            </Button>
          }
        />

        {grouped.map((section) => (
          <section key={section.title} className="space-y-3">
            <SalesSectionHeader title={section.title} count={section.items.length} countLabel="pending" />

            {section.items.length === 0 ? (
              <SalesEmptyState description={`No ${section.title.toLowerCase()} items.`} />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((po) => (
                  <SalesPOCard key={po.id} po={po} onClick={() => setSelectedPO(po)} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {selectedPO && (
        <SalesPOTicketModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          viewerRole="admin"
          action={actionFor(selectedPO)}
        />
      )}
    </>
  );
};

export default SalesAdminReviewView;
