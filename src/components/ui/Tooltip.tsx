// components/ui/Tooltip.tsx
import { ReactNode } from 'react';

type TooltipProps = {
  label: string;
  children: ReactNode;
};

const Tooltip = ({ label, children }: TooltipProps) => (
  <div className="relative group">
    {children}
    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:flex bg-black text-white text-xs px-2 py-1 rounded shadow z-50 whitespace-nowrap">
      {label}
    </span>
  </div>
);

export default Tooltip;
