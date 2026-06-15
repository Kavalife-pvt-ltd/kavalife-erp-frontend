import { CheckCircle2, ClipboardCheck, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ProcessActionBarProps = {
  onCreateProcess?: () => void;
  onSaveProgress?: () => void;
  onCompleteStage?: () => void;
  onCompleteProcess?: () => void;
  isSaving?: boolean;
  isCreating?: boolean;
};

export function ProcessActionBar({
  onCreateProcess,
  onSaveProgress,
  onCompleteStage,
  onCompleteProcess,
  isSaving = false,
  isCreating = false,
}: ProcessActionBarProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-stroke bg-background px-3 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:justify-end">
        {onCreateProcess ? (
          <Button
            type="button"
            size="lg"
            className="min-h-12 text-base"
            disabled={isCreating}
            onClick={onCreateProcess}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isCreating ? 'Creating Process...' : 'Create Process'}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="min-h-12 text-base"
              disabled={!onSaveProgress || isSaving}
              onClick={onSaveProgress}
            >
              <Save className="mr-2 h-5 w-5" />
              Save Progress
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-12 text-base"
              disabled={!onCompleteStage}
              onClick={onCompleteStage}
            >
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Complete Stage
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-h-12 text-base"
              disabled={!onCompleteProcess}
              onClick={onCompleteProcess}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Complete Process
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
