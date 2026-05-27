export interface DocumentUpload {
  id: number;
  module: string;
  entityId?: number | null;
  documentType: string;
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedBy?: number | null;
  createdAt: string;
}

export interface UploadDocumentsParams {
  module: string;
  entityId?: number;
  documentType: string;
  files: File[];
}
