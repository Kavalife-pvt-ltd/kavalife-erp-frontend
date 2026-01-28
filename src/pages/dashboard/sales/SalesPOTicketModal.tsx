import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { Loader } from '@/components/ui/Loader';
import type { SalesPO, SalesPOStatusLog } from '@/types/sales';
import { getSalesPOStatusLog } from '@/api/sales';

type TimelineEntry = {
  id: number;
  label: string;
  at: string;
  note?: string | null;
};

export type SalesPOTicketActionConfig = {
  title: string;
  primaryLabel: string;
  submittingLabel?: string;

  // optional note box
  noteLabel?: string;
  notePlaceholder?: string;

  // render extra fields like pricing, delivery code, etc.
  renderExtraFields?: (args: {
    setField: (key: string, value: unknown) => void;
    fields: Record<string, unknown>;
  }) => React.ReactNode;

  // called on submit; return updated PO (or just void and parent refetches)
  onSubmit: (args: { note?: string; fields: Record<string, unknown> }) => Promise<void>;
};

type Props = {
  po: SalesPO;
  onClose: () => void;

  // masking support
  maskCompany?: boolean;

  // optional action section
  action?: SalesPOTicketActionConfig;
};

const SalesPOTicketModal: React.FC<Props> = ({ po, onClose, maskCompany = false, action }) => {
  const [logs, setLogs] = useState<SalesPOStatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (key: string, value: unknown) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadingLogs(true);
        setLogError(null);
        const data = await getSalesPOStatusLog(po.id);
        if (!cancelled) setLogs(data);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load status history';
        if (axios.isAxiosError(err)) {
          const d = err.response?.data as
            | { error?: string; message?: string; details?: string }
            | undefined;
          message = d?.details ?? d?.error ?? d?.message ?? err.message ?? message;
        } else if (err instanceof Error) {
          message = err.message || message;
        }

        setLogError(message);
      } finally {
        if (!cancelled) setLoadingLogs(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [po.id]);

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleString() : '—';
  const expectedDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '—';

  const companyName = maskCompany ? 'Confidential Client' : po.companyName;
  const companyAddress = maskCompany ? 'Hidden for this view' : po.companyAddress;

  const timeline: TimelineEntry[] = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        label: `${log.fromStatus ? `${log.fromStatus} → ` : ''}${log.toStatus}`,
        at: new Date(log.changedAt).toLocaleString(),
        note: log.note ?? undefined,
      })),
    [logs]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await action.onSubmit({ note: note || undefined, fields });
      onClose();
    } catch (err: unknown) {
      let message = 'Failed to update ticket';
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | { error?: string; message?: string; details?: string }
          | undefined;
        message = d?.details ?? d?.error ?? d?.message ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-3xl rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-primaryText">
              Ticket Details – {po.poNumber ?? `#${po.id}`}
            </h2>
            <p className="text-xs text-primaryText/70">
              {companyName} • {po.quantity} {po.quantityUnit ?? ''}{' '}
              {po.purity ? `• ${po.purity}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-primaryText/60 hover:text-primaryText"
          >
            ✕
          </button>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {/* left details */}
          <section className="space-y-2 text-xs text-primaryText">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                Company
              </p>
              <p className="font-medium">{companyName}</p>
              <p className="whitespace-pre-line text-primaryText/70">{companyAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Created</p>
                <p>{createdDate}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">
                  Expected Delivery
                </p>
                <p>{expectedDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Status</p>
                <p>{po.status}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Send To</p>
                <p>{po.sendTo ?? '—'}</p>
              </div>
            </div>

            {po.askingPrice !== undefined && po.askingPrice !== null && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Price</p>
                <p>₹{Number(po.askingPrice).toLocaleString('en-IN')}</p>
              </div>
            )}

            {po.comments && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primaryText/60">Comments</p>
                <p className="whitespace-pre-line text-primaryText/80">{po.comments}</p>
              </div>
            )}

            {po.rejectionReason && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-red-500">Rejection</p>
                <p className="whitespace-pre-line text-red-500/90">{po.rejectionReason}</p>
              </div>
            )}
          </section>

          {/* right history */}
          <section className="text-xs text-primaryText">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primaryText/60">
              Status History
            </p>

            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-stroke bg-background p-2">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader />
                </div>
              ) : logError ? (
                <p className="text-xs text-red-500">{logError}</p>
              ) : timeline.length === 0 ? (
                <p className="text-[11px] text-primaryText/60">No status changes logged yet.</p>
              ) : (
                <>
                  <div className="rounded-md bg-foreground/40 p-1.5">
                    <div className="text-[11px] font-semibold">Created</div>
                    <div className="text-[11px] text-primaryText/60">{createdDate}</div>
                  </div>

                  {timeline.map((item) => (
                    <div key={item.id} className="rounded-md bg-foreground/40 p-1.5">
                      <div className="text-[11px] font-semibold">{item.label}</div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] text-primaryText/60">{item.at}</span>
                      </div>
                      {item.note ? (
                        <p className="mt-0.5 whitespace-pre-line text-[11px] text-primaryText/70">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>

        {/* action section */}
        {action ? (
          <form onSubmit={handleSubmit} className="mt-4 border-t border-stroke pt-3">
            <div className="mb-2 text-xs font-semibold text-primaryText">{action.title}</div>

            <div className="space-y-2">
              {action.renderExtraFields?.({ setField, fields })}

              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                  {action.noteLabel ?? 'Notes'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-background p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                  placeholder={action.notePlaceholder ?? 'Optional note…'}
                />
              </div>

              {submitError ? <p className="text-xs text-red-500">{submitError}</p> : null}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-stroke bg-background px-3 py-1 text-xs text-primaryText hover:bg-stroke/40"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? (action.submittingLabel ?? 'Submitting…') : action.primaryLabel}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <footer className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stroke bg-background px-3 py-1 text-xs text-primaryText hover:bg-stroke/40"
            >
              Close
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default SalesPOTicketModal;
