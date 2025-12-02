// src/pages/dashboard/sales/SalesMyPOsView.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/hooks/useAuthContext';
import { listSalesPO } from '@/api/sales';
import type { SalesPO } from '@/types/sales';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';

const SalesMyPOsView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      setError('authUser not found. Please log in again.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await listSalesPO({ salesRepId: authUser.id });

        if (!cancelled) {
          setData(res);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load your POs';

        if (axios.isAxiosError(err)) {
          const d = err.response?.data as
            | { error?: string; message?: string; details?: string }
            | undefined;
          message = d?.error ?? d?.message ?? d?.details ?? err.message ?? message;
        } else if (err instanceof Error) {
          message = err.message || message;
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  if (!authUser) {
    return (
      <div className="rounded-xl border border-stroke bg-background p-4 text-sm text-primaryText">
        Please log in to view your POs.
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
      <div className="rounded-xl border border-stroke bg-background p-4 text-sm text-primaryText">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-stroke bg-background p-6 text-center text-sm text-primaryText/80">
        No POs created by you yet. Use the <span className="font-medium">Create PO</span> tab to
        raise a new request.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primaryText">My POs</h2>
        <span className="text-xs text-primaryText/70">{data.length} total</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.map((po) => (
          <SalesPOCard
            key={po.id}
            po={po}
            // later we can add onClick to open details drawer
          />
        ))}
      </div>
    </div>
  );
};

export default SalesMyPOsView;
