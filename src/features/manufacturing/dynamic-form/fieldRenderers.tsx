import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  ProcessFieldValue,
  StandardProcessFormField,
} from '@/features/manufacturing/types/formSchema.types';

type FieldRendererProps = {
  field: StandardProcessFormField;
  value: ProcessFieldValue | undefined;
  onChange: (value: ProcessFieldValue) => void;
};

export function renderFieldControl({ field, value, onChange }: FieldRendererProps) {
  const isDisplayOnly = Boolean(field.readOnly || field.backendOwned);
  const stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  if (field.type === 'textarea') {
    return (
      <Textarea
        id={field.id}
        name={field.name}
        value={stringValue}
        placeholder={field.placeholder}
        readOnly={isDisplayOnly}
        disabled={isDisplayOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <Select
        value={stringValue}
        disabled={isDisplayOnly}
        onValueChange={(nextValue) => onChange(nextValue)}
      >
        <SelectTrigger id={field.id}>
          <SelectValue placeholder={field.placeholder ?? 'Select option'} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex min-h-12 items-center gap-3 rounded-md border bg-background px-3 py-2">
        <input
          id={field.id}
          name={field.name}
          type="checkbox"
          className="h-5 w-5 rounded border-input text-primary focus:ring-ring"
          checked={Boolean(value)}
          disabled={isDisplayOnly}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="text-sm text-muted-foreground">
          {field.placeholder ?? 'Mark when complete'}
        </span>
      </label>
    );
  }

  return (
    <Input
      id={field.id}
      name={field.name}
      type={getInputType(field.type)}
      value={stringValue}
      placeholder={field.placeholder}
      readOnly={isDisplayOnly}
      disabled={isDisplayOnly}
      onChange={(event) =>
        onChange(field.type === 'number' ? event.target.valueAsNumber : event.target.value)
      }
    />
  );
}

function getInputType(fieldType: StandardProcessFormField['type']) {
  if (fieldType === 'datetime') {
    return 'datetime-local';
  }

  if (fieldType === 'number' || fieldType === 'date' || fieldType === 'time') {
    return fieldType;
  }

  return 'text';
}
