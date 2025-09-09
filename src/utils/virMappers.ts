// src/utils/virMappers.ts
import type { VIR, VIRCardProps, VIRCardStatus, VIRDetails } from '@/types/vir';

export const mapStatusToCard = (s: VIR['status']): VIRCardStatus =>
  s === 'completed' ? 'verified' : 'pending verification';

export const virToDetails = (vir: VIR): VIRDetails => ({
  id: vir.id,
  virNumber: vir.vir_number,
  vendorName: vir.vendor_name ?? String(vir.vendor_id ?? ''),
  productName: vir.product_name ?? String(vir.product_id ?? ''),
  productImage: '',
  date: vir.created_at,
  remarks: vir.remarks,
});

export const virToCardProps = (vir: VIR): VIRCardProps => ({
  id: vir.id,
  vir_number: vir.vir_number,
  vendorId: vir.vendor_name ?? vir.vendor_id ?? '',
  productId: vir.product_name ?? vir.product_id ?? '',
  status: mapStatusToCard(vir.status),
  remarks: vir.remarks,
  imageUrl: undefined,
  checklist: vir.checklist,
  createdAt: vir.created_at,
  verifiedBy: typeof vir.checked_by === 'number' ? String(vir.checked_by) : undefined,
});
