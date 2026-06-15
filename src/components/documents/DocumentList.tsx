import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import { getDocumentSignedUrl, listDocuments } from '@/api/documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-base">Documents</CardTitle>
        {loading ? <span className="text-xs text-muted-foreground">Loading...</span> : null}
      </CardHeader>
      <CardContent className="px-4 pb-4">

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {!loading && !error && documents.length === 0 ? (
        <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
          No documents uploaded yet.
        </p>
      ) : null}

      {documents.length > 0 ? (
        <div className="space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm text-foreground"
            >
              <FileText size={16} className="shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.originalFileName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleOpen(doc.id)}
                disabled={openingId === doc.id}
              >
                <ExternalLink size={13} />
                {openingId === doc.id ? 'Opening...' : 'View'}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
