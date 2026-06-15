import { useNavigate } from 'react-router-dom';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProcessDefinition } from '@/features/manufacturing/types/process.types';
import { manufacturingRoutes } from '@/features/manufacturing/utils/processRoutes';

type ProcessTabsProps = {
  processes: ProcessDefinition[];
  activeProcessCode: string;
};

export function ProcessTabs({ processes, activeProcessCode }: ProcessTabsProps) {
  const navigate = useNavigate();

  return (
    <Tabs
      value={activeProcessCode}
      onValueChange={(processCode) => navigate(manufacturingRoutes.boardForProcess(processCode))}
    >
      <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-md bg-secondary p-1">
        {processes.map((process) => (
          <TabsTrigger
            key={process.id}
            value={process.processCode}
            className="min-h-11 shrink-0 px-4 text-base"
          >
            {process.processName}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
