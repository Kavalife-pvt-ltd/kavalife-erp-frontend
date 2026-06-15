import React from 'react';
import type { SalesPO } from '@/types/sales';
import clsx from 'clsx';
import { prettyStatus } from '@/utils/salesStatus';

type Props = {
  po: SalesPO;
  maskCompany?: boolean;
  onClick?: () => void;
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
    purchase_priced: 'bg-amber-100 text-amber-800',
    purchase_approved: 'bg-emerald-100 text-emerald-800',
    purchase_completed: 'bg-emerald-100 text-emerald-800',
    routed_to_production: 'bg-purple-100 text-purple-800',
    production_completed: 'bg-emerald-100 text-emerald-800',
    admin_rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-200 text-slate-700',
    closed: 'bg-slate-200 text-slate-700',
  })[status] ?? 'bg-slate-100 text-slate-700';

const isPOStage = (po: SalesPO) =>
  po.status === 'final_admin_approved' || po.status === 'closed' || !!po.poNumber;

const getTicketNumberLabel = (po: SalesPO) => {
  if (po.poNumber) return `PO #${po.poNumber}`;
  if (po.inquiryNumber) return `Inquiry #${po.inquiryNumber}`;
  return `#${po.id}`;
};

const SalesPOCard: React.FC<Props> = ({ po, maskCompany = false, onClick }) => {
  const isPO = isPOStage(po);

  const statusLabel = prettyStatus(po.status);

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';
  const dueDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '';

  const companyName = maskCompany ? 'Confidential Client' : po.companyName;
  const companyAddress = maskCompany ? 'Hidden for this view' : po.companyAddress;

  const productName = po.productName?.trim() || '—';

  const Wrapper: React.ElementType = onClick ? 'button' : 'article';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={clsx(
        'w-full text-left',
        'flex flex-col gap-2 rounded-xl border border-stroke bg-background p-4 shadow-custom',
        onClick ? 'hover:bg-stroke/20 transition-colors' : ''
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-primaryText">{getTicketNumberLabel(po)}</h3>
          <p className="text-xs text-primaryText/70">{productName}</p>
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

        {isPO && po.askingPrice != null && (
          <div className="mt-1">
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Asking Price</p>
            <p className="text-xs font-semibold text-primaryText">
              ₹{Number(po.askingPrice).toLocaleString('en-IN')}
            </p>
          </div>
        )}

        {po.purchasePrice != null && (
          <div className="mt-1">
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
              Purchase Price
            </p>
            <p className="text-xs font-semibold text-primaryText">
              ₹{Number(po.purchasePrice).toLocaleString('en-IN')}
            </p>
          </div>
        )}

        {po.comments && (
          <div className="mt-2">
            <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Comments</p>
            <p className="text-xs text-primaryText line-clamp-2">{po.comments}</p>
          </div>
        )}
      </section>

      <footer className="mt-2 flex items-center justify-between gap-2 text-[11px] text-primaryText/70">
        <span>{createdDate ? `Created: ${createdDate}` : 'Created: —'}</span>
        <span>{dueDate ? `Due: ${dueDate}` : 'Due: —'}</span>
      </footer>
    </Wrapper>
  );
};

export default SalesPOCard;
