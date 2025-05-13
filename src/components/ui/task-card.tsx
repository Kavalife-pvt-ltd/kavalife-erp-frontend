// components/ui/task-card.tsx
import { useState } from 'react';
import { cn } from '@/utils/utils';

interface TaskCardProps {
  imageUrl: string;
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed';
  className?: string;
}

const statusColorMap: Record<TaskCardProps['status'], string> = {
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
};

export const TaskCard = ({
  imageUrl,
  title,
  description,
  time,
  status,
  className,
}: TaskCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'w-full flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-border',
        className
      )}
    >
      <div className="flex-shrink-0">
        <img src={imageUrl} alt={title} className="w-20 h-20 object-cover rounded-md border" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span
            className={cn(
              'mt-1 md:mt-0 px-2 py-1 rounded text-xs font-medium text-white self-start md:self-auto',
              statusColorMap[status]
            )}
          >
            {status}
          </span>
        </div>

        {showDetails && (
          <>
            <p className="text-sm text-muted mt-1">{description}</p>
            <p className="text-xs text-muted">{time}</p>
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
