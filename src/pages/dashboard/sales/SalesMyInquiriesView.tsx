// src/pages/dashboard/sales/SalesMyInquiriesView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesInquiryGroupCard from '@/components/ui/SalesInquiryGroupCard';
import {
  SalesEmptyState,
  SalesFilterButton,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
} from '@/components/sales/SalesDesign';
import { listSalesInquiries } from '@/api/sales';
import type { SalesInquiryGroup } from '@/types/sales';
import SalesInquiryGroupModal from './SalesInquiryGroupModal';

type FilterId = 'all' | 'active' | 'rejected' | 'done';

const SalesMyInquiriesView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string };
  };

  const [groups, setGroups] = useState<SalesInquiryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SalesInquiryGroup | null>(null);
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

        const data = await listSalesInquiries({ salesRepId: userId });

        if (!cancelled) setGroups(Array.isArray(data) ? data : []);
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
    if (filter === 'all') return groups;

    if (filter === 'rejected') {
      return groups.filter((group) =>
        group.items.some((item) => item.status === 'admin_rejected' || item.status === 'client_rejected')
      );
    }

    if (filter === 'done') {
      return groups.filter(
        (group) =>
          group.items.length > 0 &&
          group.items.every((item) =>
            ['final_admin_approved', 'closed'].includes(item.status as string)
          )
      );
    }

    return groups.filter((group) =>
      group.items.some(
        (item) =>
          !['final_admin_approved', 'closed', 'admin_rejected', 'client_rejected'].includes(
            item.status as string
          )
      )
    );
  }, [groups, filter]);

  if (!authUser) {
    return <SalesMessageCard>Please log in to view your inquiries.</SalesMessageCard>;
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
          title="My Inquiries"
          description="Track your grouped customer inquiries as each ingredient moves through admin, purchase, and production."
          meta={
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'inquiry' : 'inquiries'}
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
                <SalesFilterButton
                  key={t.id}
                  active={filter === t.id}
                  onClick={() => setFilter(t.id)}
                >
                  {t.label}
                </SalesFilterButton>
              ))}
            </div>
          }
        />

        <SalesSectionHeader title="Inquiry list" count={filtered.length} countLabel="groups" />

        {filtered.length === 0 ? (
          <SalesEmptyState description="Nothing here yet. Create an inquiry and it will show up as one grouped card with item-level progress." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((group) => (
              <SalesInquiryGroupCard
                key={group.id}
                inquiry={group}
                onClick={() => setSelectedGroup(group)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedGroup ? (
        <SalesInquiryGroupModal
          inquiry={selectedGroup}
          mode="sales"
          onClose={() => setSelectedGroup(null)}
        />
      ) : null}
    </>
  );
};

export default SalesMyInquiriesView;
