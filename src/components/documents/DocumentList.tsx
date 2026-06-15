import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import { getDocumentSignedUrl, listDocuments } from '@/api/documents';
import type { DocumentUpload } from '@/types/documents';

type Props = {
  module: string;
  entityId: number;
  refreshKey?: number;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  return 'Failed to load documents';
};

const DocumentList: React.FC<Props> = ({ module, entityId, refreshKey = 0 }) => {
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const docs = await listDocuments({ module, entityId });

        if (!cancelled) setDocuments(docs);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = getErrorMessage(err);
        setError(message);
        setDocuments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [entityId, module, refreshKey]);

  const handleOpen = async (documentId: number) => {
    try {
      setOpeningId(documentId);
      const url = await getDocumentSignedUrl(documentId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <section className="rounded-xl border border-stroke bg-foreground p-4 shadow-custom">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-primaryText">Documents</h3>
        {loading ? <span className="text-[11px] text-primaryText/60">Loading...</span> : null}
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      {!loading && !error && documents.length === 0 ? (
        <p className="rounded-md bg-background px-3 py-2 text-xs text-primaryText/60">
          No documents uploaded yet.
        </p>
      ) : null}

      {documents.length > 0 ? (
        <div className="space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-md bg-background px-3 py-2 text-xs text-primaryText"
            >
              <FileText size={16} className="shrink-0 text-primaryText/60" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.originalFileName}</p>
                <p className="text-[11px] text-primaryText/60">{formatDate(doc.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleOpen(doc.id)}
                disabled={openingId === doc.id}
                className="inline-flex items-center gap-1 rounded-lg border border-stroke bg-foreground px-2 py-1 text-[11px] font-medium text-primaryText hover:bg-stroke/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ExternalLink size={13} />
                {openingId === doc.id ? 'Opening...' : 'View'}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default DocumentList;
