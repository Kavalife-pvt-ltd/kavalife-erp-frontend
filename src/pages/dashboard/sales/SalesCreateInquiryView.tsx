import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { createSalesPO } from '@/api/sales';
import { getCOASignedUrl, uploadCOA } from '@/api/coa';
import type { SalesPORequestType } from '@/types/sales';

type FormState = {
  productName: string;
  companyName: string;
  companyAddress: string;

  // stores backend-returned storage path e.g. "coa/2026/01/uuid.jpg"
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

const QUANTITY_UNITS = ['kg', 'L', 'pcs'] as const;
const MAX_COA_MB = 5;

const initialFormState: FormState = {
  productName: '',
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

const SalesCreateInquiryView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [coaFile, setCoaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openingCOA, setOpeningCOA] = useState(false);
  const [coaLocalPreviewUrl, setCoaLocalPreviewUrl] = useState<string | null>(null);
  const [coaUploadedPreviewUrl, setCoaUploadedPreviewUrl] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const isNumberField = useMemo(() => new Set(['quantity', 'askingPrice']), []);

  const openPreviewModal = useCallback((src: string) => {
    setPreviewSrc(src);
    setZoom(1);
    setPreviewModalOpen(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setPreviewModalOpen(false);
    setPreviewSrc(null);
    setZoom(1);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const next = isNumberField.has(name) ? value.replace(/[^\d.]/g, '') : value;
      setForm((prev) => ({ ...prev, [name]: next }));
    },
    [isNumberField]
  );

  const handleCOAFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // reset previews first
    setCoaUploadedPreviewUrl(null);

    if (!file) {
      setCoaFile(null);
      setCoaLocalPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file for COA');
      e.target.value = '';
      setCoaFile(null);
      setCoaLocalPreviewUrl(null);
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_COA_MB) {
      toast.error(`COA image must be <= ${MAX_COA_MB}MB`);
      e.target.value = '';
      setCoaFile(null);
      setCoaLocalPreviewUrl(null);
      return;
    }

    setCoaFile(file);

    // create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setCoaLocalPreviewUrl(objectUrl);

    // clear old uploaded path (avoid stale “View uploaded”)
    setForm((prev) => ({ ...prev, coaUrl: '' }));
  }, []);

  const clearCOASelection = useCallback(() => {
    setCoaFile(null);

    if (coaLocalPreviewUrl) {
      URL.revokeObjectURL(coaLocalPreviewUrl);
    }
    setCoaLocalPreviewUrl(null);

    // If you want to also clear uploaded preview (but not delete from bucket)
    setCoaUploadedPreviewUrl(null);

    // If you want to clear the stored path from form as well:
    setForm((prev) => ({ ...prev, coaUrl: '' }));
  }, [coaLocalPreviewUrl]);

  useEffect(() => {
    return () => {
      if (coaLocalPreviewUrl) URL.revokeObjectURL(coaLocalPreviewUrl);
    };
  }, [coaLocalPreviewUrl]);

  const validate = useCallback((): string | null => {
    if (!form.productName.trim()) return 'Product is required';
    if (!form.companyName.trim()) return 'Company name is required';
    if (!form.companyAddress.trim()) return 'Company address is required';

    const q = Number(form.quantity);
    if (!form.quantity.trim() || Number.isNaN(q) || q <= 0) return 'Valid quantity is required';

    if (form.contactEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
      return 'Contact email looks invalid';
    }

    // If COA should be mandatory, uncomment:
    // if (!coaFile && !form.coaUrl.trim()) return 'Please upload a COA image';

    return null;
  }, [form]);

  const buildPayload = useCallback(
    (coaPath?: string) => {
      const quantityNum = Number(form.quantity);

      const askingPriceNum =
        form.askingPrice.trim() && !Number.isNaN(Number(form.askingPrice))
          ? Number(form.askingPrice)
          : undefined;

      const expectedDeliveryDateISO = form.expectedDeliveryDate
        ? new Date(`${form.expectedDeliveryDate}T00:00:00`).toISOString()
        : undefined;

      return {
        productName: form.productName.trim(),
        companyName: form.companyName.trim(),
        companyAddress: form.companyAddress.trim(),

        // coaUrl is a PATH returned by backend upload endpoint
        coaUrl: coaPath?.trim() || form.coaUrl.trim() || undefined,

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
        expectedDeliveryDate: expectedDeliveryDateISO,
      };
    },
    [form]
  );

  const reset = useCallback(() => {
    setForm(initialFormState);
    setCoaFile(null);
    setCoaLocalPreviewUrl(null);
    setCoaUploadedPreviewUrl(null);
  }, []);

  const handleOpenCOA = useCallback(async () => {
    const path = form.coaUrl.trim();
    if (!path) {
      toast.error('No COA uploaded yet');
      return;
    }

    try {
      setOpeningCOA(true);
      const signed = await getCOASignedUrl(path);
      window.open(signed, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open COA';
      toast.error(msg);
    } finally {
      setOpeningCOA(false);
    }
  }, [form.coaUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    try {
      setSubmitting(true);

      let coaPath: string | undefined;

      // ✅ Step 1: upload file (if selected)
      if (coaFile) {
        toast.loading('Uploading COA…', { id: 'coa-upload' });
        coaPath = await uploadCOA(coaFile);
        try {
          const signed = await getCOASignedUrl(coaPath);
          setCoaUploadedPreviewUrl(signed);
        } catch {
          // not fatal — you can still open via "View uploaded COA"
          setCoaUploadedPreviewUrl(null);
        }
        toast.success('COA uploaded', { id: 'coa-upload' });

        // Save returned path so we can view it later without resubmitting
        setForm((prev) => ({ ...prev, coaUrl: coaPath ?? '' }));
      }

      // ✅ Step 2: create inquiry with coaUrl path (if any)
      const payload = buildPayload(coaPath);
      await createSalesPO(payload);

      toast.success('Inquiry created and sent for admin review');
      reset();
    } catch (error: unknown) {
      toast.dismiss('coa-upload');

      let message = 'Failed to create inquiry';

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = data?.error ?? data?.message ?? data?.details ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }

      console.error('CreateInquiry error:', error);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) {
    return (
      <div className="rounded-xl border border-stroke bg-background p-4 text-sm text-primaryText">
        Please log in to create an inquiry.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-primaryText">Create Inquiry</h2>
        <p className="text-sm text-primaryText/70">
          Capture client and product requirements. This inquiry goes to admin for review and routing
          to purchase/production.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid flex-1 grid-cols-1 gap-4 rounded-xl border border-stroke bg-foreground p-4 shadow-custom md:grid-cols-2"
      >
        {/* LEFT */}
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-primaryText">
              Product<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              placeholder="e.g. Chilli Powder"
              className="mt-1 w-full rounded-md border border-stroke bg-background px-3 py-2 text-sm text-primaryText shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="mt-1 text-[11px] text-primaryText/60">
              Tip: keep it human-readable. Admin/purchase/production will see this as-is.
            </p>
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

          {/* ✅ COA Upload */}
          <div>
            <label className="block text-sm font-medium text-primaryText">COA (Upload Image)</label>

            <div className="mt-1 flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleCOAFileChange}
                className="block w-full text-sm text-primaryText file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium file:text-primaryText hover:file:opacity-90"
              />

              <div className="flex flex-wrap items-center gap-2 text-xs text-primaryText/70">
                <span>Max {MAX_COA_MB}MB • Image only</span>

                {/* Local selected */}

                {(coaFile || form.coaUrl.trim()) && (
                  <button
                    type="button"
                    onClick={clearCOASelection}
                    className="rounded-md border border-stroke bg-background px-3 py-1 text-primaryText hover:opacity-90"
                  >
                    Remove
                  </button>
                )}
                {coaFile && (
                  <span className="rounded-md border border-stroke bg-background px-2 py-1 text-primaryText">
                    Selected: {coaFile.name}
                  </span>
                )}

                {/* Uploaded status */}
                {form.coaUrl.trim() && (
                  <span className="rounded-md border border-stroke bg-background px-2 py-1 text-emerald-600">
                    Uploaded ✅
                  </span>
                )}

                {/* View uploaded */}
                {form.coaUrl.trim() && (
                  <button
                    type="button"
                    onClick={handleOpenCOA}
                    disabled={openingCOA}
                    className="rounded-md border border-stroke bg-background px-3 py-1 text-primaryText hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {openingCOA ? 'Opening…' : 'View uploaded COA'}
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* local preview */}
                {coaLocalPreviewUrl && (
                  <div className="rounded-lg border border-stroke bg-background p-2">
                    <div className="mb-1 text-[11px] text-primaryText/70">Preview (local)</div>
                    <img
                      src={coaLocalPreviewUrl}
                      alt="COA preview (local)"
                      onClick={() => openPreviewModal(coaLocalPreviewUrl)}
                      className="h-40 w-full rounded-md object-contain"
                    />
                  </div>
                )}

                {/* uploaded preview */}
                {coaUploadedPreviewUrl && (
                  <div className="rounded-lg border border-stroke bg-background p-2">
                    <div className="mb-1 text-[11px] text-primaryText/70">Preview (uploaded)</div>
                    <img
                      src={coaUploadedPreviewUrl}
                      alt="COA preview (uploaded)"
                      className="h-40 w-full rounded-md object-contain"
                      onClick={() => openPreviewModal(coaUploadedPreviewUrl)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
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

        {/* RIGHT */}
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
                type="text"
                name="quantity"
                inputMode="decimal"
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
                type="text"
                name="askingPrice"
                inputMode="decimal"
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
              placeholder="Any special instructions / negotiation notes…"
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
              {submitting ? 'Creating Inquiry…' : 'Create Inquiry'}
            </button>
          </div>
        </div>
      </form>
      {previewModalOpen && previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closePreviewModal}
        >
          <div
            className="relative w-full max-w-6xl rounded-xl border border-stroke bg-background p-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="text-sm font-medium text-primaryText">COA Preview</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                  className="rounded-md border border-stroke bg-background px-3 py-1 text-sm text-primaryText hover:opacity-90"
                >
                  -
                </button>

                <div className="min-w-[70px] text-center text-sm text-primaryText/70">
                  {Math.round(zoom * 100)}%
                </div>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                  className="rounded-md border border-stroke bg-background px-3 py-1 text-sm text-primaryText hover:opacity-90"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="rounded-md border border-stroke bg-background px-3 py-1 text-sm text-primaryText hover:opacity-90"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={closePreviewModal}
                  className="rounded-md border border-stroke bg-background px-3 py-1 text-sm text-primaryText hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-auto rounded-lg border border-stroke bg-foreground p-2">
              <img
                src={previewSrc}
                alt="COA full preview"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                className="block"
              />
            </div>

            <p className="px-2 pt-2 text-xs text-primaryText/60">
              Tip: use trackpad/pinch to scroll around after zooming. (Zoom buttons handle scale.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCreateInquiryView;
