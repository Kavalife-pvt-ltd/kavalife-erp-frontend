// components/ui/GRNCard.tsx
import { useState } from 'react';
import { cn } from '@/utils/utils';

interface GRNCardProps {
  id: number;
  createdAt: string;
  vendor: string;
  product: string;
  status: 'pending' | 'in-progress' | 'completed';
  quantity: number;
  containerQuantity: number;
  batchNo: number;
  invoice: number;
  invoiceDate: string;
  invoiceImg: string;
  doneBy?: string;
  checkedBy?: string;
  className?: string;
}

const statusColorMap: Record<GRNCardProps['status'], string> = {
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
};

export const GRNCard = ({
  createdAt,
  vendor,
  product,
  status,
  quantity,
  containerQuantity,
  batchNo,
  invoice,
  invoiceDate,
  invoiceImg,
  doneBy,
  checkedBy,
  className,
}: GRNCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'w-full flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-border',
        className
      )}
    >
      <div className="flex-1 space-y-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {vendor} — {product}
          </h3>
          <span
            className={cn(
              'mt-1 md:mt-0 px-2 py-1 rounded text-xs font-medium text-white self-start md:self-auto',
              statusColorMap[status]
            )}
          >
            {status}
          </span>
        </div>

        <p className="text-sm text-muted">Date: {createdAt}</p>
        <p className="text-sm text-muted">
          Quantity: {quantity} | Containers: {containerQuantity}
        </p>

        {showDetails && (
          <>
            <p className="text-sm text-muted">Batch No: {batchNo}</p>
            <p className="text-sm text-muted">Invoice: {invoice}</p>
            <p className="text-sm text-muted">Invoice Date: {invoiceDate}</p>
            <p className="text-sm text-muted">Done By: {doneBy}</p>
            <p className="text-sm text-muted">Checked By: {checkedBy}</p>
            {invoiceImg && (
              <div className="mt-2">
                <p className="text-sm text-muted">Invoice Image:</p>
                <img src={invoiceImg} alt="Invoice" className="w-32 h-auto border rounded mt-1" />
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className="mt-2 text-sm text-accent underline hover:opacity-80"
        >
          {showDetails ? 'Hide details' : 'View details'}
        </button>
      </div>
    </div>
  );
};
