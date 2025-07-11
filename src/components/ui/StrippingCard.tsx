import { cn } from '@/utils/utils';

export interface StrippingCardProps {
  id: number;
  productName: string;
  batchNo: string;
  date: string; // ISO format
  operator: string;
  status: 'in-progress' | 'completed';
}

const statusStyles: Record<StrippingCardProps['status'], string> = {
  'in-progress': 'bg-yellow-500 text-black',
  completed: 'bg-green-500 text-white',
};

export const StrippingCard = ({
  id,
  productName,
  batchNo,
  date,
  operator,
  status,
}: StrippingCardProps) => (
  <div
    className={cn(
      'flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-lg shadow hover:shadow-md',
      'transition-shadow'
    )}
  >
    <div className="flex-1 space-y-1">
      <h3 className="text-lg font-semibold">Stripping Log #{id}</h3>
      <p className="text-sm">
        <span className="font-medium">Product:</span> {productName}
      </p>
      <p className="text-sm">
        <span className="font-medium">Batch No:</span> {batchNo}
      </p>
      <p className="text-sm">
        <span className="font-medium">Date:</span> {new Date(date).toLocaleDateString()}
      </p>
      <p className="text-sm">
        <span className="font-medium">Operator:</span> {operator}
      </p>
    </div>
    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusStyles[status])}>
      {status.replace('-', ' ')}
    </span>
  </div>
);
