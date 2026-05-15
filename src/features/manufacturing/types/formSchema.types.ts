export type ProcessFieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'date'
  | 'time'
  | 'datetime'
  | 'checkbox'
  | 'repeatable_table';

export type ProcessFieldOption = {
  label: string;
  value: string;
};

export type ProcessPrimitiveFieldValue = string | number | boolean | null;
export type RepeatableRowValue = Record<string, ProcessPrimitiveFieldValue>;
export type ProcessFieldValue = ProcessPrimitiveFieldValue | RepeatableRowValue[];

type BaseProcessFormField = {
  id: string;
  name: string;
  label: string;
  type: ProcessFieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  backendOwned?: boolean;
  options?: ProcessFieldOption[];
};

export type StandardProcessFormField = BaseProcessFormField & {
  type: Exclude<ProcessFieldType, 'repeatable_table'>;
};

export type RepeatableTableColumnField = Omit<StandardProcessFormField, 'backendOwned'>;

export type RepeatableTableField = BaseProcessFormField & {
  type: 'repeatable_table';
  columns: RepeatableTableColumnField[];
  minRows?: number;
};

export type ProcessFormField = StandardProcessFormField | RepeatableTableField;

export type ProcessFormSection = {
  id: string;
  title: string;
  description?: string;
  fields: ProcessFormField[];
};

export type ProcessFormSchema = {
  id: string;
  processCode: string;
  version: number;
  title: string;
  description?: string;
  sections: ProcessFormSection[];
};
