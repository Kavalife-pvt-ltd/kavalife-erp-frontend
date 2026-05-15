import type { ProcessStatus } from '@/features/manufacturing/types/process.types';

export function getProcessStatusLabel(status: ProcessStatus): string {
  const labels: Record<ProcessStatus, string> = {
    pending: 'Pending',
    ready: 'Ready',
    in_progress: 'In progress',
    blocked: 'Blocked',
    qa_pending: 'QA pending',
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
    pending: 'border-muted-foreground/40 text-muted-foreground',
    ready: 'bg-secondary text-secondary-foreground',
    in_progress: 'bg-primary text-primary-foreground',
    blocked: 'bg-destructive text-destructive-foreground',
    qa_pending: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
    completed: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300',
  };

  return classes[status];
}
