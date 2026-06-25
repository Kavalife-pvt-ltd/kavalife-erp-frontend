import React from 'react';
import clsx from 'clsx';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SalesInquiryGroup } from '@/types/sales';
import {
  formatGroupDate,
  getAdminActionCount,
  getGroupProgressSummary,
  getGroupTitle,
} from '@/utils/salesInquiryGroups';

type Props = {
  inquiry: SalesInquiryGroup;
  onClick?: () => void;
};

const SalesInquiryGroupCard: React.FC<Props> = ({ inquiry, onClick }) => {
  const Wrapper: React.ElementType = onClick ? 'button' : 'article';
  const itemCount = inquiry.items.length;
  const adminActionCount = getAdminActionCount(inquiry.items);

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
        <CardHeader className="p-5 pb-3">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Inquiry
          </p>
          <CardTitle className="mt-1 truncate text-xl leading-tight">
            {getGroupTitle(inquiry)}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 px-5 pb-5">
          <div>
            <p className="truncate font-semibold text-foreground">{inquiry.companyName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'ingredient' : 'ingredients'}
            </p>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {getGroupProgressSummary(inquiry.items)}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Created
              </p>
              <p className="text-foreground">{formatGroupDate(inquiry.requestDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Admin Action
              </p>
              <p className="text-foreground">{adminActionCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default SalesInquiryGroupCard;
