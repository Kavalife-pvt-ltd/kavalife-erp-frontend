import type { SalesInquiryGroup, SalesPO } from '@/types/sales';
import { prettyStatus } from '@/utils/salesStatus';

export const formatGroupDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : '—';

export const formatGroupDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '—';

export const formatMoney = (value?: number | null) =>
  value == null
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const formatRequestType = (value: SalesPO['requestType']) =>
  value === 'sample' ? 'Sample' : 'Purchase';

export const formatQueue = (value?: string | null) => {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getGroupTitle = (group: SalesInquiryGroup) =>
  group.inquiryNumber ? `Inquiry #${group.inquiryNumber}` : `Inquiry #${group.id}`;

export const getQuantityLabel = (item: SalesPO) =>
  `${item.quantity} ${item.quantityUnit ?? ''}`.trim();

export const getExpectedDeliverySummary = (items: SalesPO[]) => {
  const dates = items
    .map((item) => item.expectedDeliveryDate)
    .filter((value): value is string => Boolean(value));

  if (dates.length === 0) return '—';

  const sorted = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return formatGroupDate(sorted[0]);
};

export const getGroupStatusSummary = (items: SalesPO[]) => {
  if (items.length === 0) return 'No items';

  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([status, count]) => `${count} ${prettyStatus(status as SalesPO['status']).toLowerCase()}`)
    .join(', ');
};

export const getGroupProgressSummary = (items: SalesPO[]) => {
  if (items.length === 0) return 'No ingredients';

  const adminCount = items.filter((item) => item.sendTo === 'admin').length;
  const purchaseCount = items.filter((item) => item.sendTo === 'purchase').length;
  const productionCount = items.filter((item) => item.sendTo === 'production').length;
  const returnedCount = items.filter((item) => item.status === 'admin_rejected').length;
  const approvedCount = items.filter((item) =>
    ['final_admin_approved', 'closed'].includes(item.status)
  ).length;

  const parts = [
    adminCount > 0 ? `${adminCount} waiting for admin` : null,
    purchaseCount > 0 ? `${purchaseCount} sent to purchase` : null,
    productionCount > 0 ? `${productionCount} sent to production` : null,
    returnedCount > 0 ? `${returnedCount} returned` : null,
    approvedCount > 0 ? `${approvedCount} approved` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : getGroupStatusSummary(items);
};

export const getAdminActionCount = (items: SalesPO[]) =>
  items.filter((item) => item.sendTo === 'admin').length;
