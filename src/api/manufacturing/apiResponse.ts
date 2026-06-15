export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: unknown;
  error?: {
    code: string;
    details?: unknown;
  };
};

export function unwrapApiData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message || 'API request failed');
  }

  return response.data;
}
