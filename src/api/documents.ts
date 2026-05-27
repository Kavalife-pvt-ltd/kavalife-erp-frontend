import { api } from '@/api/client';
import type { DocumentUpload, UploadDocumentsParams } from '@/types/documents';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
};

type ListDocumentsParams = {
  module: string;
  entityId: number;
};

type DocumentCollection = DocumentUpload[] | DocumentUpload;

type ListDocumentsData = {
  document?: DocumentCollection;
  documents?: DocumentCollection;
};

type ListDocumentsResponse = {
  data?: ListDocumentsData;
} & ListDocumentsData;

type SignedUrlResponse = {
  url: string;
};

const unwrapData = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.details ?? envelope.error ?? envelope.message ?? 'Request failed');
    }
    return envelope.data as T;
  }

  return payload as T;
};

export async function uploadDocuments(params: UploadDocumentsParams): Promise<DocumentUpload[]> {
  const formData = new FormData();
  formData.append('module', params.module);
  formData.append('documentType', params.documentType);

  if (typeof params.entityId === 'number') {
    formData.append('entityId', String(params.entityId));
  }

  params.files.forEach((file) => {
    formData.append('files', file);
  });

  const resp = await api.post<ApiEnvelope<DocumentUpload[]> | DocumentUpload[]>(
    '/documents/upload',
    formData,
    {
      withCredentials: true,
    }
  );

  const payload = unwrapData<DocumentUpload[]>(resp.data);
  return Array.isArray(payload) ? payload : [];
}

export async function listDocuments(params: ListDocumentsParams): Promise<DocumentUpload[]> {
  const resp = await api.get<ListDocumentsResponse>('/documents', {
    params: {
      module: params.module,
      entityId: params.entityId,
    },
    withCredentials: true,
  });

  const normalizeDocuments = (value?: DocumentCollection): DocumentUpload[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const nestedDocument = normalizeDocuments(resp.data.data?.document);
  if (nestedDocument.length > 0) return nestedDocument;

  const nestedDocuments = normalizeDocuments(resp.data.data?.documents);
  if (nestedDocuments.length > 0) return nestedDocuments;

  const topLevelDocument = normalizeDocuments(resp.data.document);
  if (topLevelDocument.length > 0) return topLevelDocument;

  return normalizeDocuments(resp.data.documents);
}

export async function getDocumentSignedUrl(id: number): Promise<string> {
  const resp = await api.get<ApiEnvelope<SignedUrlResponse> | SignedUrlResponse>(
    `/documents/${id}/url`,
    {
      withCredentials: true,
    }
  );

  return unwrapData<SignedUrlResponse>(resp.data).url;
}
