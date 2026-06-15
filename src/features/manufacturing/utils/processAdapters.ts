import type { ProcessDefinitionDto } from '@/api/manufacturing/processDefinitions.api';
import type {
  ActiveLotProcessStepDto,
  LotProcessStepDetailDto,
  ProcessStepBoardCardDto,
} from '@/api/manufacturing/lotProcessSteps.api';
import type { ProcessExecutionDto } from '@/api/manufacturing/processExecutions.api';
import type {
  ProcessFieldValue,
  ProcessFormField,
  ProcessFormSchema,
  ProcessFormSection,
} from '@/features/manufacturing/types/formSchema.types';
import type {
  LotProcessStepCard,
  ProcessActivityItem,
  ProcessDefinition,
  ProcessExecution,
  ProcessStatus,
} from '@/features/manufacturing/types/process.types';

const backendOwnedFieldNames = new Set([
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'last_updated_by',
  'started_at',
  'completed_at',
  'verified_by',
  'verified_at',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'lastUpdatedBy',
  'startedAt',
  'completedAt',
  'verifiedBy',
  'verifiedAt',
]);

export function mapProcessDefinition(
  dto: ProcessDefinitionDto,
  sequence: number
): ProcessDefinition {
  return {
    id: String(dto.id),
    processCode: dto.code,
    processName: dto.name,
    sequence,
    description: dto.description ?? undefined,
    isActive: dto.isActive,
  };
}

export function mapActiveStepToCard(dto: ActiveLotProcessStepDto): LotProcessStepCard {
  return {
    stepId: String(dto.id),
    processDefinitionId: String(dto.process_definition_id),
    processName: dto.process_name,
    processCode: dto.process_code,
    batchId: String(dto.batch_id),
    batchNumber: dto.batch_number,
    lotId: String(dto.lot_id),
    lotNumber: dto.lot_number,
    productId: String(dto.product_id),
    productName: dto.product_name,
    quantity: 0,
    unit: 'unit',
    status: normalizeProcessStatus(dto.status),
    currentStage: getCurrentStageLabel(dto.status, dto.step_order),
    lastUpdatedBy: 'Backend',
    lastUpdatedAt: formatDateTime(dto.started_at ?? dto.created_at),
  };
}

export function mapBoardCardToCard(dto: ProcessStepBoardCardDto): LotProcessStepCard {
  return {
    stepId: String(dto.stepId),
    processDefinitionId: String(dto.processDefinitionId),
    processName: dto.processName,
    processCode: dto.processCode,
    batchId: String(dto.batchId),
    batchNumber: dto.batchNumber,
    lotId: String(dto.lotId),
    lotNumber: dto.lotNumber,
    productId: String(dto.productId),
    productName: dto.productName,
    quantity: dto.quantity,
    unit: dto.unit,
    executionQuantityIn: dto.quantityIn ?? undefined,
    executionQuantityOut: dto.quantityOut ?? undefined,
    status: normalizeProcessStatus(dto.status),
    currentStage: dto.currentStage,
    lastUpdatedBy: dto.lastUpdatedBy,
    lastUpdatedAt: formatDateTime(dto.lastUpdatedAt),
    startedAt: dto.startedAt ?? undefined,
    completedAt: dto.completedAt ?? undefined,
    qaqcRequired: dto.qaqcRequired,
  };
}

export function mapStepDetailToCard(
  dto: LotProcessStepDetailDto,
  definition?: ProcessDefinitionDto,
  execution?: ProcessExecutionDto
): LotProcessStepCard {
  return {
    stepId: String(dto.id),
    processDefinitionId: String(dto.process_definition_id),
    processName: dto.process_name,
    processCode: dto.process_code,
    batchId: String(dto.batch_id),
    batchNumber: dto.batch_number,
    lotId: String(dto.lot_id),
    lotNumber: dto.lot_number,
    productId: undefined,
    productName: definition?.name ?? dto.process_name,
    quantity: 0,
    unit: 'unit',
    executionQuantityIn: execution?.quantityIn ?? undefined,
    executionQuantityOut: execution?.quantityOut ?? undefined,
    status: normalizeProcessStatus(dto.status),
    currentStage: getCurrentStageLabel(dto.status, dto.step_order),
    lastUpdatedBy: getBackendActorLabel(execution),
    lastUpdatedAt: formatDateTime(execution?.updatedAt ?? dto.updated_at),
  };
}

