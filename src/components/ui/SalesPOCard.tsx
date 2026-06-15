import React from 'react';
import type { SalesPO } from '@/types/sales';
import clsx from 'clsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesStatusBadge } from '@/components/sales/SalesDesign';

type Props = {
  po: SalesPO;
  maskCompany?: boolean;
  onClick?: () => void;
};

const isPOStage = (po: SalesPO) =>
  po.status === 'final_admin_approved' || po.status === 'closed' || !!po.poNumber;

const getTicketNumberLabel = (po: SalesPO) => {
  if (po.poNumber) return `PO #${po.poNumber}`;
  if (po.inquiryNumber) return `Inquiry #${po.inquiryNumber}`;
  return `#${po.id}`;
};

const SalesPOCard: React.FC<Props> = ({ po, maskCompany = false, onClick }) => {
  const isPO = isPOStage(po);

  const createdDate = po.requestDate ? new Date(po.requestDate).toLocaleDateString() : '';
  const dueDate = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
    : '';

  const companyName = maskCompany ? 'Confidential Client' : po.companyName;
  const companyAddress = maskCompany ? 'Hidden for this view' : po.companyAddress;

  const productName = po.productName?.trim() || '—';

  const Wrapper: React.ElementType = onClick ? 'button' : 'article';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={clsx(
        'block w-full text-left',
        onClick ? 'transition-transform hover:-translate-y-0.5' : ''
      )}
    >
      <Card className={clsx('h-full', onClick ? 'hover:border-primary/40 hover:shadow-md' : '')}>
        <CardHeader className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                {isPO ? 'Purchase Order' : 'Inquiry'}
              </p>
              <CardTitle className="mt-1 truncate text-xl leading-tight">
                {getTicketNumberLabel(po)}
              </CardTitle>
              <p className="mt-1 truncate text-sm text-muted-foreground">{productName}</p>
            </div>
            <SalesStatusBadge status={po.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-5 pb-5">
          <div className="rounded-md border bg-background p-4">
            <p className="font-medium text-foreground">{companyName}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{companyAddress}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Quantity
              </p>
              <p className="text-foreground">
                {po.quantity} {po.quantityUnit ?? ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Request Type
              </p>
              <p className="text-foreground">
                {po.requestType === 'sample' ? 'Sample' : 'Purchase'}
              </p>
            </div>
          </div>

          {isPO && po.askingPrice != null && (
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Asking Price
              </p>
              <p className="font-semibold text-foreground">
                ₹{Number(po.askingPrice).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {po.purchasePrice != null && (
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Purchase Price
              </p>
              <p className="font-semibold text-foreground">
                ₹{Number(po.purchasePrice).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {po.comments && (
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Comments
              </p>
              <p className="line-clamp-2 text-sm text-foreground">{po.comments}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 px-5 pb-5 text-xs text-muted-foreground">
          <span>{createdDate ? `Created: ${createdDate}` : 'Created: -'}</span>
          <span>{dueDate ? `Due: ${dueDate}` : 'Due: -'}</span>
        </CardFooter>
      </Card>
    </Wrapper>
  );
};

export default SalesPOCard;
