// src/components/ui/VIRCard.tsx
import { useBootstrapStore } from '@/store/bootstrap';
import { cn } from '@/utils/utils';

interface VIRCardProps {
  id: number;
  vir_number?: string; // NEW
  vendorId: string;
  productId: string;
  status: string;
  remarks: string;
  imageUrl?: string;
  checklist?: Record<string, 'yes' | 'no' | 'na'>;
  createdAt?: string;
  className?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

const statusColorMap: Record<VIRCardProps['status'], string> = {
  'pending verification': 'bg-yellow-500',
  verified: 'bg-blue-500',
};

export const VIRCard = ({
  id,
  vir_number,
  createdAt,
  vendorId,
  productId,
  className,
  verifiedBy,
  verifiedAt,
  imageUrl,
  status,
}: VIRCardProps) => {
  const usersById = useBootstrapStore((s) => s.userById);
  let verifiedByDisplay: string | undefined;
  if (verifiedBy !== undefined) {
    const vbNum = typeof verifiedBy === 'number' ? verifiedBy : Number(verifiedBy);
    verifiedByDisplay =
      (Number.isFinite(vbNum) && usersById[vbNum]?.username) || String(verifiedBy);
  }

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
        <p className="text-sm text-foreground">VIR No: {vir_number ?? id}</p>
        <p className="text-sm">
          <span className="text-foreground">Date:</span>{' '}
          {createdAt ? new Date(createdAt).toDateString() : ''}
        </p>
        {verifiedBy && (
          <p className="text-xs text-foreground/70">
            Verified By: <span className="font-medium">{verifiedByDisplay}</span> Verified At:{' '}
            <span className="font-medium">
              {verifiedAt ? new Date(verifiedAt).toDateString() : ''}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
