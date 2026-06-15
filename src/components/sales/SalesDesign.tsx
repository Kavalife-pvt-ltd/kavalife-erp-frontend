import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SalesPOStatus } from '@/types/sales';
import { cn } from '@/lib/utils';
import { prettyStatus } from '@/utils/salesStatus';

type SalesPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
};

export function SalesPageHeader({
  eyebrow = 'Sales',
  title,
  description,
  action,
  meta,
}: SalesPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            {eyebrow}
          </p>
          {meta}
        </div>
        <h2 className="mt-2 text-3xl font-bold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-col gap-2 sm:flex-row">{action}</div> : null}
    </div>
  );
}

type SalesSectionHeaderProps = {
  title: string;
  count?: number | string;
  countLabel?: string;
  action?: ReactNode;
};

export function SalesSectionHeader({ title, count, countLabel, action }: SalesSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {count !== undefined ? (
          <p className="text-xs text-muted-foreground">
            {count} {countLabel ?? 'items'}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type SalesMessageCardProps = {
  children: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
};

export function SalesMessageCard({ children, tone = 'default', className }: SalesMessageCardProps) {
  return (
    <Card className={cn(tone === 'danger' && 'border-destructive/40', className)}>
      <CardContent
        className={cn('p-4 text-sm', tone === 'danger' ? 'text-destructive' : 'text-foreground')}
      >
        {children}
      </CardContent>
    </Card>
  );
}

type SalesEmptyStateProps = {
  title?: string;
  description: string;
};

export function SalesEmptyState({ title = 'No records found', description }: SalesEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-xl font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

type SalesPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SalesPanel({ title, children, className }: SalesPanelProps) {
  return (
    <Card className={className}>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={title ? undefined : 'p-6'}>{children}</CardContent>
    </Card>
  );
}

const statusClassName: Partial<Record<SalesPOStatus, string>> = {
  quote_requested: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
  quote_admin_approved: 'bg-emerald-600 text-white',
  quote_sent_to_client: 'bg-primary text-primary-foreground',
  client_negotiation: 'bg-indigo-600 text-white',
  client_approved: 'bg-emerald-600 text-white',
  client_rejected: 'bg-destructive text-destructive-foreground',
  final_admin_approved: 'bg-emerald-600 text-white',
  routed_to_purchase: 'bg-sky-600 text-white',
  purchase_priced: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
  purchase_approved: 'bg-emerald-600 text-white',
  purchase_completed: 'bg-emerald-600 text-white',
  routed_to_production: 'bg-purple-600 text-white',
  production_completed: 'bg-emerald-600 text-white',
  admin_rejected: 'bg-destructive text-destructive-foreground',
  cancelled: 'border-muted-foreground/40 text-muted-foreground',
  closed: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300',
};

export function SalesStatusBadge({ status }: { status: SalesPOStatus }) {
  return (
    <Badge variant="outline" className={statusClassName[status]}>
      {prettyStatus(status)}
    </Badge>
  );
}

type FilterButtonProps = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
};

export function SalesFilterButton({ active, children, onClick }: FilterButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      className="rounded-full"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
