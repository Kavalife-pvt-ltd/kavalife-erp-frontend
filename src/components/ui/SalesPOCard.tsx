// src/components/ui/SalesPOCard.tsx
import React from 'react';
import { SalesPO } from '@/types/sales';
import { cn } from '@/utils/utils';

interface SalesPOCardProps {
  po: SalesPO;
  variant?: 'default' | 'admin' | 'purchase' | 'production';
  maskedClient?: boolean;
  onClick?: () => void;
  onPrimaryActionClick?: () => void;
  primaryActionLabel?: string;
  onSecondaryActionClick?: () => void;
  secondaryActionLabel?: string;
}

export const SalesPOCard: React.FC<SalesPOCardProps> = ({
  po,
  //   variant = 'default',
  maskedClient = false,
  onClick,
  onPrimaryActionClick,
  primaryActionLabel = 'View',
  onSecondaryActionClick,
  secondaryActionLabel,
}) => {
  // Masked client label for purchase/production
  const clientLabel = maskedClient ? `CLIENT-${po.id.toString().padStart(4, '0')}` : po.companyName;

  const statusColor = getStatusColor(po.status);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500">PO Number</p>
          <p className="text-base font-semibold text-slate-900">
            {po.poNumber ?? `PO-${po.id.toString().padStart(4, '0')}`}
          </p>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', statusColor)}>
          {po.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
        <div>
          <p className="text-xs text-slate-500">Product</p>
          <p className="font-medium">{po.productName ?? `#${po.productId}`}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Client</p>
          <p className="font-medium truncate">{clientLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Quantity</p>
          <p>
            {po.quantity} {po.quantityUnit ? po.quantityUnit.toUpperCase() : ''}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Expected Delivery</p>
          <p>{po.expectedDeliveryDate ? po.expectedDeliveryDate : '-'}</p>
        </div>
        {po.purity && (
          <div>
            <p className="text-xs text-slate-500">Purity</p>
            <p>{po.purity}</p>
          </div>
        )}
        {po.grade && (
          <div>
            <p className="text-xs text-slate-500">Grade</p>
            <p>{po.grade}</p>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          <p>Created: {new Date(po.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex gap-2">
          {secondaryActionLabel && onSecondaryActionClick && (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={(e) => {
                e.stopPropagation();
                onSecondaryActionClick();
              }}
            >
              {secondaryActionLabel}
            </button>
          )}
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            onClick={(e) => {
              e.stopPropagation();
              onPrimaryActionClick?.();
            }}
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case 'quote_requested':
      return 'bg-amber-50 text-amber-700';
    case 'quote_admin_approved':
    case 'final_admin_approved':
      return 'bg-emerald-50 text-emerald-700';
    case 'client_negotiation':
      return 'bg-sky-50 text-sky-700';
    case 'client_approved':
      return 'bg-green-50 text-green-700';
    case 'admin_rejected':
    case 'client_rejected':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700';
    case 'routed_to_purchase':
    case 'routed_to_production':
      return 'bg-indigo-50 text-indigo-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
