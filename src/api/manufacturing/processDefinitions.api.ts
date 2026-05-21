import { api } from '@/api/client';
import { unwrapApiData, type ApiResponse } from '@/api/manufacturing/apiResponse';

export type ProcessDefinitionDto = {
  id: number;
  code: string;
  name: string;
  moduleKey?: string | null;
  description?: string | null;
  defaultDepartment?: string | null;
  defaultFormSchema?: unknown;
  isManufacturingProcess: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchProcessDefinitions(): Promise<ProcessDefinitionDto[]> {
  const response = await api.get<ApiResponse<ProcessDefinitionDto[]>>('/v2/process-definitions');
  return unwrapApiData(response.data);
}

export async function fetchProcessDefinitionById(id: string): Promise<ProcessDefinitionDto> {
  const response = await api.get<ApiResponse<ProcessDefinitionDto>>(
    `/v2/process-definitions/${id}`
  );
  return unwrapApiData(response.data);
}
