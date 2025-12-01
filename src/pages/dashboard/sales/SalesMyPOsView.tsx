// src/pages/dashboard/sales/SalesMyPOsView.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import type { SalesPO } from '@/types/sales';
import { listSalesPO } from '@/api/sales';

const SalesMyPOsView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [pos, setPos] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;

    const fetchPOs = async () => {
      try {
        setLoading(true);
        setError(null);

        const role = (authUser.role || 'sales') as 'admin' | 'sales' | 'purchase' | 'production';

        let data: SalesPO[];

        if (role === 'admin') {
          // admin sees all
          data = await listSalesPO();
        } else {
          // sales sees only their POs
          const rawId = (authUser as { id?: number | string }).id;
          const salesRepId = typeof rawId === 'string' ? Number(rawId) : Number(rawId ?? 0);

          data = await listSalesPO({ salesRepId });
        }

        const sorted = [...data].sort((a, b) => {
          const aTime = new Date(a.createdAt ?? a.requestDate).getTime();
          const bTime = new Date(b.createdAt ?? b.requestDate).getTime();
          return bTime - aTime;
        });

        setPos(sorted);
      } catch (error: unknown) {
        console.error('Failed to fetch My POs', error);

        let message = 'Failed to load POs';

        if (axios.isAxiosError(error)) {
          const respData = error.response?.data as { error?: string; message?: string } | undefined;

          message = respData?.error ?? respData?.message ?? error.message ?? message;
        } else if (error instanceof Error) {
          message = error.message || message;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchPOs();
  }, [authUser]);

  if (!authUser) {
    return <div className="text-sm text-slate-500">You must be logged in to view your POs.</div>;
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
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (pos.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No POs found yet. Create a new PO from the <b>Create PO</b> tab.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pos.map((po) => (
        <SalesPOCard
          key={po.id}
          po={po}
          onClick={() => {
            // later: open detail modal or navigate to /sales/:id
            console.log('Clicked PO', po.id);
          }}
        />
      ))}
    </div>
  );
};

export default SalesMyPOsView;
