import { CheckCircle2, ClipboardCheck, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ProcessActionBarProps = {
  onSaveProgress?: () => void;
  onCompleteStage?: () => void;
  onCompleteProcess?: () => void;
  isSaving?: boolean;
};

export function ProcessActionBar({
  onSaveProgress,
  onCompleteStage,
  onCompleteProcess,
  isSaving = false,
}: ProcessActionBarProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="min-h-12 text-base"
          disabled={!onSaveProgress || isSaving}
          onClick={onSaveProgress}
        >
          <Save className="h-5 w-5" />
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
          <ClipboardCheck className="h-5 w-5" />
          Complete Stage
        </Button>
        <Button
          type="button"
          size="lg"
          className="min-h-12 text-base"
          disabled={!onCompleteProcess}
          onClick={onCompleteProcess}
        >
          <CheckCircle2 className="h-5 w-5" />
          Complete Process
        </Button>
      </div>
    </div>
  );
}
