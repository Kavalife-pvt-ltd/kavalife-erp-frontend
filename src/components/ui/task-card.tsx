// components/ui/task-card.tsx
// import * as React from 'react';
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
  return (
    <div
      className={cn(
        'w-full flex gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-border',
        className
      )}
    >
      <img src={imageUrl} alt={title} className="w-16 h-16 object-cover rounded-md border" />

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-medium text-white',
              statusColorMap[status]
            )}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-muted mt-1 line-clamp-2">{description}</p>
        <p className="text-xs text-muted mt-2">{time}</p>
      </div>
    </div>
  );
};
