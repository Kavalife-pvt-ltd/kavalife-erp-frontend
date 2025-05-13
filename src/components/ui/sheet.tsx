// components/ui/sheet.tsx
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/utils/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

// Define supported directions
type SheetSide = 'left' | 'right' | 'top' | 'bottom';

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: SheetSide;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = 'left', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 z-40" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out focus:outline-none',
        side === 'left' && 'inset-y-0 left-0 w-64 transform translate-x-0',
        side === 'right' && 'inset-y-0 right-0 w-64 transform translate-x-0',
        side === 'top' && 'inset-x-0 top-0 h-64 transform translate-y-0',
        side === 'bottom' && 'inset-x-0 bottom-0 h-64 transform translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
