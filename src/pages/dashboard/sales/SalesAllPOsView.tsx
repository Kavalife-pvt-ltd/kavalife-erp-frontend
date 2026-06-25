import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesInquiryGroupCard from '@/components/ui/SalesInquiryGroupCard';
import {
  SalesEmptyState,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
} from '@/components/sales/SalesDesign';
import type { SalesInquiryGroup } from '@/types/sales';
import { listSalesInquiries } from '@/api/sales';
import SalesInquiryGroupModal from './SalesInquiryGroupModal';

const SalesAllPOsView: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { id?: number; role?: string; department?: string };
  };

  const [groups, setGroups] = useState<SalesInquiryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SalesInquiryGroup | null>(null);

  const role = authUser?.role ?? 'sales';

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      setError('Please log in to view inquiries.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await listSalesInquiries();
        if (!cancelled) setGroups(res);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = 'Failed to load all inquiries';

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
    return <SalesMessageCard>Please log in to view inquiries.</SalesMessageCard>;
  }

  if (role !== 'admin') {
    return (
      <SalesMessageCard>
        You do not have permission to access All Inquiries. This view is only available to admins.
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
          description="Read-only admin view of every sales inquiry grouped by request."
          meta={
            <span className="text-sm text-muted-foreground">
              {groups.length} {groups.length === 1 ? 'inquiry' : 'inquiries'}
            </span>
          }
        />

        <SalesSectionHeader title="All inquiry groups" count={groups.length} />

        {groups.length === 0 ? (
          <SalesEmptyState description="No inquiries found." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
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
          mode="admin"
          onClose={() => setSelectedGroup(null)}
        />
      ) : null}
    </>
  );
};

export default SalesAllPOsView;
