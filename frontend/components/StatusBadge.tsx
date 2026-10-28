import { VisitStatus } from '@/types/visitor';

const statusConfig: Record<
  VisitStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border border-red-200',
  },
  CHECKED_IN: {
    label: 'Checked In',
    className: 'bg-green-100 text-green-800 border border-green-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-orange-100 text-orange-800 border border-orange-200',
  },
};

interface StatusBadgeProps {
  status: VisitStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
