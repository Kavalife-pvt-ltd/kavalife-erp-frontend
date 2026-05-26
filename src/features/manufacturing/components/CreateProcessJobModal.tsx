import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { fetchInventoryLots, type InventoryLotDto } from '@/api/manufacturing/inventoryLots.api';
import { createProcessExecution } from '@/api/manufacturing/processExecutions.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/Loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { LotProcessStepCard } from '@/features/manufacturing/types/process.types';

type CreateProcessJobModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processName: string;
  processCode: string;
  contextCard?: LotProcessStepCard;
  onStarted?: (stepId: string) => void;
};

type SelectedInput = {
  inventoryLotId: number;
  quantity: number;
};

export function CreateProcessJobModal({
  open,
  onOpenChange,
  processName,
  processCode,
  contextCard,
  onStarted,
}: CreateProcessJobModalProps) {
  const [lots, setLots] = useState<InventoryLotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedInputs, setSelectedInputs] = useState<SelectedInput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const preferredInventoryType = getPreferredInventoryType(processCode);
  const contextBatchId = toOptionalNumber(contextCard?.batchId);
  const contextProductId = toOptionalNumber(contextCard?.productId);
  const filterResult = filterInventoryLots(lots, {
    preferredInventoryType,
    batchId: contextBatchId,
    productId: contextProductId,
  });
  const visibleLots = filterResult.lots;
  const hasWeakFiltering =
    !preferredInventoryType || !contextBatchId || !contextProductId || filterResult.usedFallback;

  useEffect(() => {
    if (!open) {
      setSelectedInputs([]);
      setError(undefined);
      setSubmitting(false);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchInventoryLots({ status: 'available' });
        if (mounted) {
          setLots(data);
          setError(undefined);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load inventory lots');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [open]);

  const handleToggleLot = (lot: InventoryLotDto) => {
    const isSelected = selectedInputs.some((i) => i.inventoryLotId === lot.id);
    if (isSelected) {
      setSelectedInputs(selectedInputs.filter((i) => i.inventoryLotId !== lot.id));
    } else {
      setSelectedInputs([
        ...selectedInputs,
        { inventoryLotId: lot.id, quantity: 0 },
      ]);
    }
  };

  const handleQuantityChange = (lotId: number, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    
    setSelectedInputs(
      selectedInputs.map((input) =>
        input.inventoryLotId === lotId ? { ...input, quantity: numValue } : input
      )
    );
  };

  const hasInvalidQuantity = selectedInputs.some((input) => {
    const lot = lots.find((item) => item.id === input.inventoryLotId);
    return !lot || input.quantity <= 0 || input.quantity > lot.availableQuantity;
  });
  const canStart = selectedInputs.length > 0 && !hasInvalidQuantity && !submitting;

  const handleStartProcess = async () => {
    if (selectedInputs.length === 0) {
      toast.error('Please select at least one inventory lot.');
      return;
    }

    if (hasInvalidQuantity) {
      toast.error('Selected quantities must be greater than 0 and within available balance.');
      return;
    }

    const batchId = toOptionalNumber(contextCard?.batchId);
    const processDefinitionId = toOptionalNumber(contextCard?.processDefinitionId);
    const lotProcessStepId = toOptionalNumber(contextCard?.stepId);

    if (!batchId) {
      toast.error('Batch context is missing. Please start from a ready process card.');
      return;
    }

    if (!processCode) {
      toast.error('Process code is missing. Please refresh the process page and try again.');
      return;
    }

    if (!processDefinitionId) {
      toast.error('Process definition context is missing. Please refresh the process page and try again.');
      return;
    }

    if (!lotProcessStepId || !contextCard?.stepId) {
      toast.error('Process step context is missing. Please start from a ready process card.');
      return;
    }

    const payload = {
      batchId,
      processCode,
      processDefinitionId,
      lotProcessStepId,
      inputs: selectedInputs.map((input) => ({
        inventoryLotId: input.inventoryLotId,
        quantity: input.quantity,
      })),
      formData: {},
    };

    setSubmitting(true);
    setError(undefined);

    try {
      console.info('Starting process execution', payload);
      await createProcessExecution(payload);
      toast.success('Process started successfully.');
      onOpenChange(false);
      onStarted?.(contextCard.stepId);
    } catch (err) {
      const message = getSafeErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>Start {processName}</DialogTitle>
          <DialogDescription>
            Select available inventory and quantity to start this process.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto py-4">
          <div className="rounded-md border bg-muted/30 p-4">
            <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <ContextItem label="Process" value={`${processName} (${processCode})`} />
              <ContextItem label="Batch" value={contextCard?.batchNumber ?? 'Not selected yet'} />
              <ContextItem label="Material" value={contextCard?.productName ?? 'Select inventory below'} />
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  Step status
                </p>
                <Badge variant="secondary" className="mt-1">
                  Ready to Start
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Available Inventory</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Available only</Badge>
                {preferredInventoryType ? (
                  <Badge variant="outline">{formatInventoryLabel(preferredInventoryType)} preferred</Badge>
                ) : null}
                {contextBatchId ? (
                  <Badge variant="outline">Batch match preferred</Badge>
                ) : null}
                {contextProductId ? (
                  <Badge variant="outline">Product match preferred</Badge>
                ) : null}
              </div>
              {hasWeakFiltering ? (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  Showing available inventory. Backend will validate final eligibility.
                </p>
              ) : null}
            </div>
            {loading ? (
              <div className="flex justify-center p-4"><Loader /></div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : lots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available inventory found.</p>
            ) : visibleLots.length === 0 ? (
              <p className="rounded-md border p-4 text-sm text-muted-foreground">
                No eligible inventory matched the current process context.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Location / Status</TableHead>
                      <TableHead className="w-[160px]">Consume Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleLots.map((lot) => {
                      const selectedInput = selectedInputs.find((i) => i.inventoryLotId === lot.id);
                      const isSelected = Boolean(selectedInput);

                      return (
                        <TableRow key={lot.id}>
                          <TableCell>
                            <Input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={isSelected}
                              onChange={() => handleToggleLot(lot)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{lot.lotNumber}</TableCell>
                          <TableCell>{lot.productName ?? `Product #${lot.productId}`}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatInventoryLabel(lot.inventoryType)}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatQuantity(lot.availableQuantity)} {lot.unitOfMeasure}
                          </TableCell>
                          <TableCell>{getLotSourceLabel(lot)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p>{lot.currentLocation ?? 'Location not set'}</p>
                              <Badge variant={lot.status === 'available' ? 'secondary' : 'outline'}>
                                {lot.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0.01}
                                  max={lot.availableQuantity}
                                  step="any"
                                  value={selectedInput?.quantity || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > lot.availableQuantity) {
                                      handleQuantityChange(lot.id, String(lot.availableQuantity));
                                    } else {
                                      handleQuantityChange(lot.id, e.target.value);
                                    }
                                  }}
                                  className="h-8 w-24"
                                />
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleStartProcess} disabled={!canStart}>
            {submitting ? 'Starting...' : 'Start Process'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ContextItemProps = {
  label: string;
  value: string;
};

function ContextItem({ label, value }: ContextItemProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getLotSourceLabel(lot: InventoryLotDto): string {
  if (lot.grnNumber) {
    return lot.grnNumber;
  }

  if (lot.processName || lot.processCode) {
    return lot.processName ?? lot.processCode ?? 'Source process';
  }

  if (lot.sourceProcessExecutionId) {
    return `Execution #${lot.sourceProcessExecutionId}`;
  }

  if (lot.sourceGrnId) {
    return `GRN #${lot.sourceGrnId}`;
  }

  if (lot.sourceType) {
    return formatInventoryLabel(lot.sourceType);
  }

  return 'Source not shown';
}

type InventoryFilterContext = {
  preferredInventoryType?: string;
  batchId?: number;
  productId?: number;
};

type InventoryFilterResult = {
  lots: InventoryLotDto[];
  usedFallback: boolean;
};

function filterInventoryLots(
  lots: InventoryLotDto[],
  context: InventoryFilterContext
): InventoryFilterResult {
  const availableLots = lots.filter((lot) => lot.status === 'available');
  let filtered = availableLots;
  let usedFallback = false;

  if (context.preferredInventoryType) {
    const byType = filtered.filter((lot) => lot.inventoryType === context.preferredInventoryType);
    if (byType.length > 0) {
      filtered = byType;
    } else {
      usedFallback = true;
    }
  }

  if (context.batchId) {
    const byBatch = filtered.filter((lot) => lot.batchId === context.batchId);
    if (byBatch.length > 0) {
      filtered = byBatch;
    } else {
      usedFallback = true;
    }
  }

  if (context.productId) {
    const byProduct = filtered.filter((lot) => lot.productId === context.productId);
    if (byProduct.length > 0) {
      filtered = byProduct;
    } else {
      usedFallback = true;
    }
  }

  return { lots: filtered, usedFallback };
}

function getPreferredInventoryType(processCode: string): string | undefined {
  const normalized = processCode.toUpperCase();

  if (normalized === 'EXT' || normalized === 'EXTRACTION') {
    return 'raw';
  }

  if (
    normalized === 'STR' ||
    normalized === 'STRIPPING' ||
    normalized === 'PUR' ||
    normalized === 'PURIFICATION' ||
    normalized === 'DEC' ||
    normalized === 'DECOLORISATION' ||
    normalized === 'DECOLORIZATION'
  ) {
    return 'wip';
  }

  return undefined;
}

function toOptionalNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getSafeErrorMessage(error: unknown): string {
  if (isRecord(error)) {
    const response = error.response;
    if (isRecord(response)) {
      const data = response.data;
      if (isRecord(data)) {
        const message = typeof data.message === 'string' ? data.message : undefined;
        const apiError = data.error;
        if (isRecord(apiError) && typeof apiError.details === 'string') {
          return message ? `${message}: ${apiError.details}` : apiError.details;
        }
        if (message) {
          return message;
        }
      }
    }

    if (typeof error.message === 'string') {
      return error.message;
    }
  }

  return 'Failed to start process';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatInventoryLabel(value: string): string {
  if (!value) {
    return 'Not set';
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatQuantity(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString() : '0';
}
