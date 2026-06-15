import { useEffect, useState } from 'react';

import { fetchInventoryLots, type InventoryLotDto } from '@/api/manufacturing/inventoryLots.api';
import type { CreateProcessExecutionInputPayload } from '@/api/manufacturing/processExecutions.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type InventorySelectionProps = {
  selectedInputs: CreateProcessExecutionInputPayload[];
  onChange: (inputs: CreateProcessExecutionInputPayload[]) => void;
};

export function InventorySelection({ selectedInputs, onChange }: InventorySelectionProps) {
  const [lots, setLots] = useState<InventoryLotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        // Only fetch available lots
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
  }, []);

  const handleToggleLot = (lot: InventoryLotDto) => {
    const isSelected = selectedInputs.some((i) => i.inventoryLotId === lot.id);
    if (isSelected) {
      onChange(selectedInputs.filter((i) => i.inventoryLotId !== lot.id));
    } else {
      onChange([
        ...selectedInputs,
        { inventoryLotId: lot.id, quantity: lot.availableQuantity }, // default to max
      ]);
    }
  };

  const handleQuantityChange = (lotId: number, value: string) => {
    const numValue = Number(value);
    if (Number.isNaN(numValue)) return;

    onChange(
      selectedInputs.map((input) =>
        input.inventoryLotId === lotId ? { ...input, quantity: numValue } : input
      )
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-6">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Error loading inventory: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Input Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {lots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No available inventory found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Lot Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="w-[150px]">Consume Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((lot) => {
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
                      <TableCell>{lot.productName}</TableCell>
                      <TableCell>
                        {lot.availableQuantity} {lot.unitOfMeasure}
                      </TableCell>
                      <TableCell>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={lot.availableQuantity}
                              step="any"
                              value={selectedInput?.quantity ?? ''}
                              onChange={(e) => handleQuantityChange(lot.id, e.target.value)}
                              className="h-8 w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                              {lot.unitOfMeasure}
                            </span>
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
      </CardContent>
    </Card>
  );
}
