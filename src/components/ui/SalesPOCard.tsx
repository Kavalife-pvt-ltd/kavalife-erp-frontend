// src/components/ui/SalesPOCard.tsx
import React from 'react';
import type { SalesPO } from '@/types/sales';
import type { Product } from '@/types/bootstrap';
import { useBootstrapStore } from '@/store/bootstrap';
import clsx from 'clsx';

type Props = {
  po: SalesPO;
  maskCompany?: boolean;
  onClick?: () => void;
};

const statusLabelMap: Record<string, string> = {
  quote_requested: 'Quote Requested',
  quote_admin_approved: 'Admin Approved',
  quote_sent_to_client: 'Sent to Client',
  client_negotiation: 'Negotiation',
  client_approved: 'Client Approved',
  client_rejected: 'Client Rejected',
  final_admin_approved: 'Final Admin Approved',
  routed_to_purchase: 'Routed to Purchase',
  routed_to_production: 'Routed to Production',
  admin_rejected: 'Admin Rejected',
  cancelled: 'Cancelled',
};

const statusColorClass = (status: string) =>
  ({
    quote_requested: 'bg-yellow-100 text-yellow-800',
    quote_admin_approved: 'bg-emerald-100 text-emerald-800',
    quote_sent_to_client: 'bg-blue-100 text-blue-800',
    client_negotiation: 'bg-indigo-100 text-indigo-800',
    client_approved: 'bg-emerald-100 text-emerald-800',
    client_rejected: 'bg-red-100 text-red-800',
    final_admin_approved: 'bg-emerald-100 text-emerald-800',
    routed_to_purchase: 'bg-sky-100 text-sky-800',
    routed_to_production: 'bg-purple-100 text-purple-800',
    admin_rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-200 text-slate-700',
  })[status] ?? 'bg-slate-100 text-slate-700';

const SalesPOCard: React.FC<Props> = ({ po, maskCompany = false, onClick }) => {
  const products = useBootstrapStore((s) => s.products as Product[] | undefined) ?? [];
  const product = products.find((p) => p.id === po.productId);

  const poNumber = po.poNumber ?? 'Draft / Pending Number';
  const statusLabel = statusLabelMap[po.status] ?? po.status;

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';

  const dueDate =
    po.expectedDeliveryDate != null ? new Date(po.expectedDeliveryDate).toLocaleDateString() : null;

  const companyName = maskCompany ? 'Confidential Client' : po.companyName;
  const companyAddress = maskCompany ? 'Hidden for this view' : po.companyAddress;

  return (
    <article
      onClick={onClick}
      className={clsx(
        'flex flex-col gap-2 rounded-xl border border-stroke bg-foreground p-4 shadow-custom',
        onClick && 'cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-lg'
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-primaryText">{poNumber}</h3>
          <p className="text-xs text-primaryText/70">
            {product ? product.name : `Product ID: ${po.productId}`}
          </p>
        </div>
        <span
          className={clsx(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            statusColorClass(po.status)
          )}
        >
          {statusLabel}
        </span>
      </header>

      <section className="space-y-1 text-xs">
        <p className="font-medium text-primaryText">{companyName}</p>
        <p className="text-primaryText/70 line-clamp-2">{companyAddress}</p>

        <div className="mt-1 grid grid-cols-2 gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Quantity</p>
            <p className="text-xs text-primaryText">
              {po.quantity} {po.quantityUnit ?? ''}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Request Type</p>
            <p className="text-xs text-primaryText">
              {po.requestType === 'sample' ? 'Sample' : 'Purchase'}
            </p>
          </div>
        </div>

        {dueDate && (
          <div className="mt-2">
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Due Date</p>
            <p className="text-xs text-primaryText">{dueDate}</p>
          </div>
        )}

        {/* Sales comments */}
        {po.comments && (
          <div className="mt-2">
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Comments</p>
            <p className="text-xs text-primaryText line-clamp-2">{po.comments}</p>
          </div>
        )}

        {/* Reason for rejection (if any) */}
        {po.rejectionReason && (
          <div className="mt-2">
            <p className="text-[11px] uppercase tracking-wide text-red-500">Reason for Rejection</p>
            <p className="text-xs text-red-600 dark:text-red-300 line-clamp-2">
              {po.rejectionReason}
            </p>
          </div>
        )}
      </section>

      <footer className="mt-2 flex items-center justify-between text-[11px] text-primaryText/70">
        <span>{createdDate}</span>
        {po.purity && <span>Purity: {po.purity}</span>}
      </footer>
    </article>
  );
};

export default SalesPOCard;
