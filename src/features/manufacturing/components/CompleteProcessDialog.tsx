import { useState } from 'react';

import type { CompleteProcessExecutionPayload } from '@/api/manufacturing/processExecutions.api';
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
import { Textarea } from '@/components/ui/textarea';

type CompleteProcessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: CompleteProcessExecutionPayload) => Promise<void>;
  isCompleting: boolean;
  targetProductId?: number; // Optional: could pass it if known from step
  unitOfMeasure?: string; // Optional: could pass from step context
};

export function CompleteProcessDialog({
  open,
  onOpenChange,
  onConfirm,
  isCompleting,
  targetProductId = 1, // Fallback placeholder
  unitOfMeasure = 'kg', // Fallback placeholder
}: CompleteProcessDialogProps) {
  const [quantityOut, setQuantityOut] = useState('');
  const [quantityLoss, setQuantityLoss] = useState('0');
  const [lossReason, setLossReason] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [productId, setProductId] = useState(String(targetProductId));
  const [inventoryType, setInventoryType] = useState('wip');

  const handleConfirm = async () => {
    const qOut = Number(quantityOut);
    const qLoss = Number(quantityLoss);
    const pId = Number(productId);

    if (Number.isNaN(qOut) || qOut < 0) return;
    if (Number.isNaN(qLoss) || qLoss < 0) return;
    if (qLoss > 0 && !lossReason.trim()) return;
    if (Number.isNaN(pId) || pId <= 0) return;
    if (!inventoryType.trim()) return;

    await onConfirm({
      quantityOut: qOut,
      quantityLoss: qLoss,
      lossReason: lossReason.trim() || undefined,
      outputs: [
        {
          productId: pId,
          quantity: qOut,
          unitOfMeasure: unitOfMeasure,
          inventoryType: inventoryType.trim(),
          currentLocation: currentLocation.trim() || undefined,
        },
      ],
    });
  };

  const isLossInvalid = Number(quantityLoss) > 0 && !lossReason.trim();
  const isOutInvalid = !quantityOut || Number(quantityOut) <= 0 || Number.isNaN(Number(quantityOut));
  const isProductInvalid = !productId || Number.isNaN(Number(productId)) || Number(productId) <= 0;
  const isTypeInvalid = !inventoryType.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Process</DialogTitle>
          <DialogDescription>
            Enter the final output and loss quantities. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <label htmlFor="productId" className="text-sm font-medium">
              Output Product ID
            </label>
            <Input
              id="productId"
              type="number"
              min="1"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="inventoryType" className="text-sm font-medium">
              Inventory Type
            </label>
            <Input
              id="inventoryType"
              value={inventoryType}
              onChange={(e) => setInventoryType(e.target.value)}
              placeholder="e.g. wip, finished_goods"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="quantityOut" className="text-sm font-medium">
              Output Quantity ({unitOfMeasure})
            </label>
            <Input
              id="quantityOut"
              type="number"
              min="0"
              step="any"
              value={quantityOut}
              onChange={(e) => setQuantityOut(e.target.value)}
              placeholder="e.g. 10.5"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="currentLocation" className="text-sm font-medium">
              Output Location (Optional)
            </label>
            <Input
              id="currentLocation"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. WIP Storage Area A"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="quantityLoss" className="text-sm font-medium">
              Loss Quantity ({unitOfMeasure})
            </label>
            <Input
              id="quantityLoss"
              type="number"
              min="0"
              step="any"
              value={quantityLoss}
              onChange={(e) => setQuantityLoss(e.target.value)}
              placeholder="e.g. 0.5"
            />
          </div>
          {Number(quantityLoss) > 0 && (
            <div className="space-y-2">
              <label htmlFor="lossReason" className="text-sm font-medium text-destructive">
                Loss Reason (Required)
              </label>
              <Textarea
                id="lossReason"
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                placeholder="Explain the cause of material loss..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCompleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isCompleting || isOutInvalid || isLossInvalid || isProductInvalid || isTypeInvalid}>
            {isCompleting ? 'Completing...' : 'Confirm Completion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
