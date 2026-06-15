import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateProcessJobModal } from '@/features/manufacturing/components/CreateProcessJobModal';
import { ProcessCard } from '@/features/manufacturing/components/ProcessCard';
import { ProcessTabs } from '@/features/manufacturing/components/ProcessTabs';
import { useProcessBoard } from '@/features/manufacturing/hooks/useProcessBoard';
import type { LotProcessStepCard } from '@/features/manufacturing/types/process.types';
import { manufacturingRoutes } from '@/features/manufacturing/utils/processRoutes';

export function ProcessBoardPage() {
  const navigate = useNavigate();
  const { processCode: processCodeParam } = useParams();
  const [searchParams] = useSearchParams();
  const queryProcessCode = searchParams.get('processCode') ?? undefined;
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [placeholderAction, setPlaceholderAction] = useState<{
    title: string;
    description: string;
    card?: LotProcessStepCard;
  }>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const requestedProcessCode = processCodeParam ?? queryProcessCode;
  
  const { 
    processes, 
    activeProcessCode, 
    activeProcess, 
    cards, 
    isUsingMockData, 
    isLoading, 
    error,
    refresh
  } = useProcessBoard({
    processCode: requestedProcessCode,
    search: search || undefined,
    status: status !== 'all' ? status : undefined
  });
  
  const firstBatchId = cards.find((card) => card.batchId)?.batchId;

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
  };

  const processName = activeProcess?.processName ?? activeProcessCode ?? 'Process';
  const normalizedProcessName = processName || 'Process';
  const createButtonLabel = `Create New ${normalizedProcessName}`;
  const readyContextCard = cards.find((card) => card.status === 'ready');

  const openCreatePlaceholder = () => {
    console.info('Create new process placeholder opened', {
      processCode: activeProcessCode,
      processName: normalizedProcessName,
    });
    setIsCreateModalOpen(true);
  };

  const openCardActionPlaceholder = (card: LotProcessStepCard) => {
    console.info('Process card action placeholder clicked', {
      stepId: card.stepId,
      processCode: card.processCode,
      status: card.status,
    });
    setPlaceholderAction({
      title: getPlaceholderTitle(card),
      description:
        'This card action is display-only for now. It does not start a process, open the workspace, or change inventory.',
      card,
    });
  };

  return (
    <section className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
              Manufacturing
            </p>
            {isUsingMockData ? <Badge variant="outline">Temporary mock data</Badge> : null}
            {isLoading ? <Badge variant="secondary">Loading</Badge> : null}
          </div>
          <h1 className="mt-2 text-3xl font-bold text-foreground">{normalizedProcessName}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Manage {normalizedProcessName.toLowerCase()} jobs and start new process runs.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" size="lg" className="min-h-11" onClick={openCreatePlaceholder}>
            <Plus className="h-5 w-5" />
            {createButtonLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={!firstBatchId}
            onClick={() => {
              if (firstBatchId) {
                navigate(manufacturingRoutes.batchHistory(firstBatchId));
              }
            }}
          >
            Batch History
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lot, batch..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full sm:max-w-xs space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ready">Ready to Start</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="qa_pending">Awaiting QA/QC</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(search || status !== 'all') && (
          <Button variant="ghost" onClick={handleResetFilters} className="mb-0.5">
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {error ? (
        <Card className="border-red-300 bg-white">
          <CardContent className="p-4 text-sm text-red-600">
            Real manufacturing API read failed. Showing temporary fallback data. {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="relative z-10">
        <ProcessTabs processes={processes} activeProcessCode={activeProcessCode} />
      </div>

      <div className="rounded-md border bg-card p-4 text-card-foreground">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selected process</p>
            <p className="text-xl font-semibold">
              {normalizedProcessName}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {activeProcessCode}
              </span>
            </p>
          </div>
          <Badge variant="secondary">{cards.length} cards</Badge>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold text-foreground">No active runtime cards</p>
            <p className="mt-2 text-muted-foreground">
              The backend will populate this board with active lot process steps or process executions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {cards.map((card) => (
            <ProcessCard
              key={card.stepId}
              processStep={card}
              onAction={openCardActionPlaceholder}
            />
          ))}
        </div>
      )}

      {placeholderAction ? (
        <Card className="border-dashed bg-gray-50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{placeholderAction.title}</p>
              <p className="text-sm text-muted-foreground">{placeholderAction.description}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setPlaceholderAction(undefined)}>
              Clear
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <CreateProcessJobModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        processName={normalizedProcessName}
        processCode={activeProcessCode}
        contextCard={readyContextCard}
        onStarted={(stepId) => {
          refresh();
          navigate(manufacturingRoutes.workspace(stepId));
        }}
      />
    </section>
  );
}

function getPlaceholderTitle(card: LotProcessStepCard): string {
  if (card.status === 'ready') {
    return `Start ${card.processName}`;
  }

  if (card.status === 'in_progress') {
    return `Continue ${card.processName}`;
  }

  if (card.status === 'qa_pending') {
    return `${card.processName} QA/QC Status`;
  }

  if (card.status === 'completed') {
    return `${card.processName} Summary`;
  }

  return `${card.processName} Details`;
}
