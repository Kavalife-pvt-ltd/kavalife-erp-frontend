import { cn } from '@/utils/utils';

interface VIRCardProps {
  id: number;
  vendorId: string;
  productId: string;
  status: 'pending verification' | 'verified';
  remarks: string;
  imageUrl?: string;
  checklist?: Record<string, 'yes' | 'no' | 'na'>;
  createdAt?: string;
  className?: string;
  verifiedBy?: string;
}

const statusColorMap: Record<VIRCardProps['status'], string> = {
  'pending verification': 'bg-yellow-500',
  verified: 'bg-blue-500',
};

export const VIRCard = ({
  id,
  createdAt,
  vendorId,
  productId,
  className,
  verifiedBy,
  imageUrl,
}: VIRCardProps) => {
  const status = verifiedBy ? 'verified' : 'pending verification';
  return (
    <div
      className={cn(
        'w-full flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-border transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex-shrink-0">
        <img src={imageUrl} alt={vendorId} className="w-20 h-20 object-cover rounded-md border" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {vendorId} — {productId}
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
          <span className="text-foreground">Date:</span>{' '}
          {createdAt ? new Date(createdAt).toDateString() : ''}
        </p>
      </div>
    </div>
  );
};
