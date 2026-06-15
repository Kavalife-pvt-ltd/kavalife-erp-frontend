import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchProcessDefinitions } from '@/api/manufacturing/processDefinitions.api';
import {
  fetchActiveLotProcessSteps,
  fetchProcessStepBoard,
} from '@/api/manufacturing/lotProcessSteps.api';
import type {
  LotProcessStepCard,
  ProcessDefinition,
} from '@/features/manufacturing/types/process.types';
import {
  mapActiveStepToCard,
  mapBoardCardToCard,
  mapProcessDefinition,
} from '@/features/manufacturing/utils/processAdapters';

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
];

type ProcessBoardState = {
  processes: ProcessDefinition[];
  cards: LotProcessStepCard[];
  isLoading: boolean;
  error?: string;
  isUsingMockData: boolean;
};

export function useProcessBoard(filters: { processCode?: string; status?: string; search?: string } = {}) {
  const [state, setState] = useState<ProcessBoardState>({
    processes: temporaryProcessDefinitions,
    cards: temporaryProcessCards,
    isLoading: true,
    isUsingMockData: true,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProcessBoard() {
      setState((currentState) => ({ ...currentState, isLoading: true, error: undefined }));

      try {
        const definitionDtos = await fetchProcessDefinitions();
        let cards: LotProcessStepCard[];

        try {
          const boardCards = await fetchProcessStepBoard({
            processCode: filters.processCode,
            status: filters.status === 'ready' ? 'active' : filters.status,
            search: filters.search,
            limit: 100,
            sortBy: 'lastUpdatedAt',
            sortOrder: 'desc',
          });
          cards = boardCards.map(mapBoardCardToCard);
        } catch {
          const activeSteps = await fetchActiveLotProcessSteps();
          cards = activeSteps.map(mapActiveStepToCard);
        }

        if (!isMounted) {
          return;
        }

        const processes = definitionDtos
          .filter((definition) => definition.isManufacturingProcess && definition.isActive)
          .map((definition, index) => mapProcessDefinition(definition, index + 1));

        setState({
          processes: processes.length > 0 ? processes : temporaryProcessDefinitions,
          cards,
          isLoading: false,
          isUsingMockData: processes.length === 0,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          processes: temporaryProcessDefinitions,
          cards: temporaryProcessCards,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load manufacturing board',
          isUsingMockData: true,
        });
      }
    }

    void loadProcessBoard();

    return () => {
      isMounted = false;
    };
  }, [filters.processCode, filters.status, filters.search, refreshKey]);

  return useMemo(() => {
    const activeProcessCode = filters.processCode ?? state.processes[0]?.processCode ?? '';
    const normalizedActiveProcessCode = activeProcessCode.toLowerCase();
    
    // Client-side filtering as fallback if API doesn't filter perfectly
    let cards = state.cards;
    
    if (filters.processCode) {
      cards = cards.filter((card) => card.processCode.toLowerCase() === normalizedActiveProcessCode);
    }
    
    if (filters.status) {
      cards = cards.filter((card) => card.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      cards = cards.filter((card) => 
        card.batchNumber.toLowerCase().includes(searchLower) ||
        card.lotNumber.toLowerCase().includes(searchLower) ||
        card.processName.toLowerCase().includes(searchLower)
      );
    }

    return {
      processes: state.processes,
      activeProcessCode,
      activeProcess: state.processes.find(
        (process) => process.processCode.toLowerCase() === normalizedActiveProcessCode
      ),
      cards,
      isLoading: state.isLoading,
      error: state.error,
      isUsingMockData: state.isUsingMockData,
      refresh,
    };
  }, [filters.processCode, filters.status, filters.search, state, refresh]);
}
