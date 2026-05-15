import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  ProcessPrimitiveFieldValue,
  RepeatableRowValue,
  RepeatableTableField,
} from '@/features/manufacturing/types/formSchema.types';

type RepeatableTableProps = {
  field: RepeatableTableField;
  value: RepeatableRowValue[];
  onChange: (rows: RepeatableRowValue[]) => void;
};

export function RepeatableTable({ field, value, onChange }: RepeatableTableProps) {
  const canRemoveRows = value.length > (field.minRows ?? 0);

  const addRow = () => {
    const nextRow = field.columns.reduce<RepeatableRowValue>((row, column) => {
      row[column.name] = column.type === 'checkbox' ? false : '';
      return row;
    }, {});

    onChange([...value, nextRow]);
  };

  const updateRow = (
    rowIndex: number,
    columnName: string,
    nextValue: ProcessPrimitiveFieldValue
  ) => {
    onChange(
      value.map((row, currentIndex) =>
        currentIndex === rowIndex ? { ...row, [columnName]: nextValue } : row
      )
    );
  };

  const removeRow = (rowIndex: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== rowIndex));
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {field.columns.map((column) => (
                <TableHead key={column.id} className="min-w-40">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={field.columns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No rows added yet.
                </TableCell>
              </TableRow>
            ) : (
              value.map((row, rowIndex) => (
                <TableRow key={`${field.id}-${rowIndex}`}>
                  {field.columns.map((column) => (
                    <TableCell key={column.id}>
                      <Input
                        type={column.type === 'number' ? 'number' : column.type}
                        value={String(row[column.name] ?? '')}
                        placeholder={column.placeholder}
                        onChange={(event) =>
                          updateRow(
                            rowIndex,
                            column.name,
                            column.type === 'number'
                              ? event.target.valueAsNumber
                              : event.target.value
                          )
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!canRemoveRows}
                      onClick={() => removeRow(rowIndex)}
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button type="button" variant="secondary" size="lg" className="min-h-12" onClick={addRow}>
        <Plus className="h-5 w-5" />
        Add Row
      </Button>
    </div>
  );
}
