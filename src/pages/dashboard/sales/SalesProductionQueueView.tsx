import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';

import type { SalesPO } from '@/types/sales';
import { listSalesPO, updateSalesPOStatus } from '@/api/sales';
import SalesPOTicketModal from './SalesPOTicketModal';

const SalesProductionQueueView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { role?: string; department?: string };
  };

  const isAdmin = authUser?.role === 'admin';
  const canAccess = isAdmin || authUser?.department === 'production';

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

        const res = await listSalesPO({ sendTo: 'production' });
        if (!cancelled) setData(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load production queue';
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

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-stroke bg-foreground p-4 text-sm text-primaryText">
        You do not have access to Production Queue.
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
          <h2 className="text-sm font-semibold text-primaryText">Production Queue</h2>
          <span className="text-xs text-primaryText/70">{data.length} items</span>
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-stroke bg-foreground p-6 text-center text-sm text-primaryText/80">
            No tickets in production queue right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((po) => (
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

      {selectedPO && (
        <SalesPOTicketModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          maskCompany={!isAdmin}
          action={{
            title: 'Production Action',
            primaryLabel: 'Mark Completed & Send to Admin',
            submittingLabel: 'Submitting…',
            noteLabel: 'Completion Notes',
            notePlaceholder: 'Optional: what was done, ETA, remarks…',
            onSubmit: async ({ note }) => {
              const updated = await updateSalesPOStatus(selectedPO.id, {
                toStatus: 'production_completed',
                newComments: note,
              });

              // remove from queue after moving it out
              setData((prev) => prev.filter((p) => p.id !== updated.id));
            },
          }}
        />
      )}
    </>
  );
};

export default SalesProductionQueueView;
