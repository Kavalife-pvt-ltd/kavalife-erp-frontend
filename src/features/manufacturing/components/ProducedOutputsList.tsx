import type { ProcessExecutionOutputDto } from '@/api/manufacturing/processExecutions.api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ProducedOutputsListProps = {
  outputs: ProcessExecutionOutputDto[];
};

export function ProducedOutputsList({ outputs }: ProducedOutputsListProps) {
  if (!outputs || outputs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produced Outputs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantity Produced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outputs.map((output) => (
                <TableRow key={output.id}>
                  <TableCell className="font-medium">{output.lotNumber}</TableCell>
                  <TableCell>{output.productName}</TableCell>
                  <TableCell>
                    <Badge variant={output.status === 'under_qaqc' ? 'secondary' : 'outline'}>
                      {output.status === 'under_qaqc' ? 'Under QA/QC' : output.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {output.quantityProduced} {output.unitOfMeasure}
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
