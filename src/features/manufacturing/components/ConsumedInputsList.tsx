import type { ProcessExecutionInputDto } from '@/api/manufacturing/processExecutions.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ConsumedInputsListProps = {
  inputs: ProcessExecutionInputDto[];
};

export function ConsumedInputsList({ inputs }: ConsumedInputsListProps) {
  if (!inputs || inputs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumed Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity Consumed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputs.map((input) => (
                <TableRow key={input.id}>
                  <TableCell className="font-medium">{input.lotNumber}</TableCell>
                  <TableCell>{input.productName}</TableCell>
                  <TableCell className="text-right">
                    {input.quantityConsumed} {input.unitOfMeasure}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