export function mapProcessExecution(
  dto: ProcessExecutionDto,
  processCode: string
): ProcessExecution {
  return {
    executionId: String(dto.id),
    stepId: String(dto.lotProcessStepId),
    processCode,
    status: normalizeProcessStatus(dto.status),
    currentStage: dto.status,
    startedAt: dto.startedAt ?? undefined,
    completedAt: dto.completedAt ?? undefined,
    values: isRecord(dto.formData) ? dto.formData : {},
  };
}

export function mapExecutionValues(
  execution?: ProcessExecutionDto
): Record<string, ProcessFieldValue> {
  if (!execution) {
    return {};
  }

  const values: Record<string, ProcessFieldValue> = {
    startedAt: toFieldValue(execution.startedAt),
    completedAt: toFieldValue(execution.completedAt),
    verifiedBy: toFieldValue(execution.verifiedBy),
    verifiedAt: toFieldValue(execution.verifiedAt),
    operatorNotes: toFieldValue(execution.operatorNotes),
    supervisorNotes: toFieldValue(execution.supervisorNotes),
    quantityIn: toFieldValue(execution.quantityIn),
    quantityOut: toFieldValue(execution.quantityOut),
    quantityLoss: toFieldValue(execution.quantityLoss),
    yieldPercent: toFieldValue(execution.yieldPercent),
  };

  if (isRecord(execution.formData)) {
    Object.entries(execution.formData).forEach(([key, value]) => {
      values[key] = toFieldValue(value);
    });
  }

  return values;
}

export function mapProcessDefinitionSchema(
  definition: ProcessDefinitionDto | undefined,
  fallback: ProcessFormSchema
): ProcessFormSchema {
  if (!definition?.defaultFormSchema || !isRecord(definition.defaultFormSchema)) {
    return fallback;
  }

  const rawSchema = definition.defaultFormSchema;
  const sections = Array.isArray(rawSchema.sections)
    ? rawSchema.sections
        .map(mapSchemaSection)
        .filter((section): section is ProcessFormSection => Boolean(section))
    : [];
  const repeatableSections = Array.isArray(rawSchema.repeatableSections)
    ? rawSchema.repeatableSections
        .map(mapRepeatableSchemaSection)
        .filter((section): section is ProcessFormSection => Boolean(section))
    : [];

  const allSections = [...sections, ...repeatableSections];

  if (allSections.length === 0) {
    return fallback;
  }

  return {
    id: getString(rawSchema.id, `process-${definition.id}-schema`),
    processCode: getString(rawSchema.processCode, definition.code),
    version: getNumber(rawSchema.version, 1),
    title: getString(rawSchema.title, `${definition.name} runtime form`),
    description: getOptionalString(rawSchema.description),
    sections: allSections,
  };
}

export function mapExecutionActivity(
  step: LotProcessStepDetailDto,
  executions: ProcessExecutionDto[]
): ProcessActivityItem[] {
  const activity: ProcessActivityItem[] = [
    {
      id: `step-created-${step.id}`,
      label: 'Step created',
      actor: 'System',
      occurredAt: formatDateTime(step.created_at),
      description: `Runtime step ${step.step_order} was created for this lot.`,
    },
  ];

  if (step.started_at) {
    activity.push({
      id: `step-started-${step.id}`,
      label: 'Step started',
      actor: 'Backend',
      occurredAt: formatDateTime(step.started_at),
    });
  }

  executions.forEach((execution) => {
    activity.push({
      id: `execution-${execution.id}`,
      label: `Execution ${execution.status}`,
      actor: getBackendActorLabel(execution),
      occurredAt: formatDateTime(execution.updatedAt),
      description: execution.operatorNotes ?? execution.supervisorNotes ?? undefined,
    });
  });

  if (step.completed_at) {
    activity.push({
      id: `step-completed-${step.id}`,
      label: 'Step completed',
      actor: 'Backend',
      occurredAt: formatDateTime(step.completed_at),
    });
  }

  return activity;
}

export function normalizeProcessStatus(status: string): ProcessStatus {
  const normalized = status.toLowerCase();

  if (normalized === 'active' || normalized === 'started') {
    return 'ready';
  }

  if (normalized === 'awaiting_qaqc' || normalized === 'qa_pending') {
    return 'qa_pending';
  }

  if (normalized === 'pending') {
    return 'pending';
  }

  if (normalized === 'ready') {
    return 'ready';
  }

  if (normalized === 'blocked' || normalized === 'failed') {
    return 'blocked';
  }

  if (normalized === 'completed' || normalized === 'done') {
    return 'completed';
  }

  return 'in_progress';
}

