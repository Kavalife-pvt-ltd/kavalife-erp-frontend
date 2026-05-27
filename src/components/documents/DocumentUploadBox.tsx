import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { uploadDocuments } from '@/api/documents';
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
    <section className="rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-primaryText">{title}</h3>
          <p className="text-xs text-primaryText/60">PDF, PNG, JPG, JPEG, or WEBP</p>
        </div>

        {files.length > 0 ? (
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stroke bg-background text-primaryText/60 hover:bg-stroke/30 hover:text-primaryText disabled:opacity-60"
            disabled={isDisabled}
            aria-label="Clear selected documents"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      <label
        className={[
          'flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-stroke bg-background p-4 text-center transition-colors',
          isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-stroke/20',
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
        <Upload size={22} className="mb-2 text-primaryText/60" />
        <span className="text-xs font-medium text-primaryText">Choose files</span>
        <span className="mt-1 text-[11px] text-primaryText/60">Multiple documents supported</span>
      </label>

      {files.length > 0 ? (
        <div className="mt-3 space-y-1">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5 text-xs text-primaryText"
            >
              <FileText size={14} className="shrink-0 text-primaryText/60" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-[11px] text-primaryText/50">
                {(file.size / 1024).toFixed(file.size >= 1024 * 1024 ? 0 : 1)} KB
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={isDisabled || files.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload size={14} />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </section>
  );
};

export default DocumentUploadBox;
