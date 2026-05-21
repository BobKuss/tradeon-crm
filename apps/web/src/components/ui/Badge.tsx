import { type ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-200 text-gray-600',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Domain-specific badge helpers ───────────────────────────────────────────

export function CompanyStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = { active: 'success', inactive: 'neutral', prospect: 'info' };
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
}

export function SegmentBadge({ segment }: { segment: string }) {
  const map: Record<string, Variant> = { enterprise: 'info', mid_market: 'default', smb: 'neutral' };
  const label: Record<string, string> = { mid_market: 'Mid-Market', enterprise: 'Enterprise', smb: 'SMB' };
  return <Badge variant={map[segment] ?? 'default'}>{label[segment] ?? segment}</Badge>;
}

export function DealStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    new:         'info',
    in_progress: 'warning',
    awaiting:    'neutral',
    resolved:    'success',
    cancelled:   'danger',
  };
  const label: Record<string, string> = {
    new: 'New', in_progress: 'In Progress', awaiting: 'Awaiting', resolved: 'Resolved', cancelled: 'Cancelled',
  };
  return <Badge variant={map[status] ?? 'default'}>{label[status] ?? status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, Variant> = { high: 'danger', medium: 'warning', low: 'neutral' };
  return <Badge variant={map[priority] ?? 'default'}>{priority}</Badge>;
}

export function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    open:        'info',
    in_progress: 'warning',
    done:        'success',
    cancelled:   'neutral',
  };
  const label: Record<string, string> = {
    open: 'Open', in_progress: 'In Progress', done: 'Done', cancelled: 'Cancelled',
  };
  return <Badge variant={map[status] ?? 'default'}>{label[status] ?? status}</Badge>;
}
