import { cn } from '@/utils/utils';
import type { GRN } from '@/types/grn';

interface GRNCardProps {
  grn: GRN;
  onClick: () => void;
  onQAQCClick: () => void;
  className?: string;
}

const statusColorMap: Record<GRN['status'], string> = {
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
};

export const GRNCard = ({ grn, onClick, onQAQCClick, className }: GRNCardProps) => (
  <div
    className={cn(
      'relative w-full flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow  cursor-pointer',
      className
    )}
    onClick={onClick}
  >
    <div className="flex-1 space-y-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h3 className="text-lg font-semibold text-foreground">
          {grn.vendor} — {grn.product}
        </h3>
        <span
          className={cn(
            'mt-1 md:mt-0 px-2 py-1 rounded text-xs font-medium text-white',
            statusColorMap[grn.status]
          )}
        >
          {grn.status}
        </span>
      </div>

      <p className="text-sm text-muted">Date: {new Date(grn.createdAt).toLocaleDateString()}</p>
      <p className="text-sm text-muted">
        Quantity: {grn.quantity} | Containers: {grn.containerQuantity}
      </p>

      {/* QA/QC launcher */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onQAQCClick();
        }}
        className={`absolute bottom-4 right-4 px-3 py-1 ${grn.qaqc ? 'bg-blue-600' : 'bg-yellow-600'} text-white rounded hover:bg-blue-700`}
      >
        QA/QC
      </button>
    </div>
  </div>
);
