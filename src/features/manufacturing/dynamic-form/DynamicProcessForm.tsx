import { useEffect, useState } from 'react';

import { DynamicSection } from '@/features/manufacturing/dynamic-form/DynamicSection';
import type {
  ProcessFieldValue,
  ProcessFormSchema,
} from '@/features/manufacturing/types/formSchema.types';

type DynamicProcessFormProps = {
  schema: ProcessFormSchema;
  initialValues?: Record<string, ProcessFieldValue>;
  onChange?: (values: Record<string, ProcessFieldValue>) => void;
};

export function DynamicProcessForm({
  schema,
  initialValues = {},
  onChange,
}: DynamicProcessFormProps) {
  const [values, setValues] = useState<Record<string, ProcessFieldValue>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateField = (fieldName: string, value: ProcessFieldValue) => {
    setValues((currentValues) => {
      const nextValues = { ...currentValues, [fieldName]: value };
      onChange?.(nextValues);
      return nextValues;
    });
  };

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div>
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
          Schema v{schema.version}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">{schema.title}</h2>
        {schema.description ? (
          <p className="mt-2 text-muted-foreground">{schema.description}</p>
        ) : null}
      </div>

      {schema.sections.map((section) => (
        <DynamicSection key={section.id} section={section} values={values} onChange={updateField} />
      ))}
    </form>
  );
}
