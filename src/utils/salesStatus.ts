import type { SalesPOStatus } from '@/types/sales';

const STATUS_LABELS: Record<string, string> = {
  quote_requested: 'Quote Requested',
  routed_to_purchase: 'Routed to Purchase',
  purchase_priced: 'Price Submitted',
  purchase_approved: 'Price Approved',
  purchase_completed: 'Purchase Completed',
  routed_to_production: 'Routed to Production',
  production_completed: 'Production Completed',
  final_admin_approved: 'PO Approved',
  admin_rejected: 'Returned to Sales',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

export function prettyStatus(status?: SalesPOStatus | string | null): string {
  if (!status) return '—';
  return STATUS_LABELS[status] ?? status;
}

export function prettyTransition(
  fromStatus?: SalesPOStatus | string | null,
  toStatus?: SalesPOStatus | string | null
): string {
  if (!fromStatus) return prettyStatus(toStatus);
  return `${prettyStatus(fromStatus)} → ${prettyStatus(toStatus)}`;
}
