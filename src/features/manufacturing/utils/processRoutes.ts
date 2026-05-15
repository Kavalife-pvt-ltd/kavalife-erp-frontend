export const manufacturingRoutes = {
  board: '/manufacturing/processes',
  boardForProcess: (processCode: string) => `/manufacturing/processes/${processCode}`,
  workspace: (stepId: string) => `/manufacturing/workspace/${stepId}`,
  batchHistory: (batchId: string) => `/manufacturing/batches/${batchId}/history`,
};
