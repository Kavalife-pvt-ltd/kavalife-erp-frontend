import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicField } from '@/features/manufacturing/dynamic-form/DynamicField';
import type {
  ProcessFieldValue,
  ProcessFormSection,
} from '@/features/manufacturing/types/formSchema.types';

type DynamicSectionProps = {
  section: ProcessFormSection;
  values: Record<string, ProcessFieldValue>;
  onChange: (fieldName: string, value: ProcessFieldValue) => void;
};

export function DynamicSection({ section, values, onChange }: DynamicSectionProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="text-xl">{section.title}</CardTitle>
        {section.description ? (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 lg:grid-cols-2">
        {section.fields.map((field) => (
          <div
            key={field.id}
            className={field.type === 'repeatable_table' ? 'lg:col-span-2' : undefined}
          >
            <DynamicField field={field} value={values[field.name]} onChange={onChange} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
