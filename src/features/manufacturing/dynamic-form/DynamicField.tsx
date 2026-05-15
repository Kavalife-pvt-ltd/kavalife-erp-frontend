import { Badge } from '@/components/ui/badge';
import { RepeatableTable } from '@/features/manufacturing/dynamic-form/RepeatableTable';
import { renderFieldControl } from '@/features/manufacturing/dynamic-form/fieldRenderers';
import type {
  ProcessFieldValue,
  ProcessFormField,
  RepeatableRowValue,
} from '@/features/manufacturing/types/formSchema.types';

type DynamicFieldProps = {
  field: ProcessFormField;
  value: ProcessFieldValue | undefined;
  onChange: (fieldName: string, value: ProcessFieldValue) => void;
};

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const isDisplayOnly = Boolean(field.readOnly || field.backendOwned);

  if (field.type === 'repeatable_table') {
    return (
      <FieldShell field={field}>
        <RepeatableTable
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={(rows: RepeatableRowValue[]) => onChange(field.name, rows)}
        />
      </FieldShell>
    );
  }

  return (
    <FieldShell field={field}>
      {renderFieldControl({
        field,
        value,
        onChange: (nextValue) => onChange(field.name, nextValue),
      })}
      {isDisplayOnly ? (
        <p className="text-xs text-muted-foreground">
          Display-only. This value is owned by the backend.
        </p>
      ) : null}
    </FieldShell>
  );
}

type FieldShellProps = {
  field: ProcessFormField;
  children: React.ReactNode;
};

function FieldShell({ field, children }: FieldShellProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={field.id} className="text-sm font-semibold text-foreground">
          {field.label}
        </label>
        {field.required ? <Badge variant="outline">Required</Badge> : null}
        {field.backendOwned ? <Badge variant="secondary">Backend-owned</Badge> : null}
      </div>
      {field.description ? (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      ) : null}
      {children}
    </div>
  );
}