function mapSchemaSection(value: unknown): ProcessFormSection | null {
  if (!isRecord(value) || !Array.isArray(value.fields)) {
    return null;
  }

  const id = getString(value.id, getString(value.key, getString(value.title, 'section')));

  return {
    id,
    title: getString(value.title, 'Process section'),
    description: getOptionalString(value.description),
    fields: value.fields
      .map(mapSchemaField)
      .filter((field): field is ProcessFormField => Boolean(field)),
  };
}

function mapSchemaField(value: unknown): ProcessFormField | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = getString(value.name, getString(value.key, getString(value.id, 'field')));
  const type = getString(value.type, 'text');
  const fieldType = type === 'datetime-local' ? 'datetime' : type;
  const baseField = {
    id: getString(value.id, getString(value.key, name)),
    name,
    label: getString(value.label, name),
    description: getOptionalString(value.description),
    placeholder: getOptionalString(value.placeholder),
    required: Boolean(value.required),
    readOnly: Boolean(value.readOnly || value.read_only || backendOwnedFieldNames.has(name)),
    backendOwned: Boolean(
      value.backendOwned || value.backend_owned || backendOwnedFieldNames.has(name)
    ),
    options: Array.isArray(value.options)
      ? value.options.filter(isRecord).map((option) => ({
          label: getString(option.label, getString(option.value, 'Option')),
          value: getString(option.value, getString(option.label, 'option')),
        }))
      : undefined,
  };

  if (fieldType === 'repeatable_table') {
    return {
      ...baseField,
      type: 'repeatable_table',
      minRows: getOptionalNumber(value.minRows ?? value.min_rows),
      columns: Array.isArray(value.columns)
        ? value.columns
            .map(mapSchemaField)
            .filter((field): field is Exclude<ProcessFormField, { type: 'repeatable_table' }> =>
              Boolean(field && field.type !== 'repeatable_table')
            )
        : [],
    };
  }

  if (
    fieldType === 'text' ||
    fieldType === 'number' ||
    fieldType === 'textarea' ||
    fieldType === 'select' ||
    fieldType === 'date' ||
    fieldType === 'time' ||
    fieldType === 'datetime' ||
    fieldType === 'checkbox'
  ) {
    return {
      ...baseField,
      type: fieldType,
    };
  }

  return {
    ...baseField,
    type: 'text',
  };
}

function mapRepeatableSchemaSection(value: unknown): ProcessFormSection | null {
  if (!isRecord(value) || !Array.isArray(value.columns)) {
    return null;
  }

  const key = getString(value.key, getString(value.id, 'repeatable_table'));

  return {
    id: key,
    title: getString(value.title, 'Repeatable log'),
    description: getOptionalString(value.description),
    fields: [
      {
        id: key,
        name: key,
        label: getString(value.title, 'Repeatable log'),
        type: 'repeatable_table',
        columns: value.columns
          .map(mapSchemaField)
          .filter((field): field is Exclude<ProcessFormField, { type: 'repeatable_table' }> =>
            Boolean(field && field.type !== 'repeatable_table')
          ),
      },
    ],
  };
}

function getCurrentStageLabel(status: string, stepOrder: number): string {
  const normalized = normalizeProcessStatus(status);

  if (normalized === 'qa_pending') {
    return 'Awaiting step QA/QC';
  }

  if (normalized === 'pending') {
    return `Step ${stepOrder} pending`;
  }

  if (normalized === 'ready') {
    return `Step ${stepOrder} ready to start`;
  }

  if (normalized === 'completed') {
    return `Step ${stepOrder} completed`;
  }

  return `Step ${stepOrder} in progress`;
}

function getBackendActorLabel(execution?: ProcessExecutionDto): string {
  if (execution?.verifiedBy) {
    return `Verifier #${execution.verifiedBy}`;
  }

  if (execution?.completedBy) {
    return `User #${execution.completedBy}`;
  }

  return 'Backend';
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Not updated yet';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function toFieldValue(value: unknown): ProcessFieldValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter(isRecord).map((row) => {
      return Object.entries(row).reduce<Record<string, string | number | boolean | null>>(
        (mappedRow, [key, rowValue]) => {
          mappedRow[key] =
            typeof rowValue === 'string' ||
            typeof rowValue === 'number' ||
            typeof rowValue === 'boolean' ||
            rowValue === null
              ? rowValue
              : String(rowValue);
          return mappedRow;
        },
        {}
      );
    });
  }

  return null;
}
