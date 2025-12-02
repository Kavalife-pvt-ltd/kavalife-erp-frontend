// src/pages/dashboard/sales/SalesCreatePOView.tsx
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { createSalesPO } from '@/api/sales';
import type { SalesPORequestType } from '@/types/sales';
import type { Product } from '@/types/bootstrap';
import { useBootstrapStore } from '@/store/bootstrap';

type FormState = {
  productId: string;
  companyName: string;
  companyAddress: string;
  coaUrl: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  purity: string;
  grade: string;
  requestType: SalesPORequestType;
  quantity: string;
  quantityUnit: string;
  askingPrice: string;
  comments: string;
  expectedDeliveryDate: string; // yyyy-mm-dd
};

const initialFormState: FormState = {
  productId: '',
  companyName: '',
  companyAddress: '',
  coaUrl: '',
  contactName: '',
  contactNumber: '',
  contactEmail: '',
  purity: '',
  grade: '',
  requestType: 'purchase',
  quantity: '',
  quantityUnit: 'kg',
  askingPrice: '',
  comments: '',
  expectedDeliveryDate: '',
};

const QUANTITY_UNITS = ['kg', 'L', 'pcs'] as const;

const SalesCreatePOView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const products = useBootstrapStore((s) => s.products as Product[] | undefined) ?? [];

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = (): string | null => {
    if (!form.productId.trim()) return 'Product is required';
    if (!form.companyName.trim()) return 'Company name is required';
    if (!form.companyAddress.trim()) return 'Company address is required';

    if (!form.quantity.trim() || Number.isNaN(Number(form.quantity))) {
      return 'Valid quantity is required';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const productIdNum = Number(form.productId);
      const quantityNum = Number(form.quantity);
      const askingPriceNum = form.askingPrice.trim() ? Number(form.askingPrice) : undefined;

      const expectedDateISO = form.expectedDeliveryDate
        ? new Date(form.expectedDeliveryDate + 'T00:00:00').toISOString()
        : undefined;

      const payload = {
        productId: productIdNum,
        companyName: form.companyName.trim(),
        companyAddress: form.companyAddress.trim(),
        coaUrl: form.coaUrl.trim() || undefined,
        companyContactName: form.contactName.trim() || undefined,
        companyContactNumber: form.contactNumber.trim() || undefined,
        companyContactEmail: form.contactEmail.trim() || undefined,
        purity: form.purity.trim() || undefined,
        grade: form.grade.trim() || undefined,
        requestType: form.requestType,
        quantity: quantityNum,
        quantityUnit: form.quantityUnit.trim() || undefined,
        askingPrice: askingPriceNum,
        comments: form.comments.trim() || undefined,
        expectedDeliveryDate: expectedDateISO,
        // requestDate & salesRepId handled by backend
      };

      await createSalesPO(payload);

      toast.success('Sales PO created and sent for admin review');
      setForm(initialFormState);
    } catch (error: unknown) {
      let message = 'Failed to create Sales PO';

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;

        message = data?.error ?? data?.message ?? data?.details ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }

      console.error('CreateSalesPO error:', error);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) {
    return (
      <div className="rounded-xl border border-stroke bg-background p-4 text-sm text-primaryText">
        Please log in to create a Sales PO.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-primaryText">Create Sales PO</h2>
        <p className="text-sm text-primaryText/70">
          Capture client and product requirements. This PO will go to admins for approval and
          trigger email notifications.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid flex-1 grid-cols-1 gap-4 rounded-xl border border-stroke bg-foreground p-4 shadow-custom md:grid-cols-2"
      >
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-primaryText">
              Product<span className="text-red-500">*</span>
            </label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select product</option>
              {sortedProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.code ? ` (${p.code})` : ''}
                </option>
              ))}
            </select>
            {sortedProducts.length === 0 && (
              <p className="mt-1 text-xs text-primaryText/60">
                No products loaded yet. Ensure bootstrap data is fetched on login.
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-primaryText">
              Company Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Company Address */}
          <div>
            <label className="block text-sm font-medium text-primaryText">
              Company Address<span className="text-red-500">*</span>
            </label>
            <textarea
              name="companyAddress"
              value={form.companyAddress}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* COA URL */}
          <div>
            <label className="block text-sm font-medium text-primaryText">COA (URL)</label>
            <input
              type="url"
              name="coaUrl"
              value={form.coaUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primaryText">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primaryText">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primaryText">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Purity & Grade */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primaryText">Purity</label>
              <input
                type="text"
                name="purity"
                value={form.purity}
                onChange={handleChange}
                placeholder="e.g. 98%"
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primaryText">Grade</label>
              <input
                type="text"
                name="grade"
                value={form.grade}
                onChange={handleChange}
                placeholder="e.g. Pharma / Food"
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-primaryText">Request Type</label>
            <select
              name="requestType"
              value={form.requestType}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="purchase">Purchase</option>
              <option value="sample">Sample</option>
            </select>
          </div>

          {/* Quantity / Unit / Price */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-primaryText">
                Quantity<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primaryText">Unit</label>
              <select
                name="quantityUnit"
                value={form.quantityUnit}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {QUANTITY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primaryText">Asking Price</label>
              <input
                type="number"
                name="askingPrice"
                value={form.askingPrice}
                onChange={handleChange}
                placeholder="Optional"
                className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Expected Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-primaryText">
              Expected Delivery Date
            </label>
            <input
              type="date"
              name="expectedDeliveryDate"
              value={form.expectedDeliveryDate}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-primaryText">Comments / Notes</label>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleChange}
              rows={3}
              placeholder="Any special instructions or negotiation notes…"
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating PO…' : 'Create PO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SalesCreatePOView;
