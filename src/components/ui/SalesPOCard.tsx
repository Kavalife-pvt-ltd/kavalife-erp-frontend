// src/components/ui/SalesPOCard.tsx
import React from 'react';
import type { SalesPO, SalesPOStatus } from '@/types/sales';
import clsx from 'clsx';

type Props = {
  po: SalesPO;
  onClick?: () => void;
};

function getStatusLabel(status: SalesPOStatus): string {
  switch (status) {
    case 'quote_requested':
      return 'Quote Requested';
    case 'quote_admin_approved':
      return 'Admin Approved';
    case 'quote_sent_to_client':
      return 'Sent to Client';
    case 'client_negotiation':
      return 'Client Negotiation';
    case 'client_approved':
      return 'Client Approved';
    case 'client_rejected':
      return 'Client Rejected';
    case 'final_admin_approved':
      return 'Final Admin Approved';
    case 'routed_to_purchase':
      return 'Routed to Purchase';
    case 'routed_to_production':
      return 'Routed to Production';
    case 'admin_rejected':
      return 'Admin Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function getStatusClass(status: SalesPOStatus): string {
  if (status === 'client_rejected' || status === 'admin_rejected' || status === 'cancelled') {
    return 'bg-red-100 text-red-700';
  }
  if (
    status === 'quote_admin_approved' ||
    status === 'client_approved' ||
    status === 'final_admin_approved'
  ) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (status === 'routed_to_purchase' || status === 'routed_to_production') {
    return 'bg-blue-100 text-blue-700';
  }
  return 'bg-amber-100 text-amber-800'; // in-progress / neutral
}

const SalesPOCard: React.FC<Props> = ({ po, onClick }) => {
  const poNumber = po.poNumber ?? `PO-${po.id}`;
  const requestTypeLabel = po.requestType === 'sample' ? 'Sample Request' : 'Purchase Request';

  const expectedDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '-';

  const requestDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '-';

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md',
        'dark:border-slate-700 dark:bg-slate-900'
      )}
    >
      {/* Top row: PO number + status */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-400">{poNumber}</div>
          <div className="text-sm text-slate-500">{requestTypeLabel}</div>
        </div>
        <span
          className={clsx(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            getStatusClass(po.status)
          )}
        >
          {getStatusLabel(po.status)}
        </span>
      </div>

      {/* Company + product */}
      <div className="mb-2">
        <div className="text-sm font-semibold text-slate-900">{po.companyName}</div>
        {po.productName && <div className="text-xs text-slate-500">Product: {po.productName}</div>}
      </div>

      {/* Quantity / price */}
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-slate-600">
        <div>
          <span className="font-semibold">Qty: </span>
          {po.quantity} {po.quantityUnit ?? ''}
        </div>
        {po.askingPrice != null && (
          <div>
            <span className="font-semibold">Asking: </span>
            {po.askingPrice}
          </div>
        )}
        {po.purity && (
          <div>
            <span className="font-semibold">Purity: </span>
            {po.purity}
          </div>
        )}
        {po.grade && (
          <div>
            <span className="font-semibold">Grade: </span>
            {po.grade}
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <div>
          <span className="font-semibold">Requested: </span>
          {requestDate}
        </div>
        <div>
          <span className="font-semibold">Expected: </span>
          {expectedDate}
        </div>
      </div>
    </button>
  );
};

export default SalesPOCard;
