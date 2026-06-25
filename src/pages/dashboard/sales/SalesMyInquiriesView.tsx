// src/pages/dashboard/sales/SalesMyInquiriesView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesPOCard from '@/components/ui/SalesPOCard';
import {
  SalesEmptyState,
  SalesFilterButton,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
} from '@/components/sales/SalesDesign';
import { listSalesPO } from '@/api/sales';
import type { SalesPO } from '@/types/sales';
import SalesPOTicketModal from './SalesPOTicketModal';

type FilterId = 'all' | 'active' | 'rejected' | 'done';

const SalesMyInquiriesView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string };
  };

  const [items, setItems] = useState<SalesPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<SalesPO | null>(null);
  const [filter, setFilter] = useState<FilterId>('all');

  const userId = authUser?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No logged-in user found. Please log in again.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ My Inquiries = everything created by me (regardless of send_to)
        const data = await listSalesPO({ salesRepId: userId });

        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load inquiries';
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
  }, [userId]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;

    if (filter === 'rejected') {
      return items.filter(
        (po) => po.status === 'admin_rejected' || po.status === 'client_rejected'
      );
    }

    if (filter === 'done') {
      return items.filter((po) => po.status === 'final_admin_approved' || po.status === 'closed');
    }

    // active = everything else (still moving through the pipeline)
    return items.filter(
      (po) =>
        !['final_admin_approved', 'closed', 'admin_rejected', 'client_rejected'].includes(
          po.status as string
        )
    );
  }, [items, filter]);

  if (!authUser) {
    return (
      <SalesMessageCard>Please log in to view your inquiries.</SalesMessageCard>
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
      <SalesMessageCard>{error}</SalesMessageCard>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <SalesPageHeader
          title="My Inquiries"
          description="Track your sales inquiries as they move through admin, purchase, and production."
          meta={
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          }
          action={
            <div className="flex items-center gap-2">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'rejected', label: 'Returned' },
                { id: 'done', label: 'Done' },
              ] as const
            ).map((t) => (
              <SalesFilterButton key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
                {t.label}
              </SalesFilterButton>
            ))}
            </div>
          }
        />

        <SalesSectionHeader title="Inquiry list" count={filtered.length} />

        {filtered.length === 0 ? (
          <SalesEmptyState description="Nothing here yet. Create an inquiry and it will show up immediately, even while it is with admin, purchase, or production." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((po) => (
              <SalesPOCard key={po.id} po={po} onClick={() => setSelectedPO(po)} />
            ))}
          </div>
        )}
      </div>

      {selectedPO && (
        <SalesPOTicketModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          viewerRole="sales"
        />
      )}
    </>
  );
};

export default SalesMyInquiriesView;
