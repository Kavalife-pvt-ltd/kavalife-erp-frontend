import { useState } from 'react';
import { cn } from '@/utils/utils';

interface VIRCardProps {
  id: number;
  createdAt: string;
  vendor: string;
  product: string;
  status: 'pending verification' | 'verified';
  remarks: string;
  doneBy?: string;
  checkedBy?: string;
  className?: string;
  imageUrl?: string;
}

const statusColorMap: Record<VIRCardProps['status'], string> = {
  'pending verification': 'bg-yellow-500',
  verified: 'bg-blue-500',
};

export const VIRCard = ({
  id,
  createdAt,
  vendor,
  product,
  status,
  remarks,
  doneBy,
  checkedBy,
  className,
  imageUrl,
}: VIRCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'w-full flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-border transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex-shrink-0">
        <img src={imageUrl} alt={vendor} className="w-20 h-20 object-cover rounded-md border" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {vendor} — {product}
          </h3>
          <span
            className={cn(
              'mt-2 sm:mt-0 px-2 py-1 rounded text-xs font-medium text-white capitalize',
              statusColorMap[status]
            )}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-foreground">VIR No: {id}</p>
        <p className="text-sm">
          <span className="text-foreground">Date:</span> {new Date(createdAt).toDateString()}
        </p>

        {showDetails && (
          <div className="space-y-1 text-sm text-muted">
            <p>
              <span className="font-medium text-foreground">Remarks:</span> {remarks}
            </p>
            <p>
              <span className="font-medium text-foreground">Done By:</span> {doneBy}
            </p>
            <p>
              <span className="font-medium text-foreground">Checked By:</span> {checkedBy}
            </p>
          </div>
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
