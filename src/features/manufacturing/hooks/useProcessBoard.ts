import { useMemo } from 'react';

import type {
  LotProcessStepCard,
  ProcessDefinition,
} from '@/features/manufacturing/types/process.types';

const temporaryProcessDefinitions: ProcessDefinition[] = [
  {
    id: 'process-extraction',
    processCode: 'EXTRACTION',
    processName: 'Extraction',
    sequence: 1,
    isActive: true,
  },
  {
    id: 'process-stripping',
    processCode: 'STRIPPING',
    processName: 'Stripping',
    sequence: 2,
    isActive: true,
  },
  {
    id: 'process-purification',
    processCode: 'PURIFICATION',
    processName: 'Purification',
    sequence: 3,
    isActive: true,
  },
  {
    id: 'process-decolorisation',
    processCode: 'DECOLORISATION',
    processName: 'Decolorisation',
    sequence: 4,
    isActive: true,
  },
  {
    id: 'process-packaging',
    processCode: 'PACKAGING',
    processName: 'Packaging',
    sequence: 5,
    isActive: true,
  },
];

const temporaryProcessCards: LotProcessStepCard[] = [
  {
    stepId: 'step-ext-001',
    processDefinitionId: 'process-extraction',
    processName: 'Extraction',
    processCode: 'EXTRACTION',
    batchNumber: 'BATCH-2026-001',
    lotNumber: 'LOT-A1',
    productName: 'Kava Root Crude Extract',
    quantity: 240,
    unit: 'kg',
    status: 'in_progress',
    currentStage: 'Heating and wash log',
    lastUpdatedBy: 'Production Operator',
    lastUpdatedAt: '2026-05-15 14:20',
  },
  {
    stepId: 'step-ext-002',
    processDefinitionId: 'process-extraction',
    processName: 'Extraction',
    processCode: 'EXTRACTION',
    batchNumber: 'BATCH-2026-002',
    lotNumber: 'LOT-A2',
    productName: 'Kava Root Crude Extract',
    quantity: 180,
    unit: 'kg',
    status: 'ready',
    currentStage: 'Ready for operator update',
    lastUpdatedBy: 'System',
    lastUpdatedAt: '2026-05-15 10:05',
  },
  {
    stepId: 'step-strip-001',
    processDefinitionId: 'process-stripping',
    processName: 'Stripping',
    processCode: 'STRIPPING',
    batchNumber: 'BATCH-2026-001',
    lotNumber: 'LOT-B1',
    productName: 'Kavalactone Concentrate',
    quantity: 95,
    unit: 'kg',
    status: 'qa_pending',
    currentStage: 'Awaiting step QA/QC',
    lastUpdatedBy: 'QA Reviewer',
    lastUpdatedAt: '2026-05-15 13:45',
  },
  {
    stepId: 'step-pur-001',
    processDefinitionId: 'process-purification',
    processName: 'Purification',
    processCode: 'PURIFICATION',
    batchNumber: 'BATCH-2026-003',
    lotNumber: 'LOT-C1',
    productName: 'Purified Kava Extract',
    quantity: 72,
    unit: 'kg',
    status: 'blocked',
    currentStage: 'Supervisor review needed',
    lastUpdatedBy: 'Line Lead',
    lastUpdatedAt: '2026-05-15 09:30',
  },
];

export function useProcessBoard(processCode?: string) {
  return useMemo(() => {
    const activeProcessCode = processCode ?? temporaryProcessDefinitions[0].processCode;
    const cards = temporaryProcessCards.filter((card) => card.processCode === activeProcessCode);

    return {
      processes: temporaryProcessDefinitions,
      activeProcessCode,
      activeProcess: temporaryProcessDefinitions.find(
        (process) => process.processCode === activeProcessCode
      ),
      cards,
      isUsingMockData: true,
    };
  }, [processCode]);
}
