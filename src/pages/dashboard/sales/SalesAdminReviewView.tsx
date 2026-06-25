import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';
import SalesInquiryGroupCard from '@/components/ui/SalesInquiryGroupCard';
import { Button } from '@/components/ui/button';
import {
  SalesEmptyState,
  SalesMessageCard,
  SalesPageHeader,
  SalesSectionHeader,
} from '@/components/sales/SalesDesign';
import type { SalesInquiryGroup, SalesPO } from '@/types/sales';
import { getSalesInquiry, listSalesInquiries, updateSalesPOStatus } from '@/api/sales';
import SalesInquiryGroupModal from './SalesInquiryGroupModal';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as
      | { error?: string; message?: string; details?: string }
      | undefined;
    return d?.error ?? d?.message ?? d?.details ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
};

const SalesAdminReviewView: React.FC = () => {
  const { authUser } = useAuthContext();
  const [groups, setGroups] = useState<SalesInquiryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SalesInquiryGroup | null>(null);

  const role = (authUser?.role as string | undefined) ?? 'sales';

  const loadGroups = async () => {
    const adminGroups = await listSalesInquiries({ sendTo: 'admin' });
    const fullGroups = await Promise.all(adminGroups.map((group) => getSalesInquiry(group.id)));
    setGroups(fullGroups);
  };

  const refresh = async () => {
    try {
      setError(null);
      await loadGroups();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to refresh admin queue'));
    }
  };

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
        const adminGroups = await listSalesInquiries({ sendTo: 'admin' });
        const fullGroups = await Promise.all(adminGroups.map((group) => getSalesInquiry(group.id)));
        if (!cancelled) setGroups(fullGroups);
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load admin queue'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const handleItemAction = async (
    item: SalesPO,
    payload: Parameters<typeof updateSalesPOStatus>[1]
  ) => {
    const updated = await updateSalesPOStatus(item.id, payload);
    const fullGroup = selectedGroup ? await getSalesInquiry(selectedGroup.id) : null;

    setGroups((prev) => {
      const next = prev.map((group) =>
        fullGroup && group.id === fullGroup.id
          ? fullGroup
          : {
              ...group,
              items: group.items.map((groupItem) =>
                groupItem.id === updated.id ? updated : groupItem
              ),
            }
      );

      return next.filter((group) => group.items.some((groupItem) => groupItem.sendTo === 'admin'));
    });

    if (fullGroup) {
      setSelectedGroup(fullGroup);
    }

    toast.success('Item updated');
  };

  if (!authUser) {
    return <SalesMessageCard>Please log in to view POs.</SalesMessageCard>;
  }

  if (role !== 'admin') {
    return <SalesMessageCard>You do not have permission to access Admin Review.</SalesMessageCard>;
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
      <div className="flex h-full flex-col gap-5">
        <SalesPageHeader
          title="Admin Queue"
          description="Review customer inquiries, route individual ingredients, approve pricing, and perform final approvals."
          action={
            <Button type="button" onClick={() => void refresh()} variant="outline" size="sm">
              Refresh
            </Button>
          }
        />

        <section className="space-y-3">
          <SalesSectionHeader title="Inquiry Groups" count={groups.length} countLabel="pending" />

          {groups.length === 0 ? (
            <SalesEmptyState description="No inquiry groups need admin review." />
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
        </section>
      </div>

      {selectedGroup ? (
        <SalesInquiryGroupModal
          inquiry={selectedGroup}
          mode="admin"
          onClose={() => setSelectedGroup(null)}
          onItemAction={handleItemAction}
        />
      ) : null}
    </>
  );
};

export default SalesAdminReviewView;
