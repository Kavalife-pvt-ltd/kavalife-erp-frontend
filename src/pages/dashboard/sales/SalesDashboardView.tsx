// src/pages/dashboard/SalesDashboardView.tsx
import React from 'react';

import { SalesPageHeader } from '@/components/sales/SalesDesign';
import { Card, CardContent } from '@/components/ui/card';

const SalesDashboardView: React.FC = () => {
  const kpis = [
    'Total POs (This Month)',
    'Pending Admin Approval',
    'Under Purchase',
    'Under Production',
  ];

  return (
    <div className="flex flex-col gap-6">
      <SalesPageHeader
        title="Sales Dashboard"
        description="Track inquiries, purchase orders, queue movement, and fulfillment handoffs."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((label) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">-</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Charts and recent activity will go here.
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboardView;
