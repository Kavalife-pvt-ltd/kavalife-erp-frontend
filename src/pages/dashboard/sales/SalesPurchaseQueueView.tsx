import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';

import type { SalesPO } from '@/types/sales';
import { listSalesPO, updateSalesPOStatus } from '@/api/sales';
import SalesPOTicketModal from './SalesPOTicketModal';

const SalesPurchaseQueueView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { role?: string; department?: string };
  };

  const isAdmin = authUser?.role === 'admin';
  const canAccess = isAdmin || authUser?.department === 'purchase';

  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  useEffect(() => {
    if (!canAccess) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // queue = sendTo=purchase
        const res = await listSalesPO({ sendTo: 'purchase' });
        if (!cancelled) setData(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load purchase queue';
        if (axios.isAxiosError(err)) {
          const d = err.response?.data as
            | { error?: string; message?: string; details?: string }
            | undefined;
          message = d?.details ?? d?.error ?? d?.message ?? err.message ?? message;
        } else if (err instanceof Error) {
          message = err.message || message;
        }
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [canAccess]);

  // optional: split those that already have price vs need pricing
  const { needsPricing, priced } = useMemo(() => {
    const a: SalesPO[] = [];
    const b: SalesPO[] = [];
    for (const po of data) {
      if (po.askingPrice === null || po.askingPrice === undefined) a.push(po);
      else b.push(po);
    }
    return { needsPricing: a, priced: b };
  }, [data]);

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        You do not have access to Purchase Queue.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primaryText">Purchase Queue</h2>
          <span className="text-xs text-primaryText/70">{data.length} items</span>
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            No tickets in purchase queue right now.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Needs pricing */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-primaryText/80">Needs pricing</p>
                <span className="text-[11px] text-primaryText/60">{needsPricing.length}</span>
              </div>
              {needsPricing.length === 0 ? (
                <div className="rounded-lg border border-stroke bg-foreground p-4 text-xs text-primaryText/70">
                  Nothing pending pricing.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {needsPricing.map((po) => (
                    <SalesPOCard
                      key={po.id}
                      po={po}
                      onClick={() => setSelectedPO(po)}
                      maskCompany={!isAdmin}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Already priced (still in purchase queue) */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-primaryText/80">Already priced</p>
                <span className="text-[11px] text-primaryText/60">{priced.length}</span>
              </div>
              {priced.length === 0 ? (
                <div className="rounded-lg border border-stroke bg-foreground p-4 text-xs text-primaryText/70">
                  No priced tickets here.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {priced.map((po) => (
                    <SalesPOCard
                      key={po.id}
                      po={po}
                      onClick={() => setSelectedPO(po)}
                      maskCompany={!isAdmin}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedPO && (
        <SalesPOTicketModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          maskCompany={!isAdmin}
          action={{
            title: 'Purchase Action',
            primaryLabel: 'Submit Price & Send to Admin',
            submittingLabel: 'Submitting…',
            noteLabel: 'Purchase Notes',
            notePlaceholder: 'Optional: supplier info, assumptions, lead time, remarks…',
            renderExtraFields: ({ setField }) => {
              return (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      defaultValue={
                        selectedPO.askingPrice !== null && selectedPO.askingPrice !== undefined
                          ? Number(selectedPO.askingPrice)
                          : undefined
                      }
                      onChange={(e) => setField('price', e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-background p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                      placeholder="Enter final purchase price"
                      required
                    />
                  </div>

                  {/* Optional: delivery code later */}
                  {/* <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-primaryText/60">
                      Delivery Code
                    </label>
                    <input
                      type="text"
                      onChange={(e) => setField('deliveryCode', e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-background p-2 text-xs text-primaryText outline-none focus:ring-1 focus:ring-accent"
                      placeholder="Optional"
                    />
                  </div> */}
                </div>
              );
            },
            onSubmit: async ({ note, fields }) => {
              const raw = String(fields.price ?? '').trim();
              const price = Number(raw);

              if (!raw || Number.isNaN(price) || price <= 0) {
                throw new Error('Please enter a valid price.');
              }

              const updated = await updateSalesPOStatus(selectedPO.id, {
                toStatus: 'purchase_priced',
                newAskingPrice: price,
                newComments: note,
                sendTo: 'admin',
              });

              setData((prev) => prev.filter((p) => p.id !== updated.id));
            },
          }}
        />
      )}
    </>
  );
};

export default SalesPurchaseQueueView;
