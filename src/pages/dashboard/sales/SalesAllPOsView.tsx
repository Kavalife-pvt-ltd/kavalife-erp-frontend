// src/pages/dashboard/sales/SalesAllPOsView.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import {
  SalesEmptyState,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
} from '@/components/sales/SalesDesign';
import type { SalesPO } from '@/types/sales';
import { listSalesPO } from '@/api/sales';
import SalesPOTicketModal from './SalesPOTicketModal';

const SalesAllPOsView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string; department?: string };
  };

  const [data, setData] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);

  const role = authUser?.role ?? 'sales';

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      setError('Please log in to view POs.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await listSalesPO(); // no filters → all POs
        if (!cancelled) setData(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load all POs';

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
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  if (!authUser) {
    return <SalesMessageCard>Please log in to view POs.</SalesMessageCard>;
  }

  if (role !== 'admin') {
    return (
      <SalesMessageCard>
        You do not have permission to access All POs. This view is only available to admins.
      </SalesMessageCard>
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
    return <SalesMessageCard>{error}</SalesMessageCard>;
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <SalesPageHeader
          title="All Inquiries"
          description="Read-only admin view of every sales inquiry and purchase order."
          meta={<span className="text-sm text-muted-foreground">{data.length} total</span>}
        />

        <SalesSectionHeader title="All records" count={data.length} />

        {data.length === 0 ? (
          <SalesEmptyState description="No POs found." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((po) => (
              <SalesPOCard key={po.id} po={po} onClick={() => setSelectedPO(po)} />
            ))}
          </div>
        )}
      </div>

      {selectedPO && (
        <SalesPOTicketModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          viewerRole="admin"
        />
      )}
    </>
  );
};

export default SalesAllPOsView;
