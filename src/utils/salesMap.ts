import type { SalesPO } from '@/types/sales';

export const STATUS_LABEL: Record<SalesPO['status'], string> = {
  quote_requested: 'Quote Requested',
  routed_to_purchase: 'Routed to Purchase',
  routed_to_production: 'Routed to Production',

  purchase_priced: 'Purchase Priced',
  purchase_approved: 'Purchase Approved',
  purchase_completed: 'Purchase Completed',

  production_completed: 'Production Completed',

  quote_admin_approved: 'Quote Admin Approved',
  final_admin_approved: 'Final Admin Approved',

  admin_rejected: 'Admin Rejected',
  client_rejected: 'Client Rejected',
  cancelled: 'Cancelled',
  closed: 'Closed',

  // if you still use these later:
  quote_sent_to_client: 'Quote Sent to Client',
  client_negotiation: 'Client Negotiation',
  client_approved: 'Client Approved',
};

export function prettyStatus(s?: string | null) {
  if (!s) return '—';
  return (STATUS_LABEL as Record<string, string>)[s] ?? s.replaceAll('_', ' ');
}

export function prettyTransition(from?: string | null, to?: string | null) {
  const a = prettyStatus(from);
  const b = prettyStatus(to);
  return `${a} → ${b}`;
}
