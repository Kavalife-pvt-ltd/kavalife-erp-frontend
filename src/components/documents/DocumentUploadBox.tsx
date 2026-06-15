import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { uploadDocuments } from '@/api/documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DocumentUpload } from '@/types/documents';

type Props = {
  module: string;
  entityId?: number;
  documentType: string;
  title?: string;
  disabled?: boolean;
  onUploaded?: (docs: DocumentUpload[]) => void;
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  return 'Failed to upload documents';
};

const DocumentUploadBox: React.FC<Props> = ({
  module,
  entityId,
  documentType,
  title = 'Upload documents',
  disabled = false,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const isDisabled = disabled || uploading;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setFiles(selected);
  };

  const clearSelection = () => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Select at least one document');
      return;
    }

    try {
      setUploading(true);
      const docs = await uploadDocuments({
        module,
        entityId,
        documentType,
        files,
      });

      toast.success(files.length === 1 ? 'Document uploaded' : 'Documents uploaded');
      clearSelection();
      onUploaded?.(docs);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPG, JPEG, or WEBP</p>
        </div>

        {files.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearSelection}
            disabled={isDisabled}
            aria-label="Clear selected documents"
          >
            <X size={15} />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <label
          className={[
            'flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-background p-4 text-center transition-colors',
            isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-secondary',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isDisabled}
          />
          <Upload size={22} className="mb-2 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Choose files</span>
          <span className="mt-1 text-xs text-muted-foreground">Multiple documents supported</span>
        </label>

        {files.length > 0 ? (
          <div className="mt-3 space-y-1">
            {files.map((file) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <FileText size={14} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(file.size >= 1024 * 1024 ? 0 : 1)} KB
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isDisabled || files.length === 0}
          >
            <Upload size={14} />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadBox;
