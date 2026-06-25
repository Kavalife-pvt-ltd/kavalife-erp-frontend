import React, { useCallback, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { ChevronDown, ChevronRight, FileText, Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { uploadDocuments } from '@/api/documents';
import { createSalesInquiry } from '@/api/sales';
import type { CreateSalesInquiryRequest, SalesInquiryDraftItem } from '@/types/sales';
import {
  createBlankSalesInquiryItem,
  toCreateSalesInquiryItemPayload,
} from '@/utils/salesInquiryItems';

type CustomerFormState = {
  companyName: string;
  companyAddress: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  requestDate: string;
  comments: string;
};

const initialCustomerFormState: CustomerFormState = {
  companyName: '',
  companyAddress: '',
  contactName: '',
  contactNumber: '',
  contactEmail: '',
  requestDate: '',
  comments: '',
};

type SubmitPhase = 'idle' | 'creating' | 'uploading';

const maxUploadFileSizeBytes = 5 * 1024 * 1024;
const compressibleImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

const isCompressibleImage = (file: File) => compressibleImageTypes.has(file.type.toLowerCase());

const compressDocumentFiles = async (files: File[]) =>
  Promise.all(
    files.map(async (file) => {
      if (!isCompressibleImage(file)) return file;

      try {
        const compressed = await imageCompression(file, compressionOptions);
        return new File([compressed], file.name, {
          type: compressed.type || file.type,
          lastModified: file.lastModified,
        });
      } catch (error: unknown) {
        console.error('Document image compression failed, uploading original file:', error);
        return file;
      }
    })
  );

const optionalTrimmed = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const toISODate = (value: string): string | undefined =>
  value ? new Date(`${value}T00:00:00`).toISOString() : undefined;

type FormSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

const FormSection: React.FC<FormSectionProps> = ({ title, description, action, children }) => (
  <Card className="border-border/70 bg-card">
    <CardContent className="space-y-5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold leading-none text-foreground">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </CardContent>
  </Card>
);

const SalesCreateInquiryView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(initialCustomerFormState);
  const [items, setItems] = useState<SalesInquiryDraftItem[]>([createBlankSalesInquiryItem()]);
  const [expandedClientId, setExpandedClientId] = useState<string>(items[0].clientId);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isNumberField = useMemo(() => new Set(['quantity', 'askingPrice']), []);
  const submitting = submitPhase !== 'idle';

  const handleCustomerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCustomerForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleItemChange = useCallback(
    (
      clientId: string,
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      const next = isNumberField.has(name) ? value.replace(/[^\d.]/g, '') : value;

      setItems((prev) =>
        prev.map((item) => (item.clientId === clientId ? { ...item, [name]: next } : item))
      );
    },
    [isNumberField]
  );

  const addItem = useCallback(() => {
    const nextItem = createBlankSalesInquiryItem();
    setItems((prev) => [...prev, nextItem]);
    setExpandedClientId(nextItem.clientId);
  }, []);

  const removeItem = useCallback(
    (clientId: string) => {
      if (items.length === 1) return;

      setItems((prev) => prev.filter((item) => item.clientId !== clientId));
      if (expandedClientId === clientId) {
        const nextExpanded = items.find((item) => item.clientId !== clientId)?.clientId;
        if (nextExpanded) setExpandedClientId(nextExpanded);
      }
    },
    [expandedClientId, items]
  );

  const validate = useCallback((): string | null => {
    if (!customerForm.companyName.trim()) return 'Company name is required';

    if (customerForm.contactEmail.trim() && !/^\S+@\S+\.\S+$/.test(customerForm.contactEmail.trim())) {
      return 'Contact email looks invalid';
    }

    if (items.length === 0) return 'At least one ingredient is required';

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item.productName.trim()) return `Ingredient ${index + 1}: product name is required`;

      const quantity = Number(item.quantity);
      if (!item.quantity.trim() || Number.isNaN(quantity) || quantity <= 0) {
        return `Ingredient ${index + 1}: valid quantity is required`;
      }
    }

    return null;
  }, [customerForm, items]);

  const buildPayload = useCallback((): CreateSalesInquiryRequest => {
    const itemPayloads = items.map(toCreateSalesInquiryItemPayload);

    return {
      companyName: customerForm.companyName.trim(),
      companyAddress: customerForm.companyAddress.trim() || 'Not provided',
      companyContactName: optionalTrimmed(customerForm.contactName),
      companyContactNumber: optionalTrimmed(customerForm.contactNumber),
      companyContactEmail: optionalTrimmed(customerForm.contactEmail),
      comments: optionalTrimmed(customerForm.comments),
      requestDate: toISODate(customerForm.requestDate),
      items: itemPayloads,
      salesRepId: authUser?.id,
    };
  }, [authUser?.id, customerForm, items]);

  const reset = useCallback(() => {
    const nextItem = createBlankSalesInquiryItem();
    setCustomerForm(initialCustomerFormState);
    setItems([nextItem]);
    setExpandedClientId(nextItem.clientId);
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles = files.filter((file) => {
      if (file.size <= maxUploadFileSizeBytes) return true;
      toast.error(`${file.name} exceeds 5MB limit`);
      return false;
    });

    setSelectedFiles(validFiles);
    if (validFiles.length !== files.length && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeSelectedFile = useCallback((indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const submitButtonLabel =
    submitPhase === 'creating'
      ? 'Creating Inquiry...'
      : submitPhase === 'uploading'
        ? 'Uploading Documents...'
        : 'Create Inquiry';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    try {
      setSubmitPhase('creating');

      const payload = buildPayload();
      const createdGroup = await createSalesInquiry(payload);

      if (selectedFiles.length > 0) {
        try {
          setSubmitPhase('uploading');
          const filesForUpload = await compressDocumentFiles(selectedFiles);
          await uploadDocuments({
            module: 'sales_inquiry_group',
            entityId: createdGroup.id,
            documentType: 'customer_coa',
            files: filesForUpload,
          });
        } catch (uploadError: unknown) {
          console.error('CreateInquiry document upload error:', uploadError);
          toast('Inquiry created, but document upload failed.', { icon: '!' });
          return;
        }
      }

      toast.success(
        selectedFiles.length > 0
          ? 'Inquiry created and documents uploaded'
          : 'Inquiry created and sent for admin review'
      );
      reset();
      clearSelectedFiles();
    } catch (error: unknown) {
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
      setSubmitPhase('idle');
    }
  };

  if (!authUser) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-card-foreground">
        Please log in to create an inquiry.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">Sales</p>
        <h2 className="text-3xl font-bold text-foreground">Create Inquiry</h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Capture client and ingredient requirements. This inquiry goes to admin for review and
          routing to purchase/production.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormSection
          title="Customer Information"
          description="Customer details and general inquiry requirements shared by all requested items."
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Company Name<span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={customerForm.companyName}
                  onChange={handleCustomerChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Request Date</label>
                <Input
                  type="date"
                  name="requestDate"
                  value={customerForm.requestDate}
                  onChange={handleCustomerChange}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground">Company Address</label>
                <Textarea
                  name="companyAddress"
                  value={customerForm.companyAddress}
                  onChange={handleCustomerChange}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Contact Name</label>
                <Input
                  type="text"
                  name="contactName"
                  value={customerForm.contactName}
                  onChange={handleCustomerChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Contact Number</label>
                <Input
                  type="tel"
                  name="contactNumber"
                  value={customerForm.contactNumber}
                  onChange={handleCustomerChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Contact Email</label>
                <Input
                  type="email"
                  name="contactEmail"
                  value={customerForm.contactEmail}
                  onChange={handleCustomerChange}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground">Comments / Notes</label>
                <Textarea
                  name="comments"
                  value={customerForm.comments}
                  onChange={handleCustomerChange}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
        </FormSection>

        <FormSection
          title="Requested Ingredients / Items"
          description="Add each ingredient as an item. Admin will route each item independently."
          action={
            <Button type="button" onClick={addItem} disabled={submitting} variant="outline" size="sm">
              <Plus size={16} />
                Add Ingredient
              </Button>
          }
        >
            <div className="space-y-2">
              {items.map((item, index) => {
                const expanded = expandedClientId === item.clientId;
                const summaryName = item.productName.trim() || 'New Ingredient';
                const quantitySummary = [item.quantity.trim(), item.quantityUnit.trim()]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={item.clientId}
                    className="overflow-hidden rounded-md border border-border/70 bg-background"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedClientId(expanded ? '' : item.clientId)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/40"
                    >
                      {expanded ? (
                        <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {summaryName}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{quantitySummary || 'Quantity not set'}</span>
                          <span>{item.requestType === 'sample' ? 'Sample' : 'Purchase'}</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-md border border-border/70 px-2 py-1 text-xs font-medium text-muted-foreground">
                        Item {index + 1}
                      </span>
                    </button>

                    {expanded ? (
                      <div className="space-y-4 border-t border-border/70 px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-foreground">
                              Product<span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              name="productName"
                              value={item.productName}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              placeholder="e.g. Chilli Powder"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground">
                              Request Type
                            </label>
                            <select
                              name="requestType"
                              value={item.requestType}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="purchase">Purchase</option>
                              <option value="sample">Sample</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground">
                              Quantity<span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              name="quantity"
                              inputMode="decimal"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground">Unit</label>
                            <Input
                              type="text"
                              name="quantityUnit"
                              value={item.quantityUnit}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              placeholder="kg, L, pcs..."
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground">Purity</label>
                            <Input
                              type="text"
                              name="purity"
                              value={item.purity}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              placeholder="e.g. 98%"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground">Grade</label>
                            <Input
                              type="text"
                              name="grade"
                              value={item.grade}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              placeholder="e.g. Pharma / Food"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground">
                              Asking Price
                            </label>
                            <Input
                              type="text"
                              name="askingPrice"
                              inputMode="decimal"
                              value={item.askingPrice}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              placeholder="Optional"
                              className="mt-1"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground">
                              Item Comments
                            </label>
                            <Textarea
                              name="comments"
                              value={item.comments}
                              onChange={(e) => handleItemChange(item.clientId, e)}
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          {items.length > 1 ? (
                            <Button
                              type="button"
                              onClick={() => removeItem(item.clientId)}
                              disabled={submitting}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 size={16} />
                              Remove
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
        </FormSection>

        <FormSection
          title="Customer Documents / COA"
          description="Upload customer COA, specifications, or requirement sheets after the inquiry is created."
          action={
            selectedFiles.length > 0 ? (
                <Button
                  type="button"
                  onClick={clearSelectedFiles}
                  disabled={submitting}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
            ) : null
          }
        >
            <label
              className={[
                'flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border/80 bg-background px-3 py-4 text-center transition hover:bg-muted/40',
                submitting ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/*"
                disabled={submitting}
                onChange={handleFileChange}
                className="sr-only"
              />
              <FileText size={22} className="mb-2 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Select documents</span>
              <span className="mt-1 text-xs text-muted-foreground">
                Files upload after the inquiry is created
              </span>
            </label>

            {selectedFiles.length > 0 ? (
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    <FileText size={14} className="shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <Button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      disabled={submitting}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={13} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
        </FormSection>

        <div className="flex justify-end rounded-md border border-border/70 bg-card p-4">
          <Button type="submit" disabled={submitting}>
            {submitButtonLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SalesCreateInquiryView;
