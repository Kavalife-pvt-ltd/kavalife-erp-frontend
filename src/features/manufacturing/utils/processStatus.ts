import type { ProcessStatus } from '@/features/manufacturing/types/process.types';

export function getProcessStatusLabel(status: ProcessStatus): string {
  const labels: Record<ProcessStatus, string> = {
    pending: 'Pending',
    ready: 'Ready to Start',
    in_progress: 'In Progress',
    blocked: 'Blocked',
    qa_pending: 'Awaiting QA/QC',
    completed: 'Completed',
  };

  return labels[status];
}

export function getProcessStatusTone(
  status: ProcessStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  const tones: Record<ProcessStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'outline',
    ready: 'secondary',
    in_progress: 'default',
    blocked: 'destructive',
    qa_pending: 'secondary',
    completed: 'outline',
  };

  return tones[status];
}

export function getProcessStatusClassName(status: ProcessStatus): string {
  const classes: Record<ProcessStatus, string> = {
    pending: 'border-stroke text-captionPlaceholder',
    ready: 'bg-gray-100 text-primaryText',
    in_progress: 'bg-blue-500 text-white',
    blocked: 'bg-red-600 text-white',
    qa_pending: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
    completed: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300',
  };

  return classes[status];
}
