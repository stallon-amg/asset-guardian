import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { AssetStatus, ProductKind } from '@/types/inventory';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
  {
    variants: {
      status: {
        AVAILABLE: 'bg-status-available/10 text-status-available',
        ASSIGNED: 'bg-status-assigned/10 text-status-assigned',
        IN_SERVICE: 'bg-status-in-service/10 text-status-in-service',
        BROKEN: 'bg-status-broken/10 text-status-broken',
        SCRAPPED: 'bg-status-scrapped/10 text-status-scrapped',
      },
      kind: {
        ASSET: 'bg-info/10 text-info',
        CONSUMABLE: 'bg-warning/10 text-warning',
      },
    },
    defaultVariants: {
      status: 'AVAILABLE',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  showDot?: boolean;
}

const statusLabels: Record<AssetStatus, string> = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  IN_SERVICE: 'In Service',
  BROKEN: 'Broken',
  SCRAPPED: 'Scrapped',
};

const kindLabels: Record<ProductKind, string> = {
  ASSET: 'Asset',
  CONSUMABLE: 'Consumable',
};

export function StatusBadge({ status, kind, className, showDot = true }: StatusBadgeProps) {
  const label = status ? statusLabels[status] : kind ? kindLabels[kind] : '';
  
  return (
    <span className={cn(statusBadgeVariants({ status, kind }), className)}>
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}
